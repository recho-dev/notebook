import {noop, defer, defaultGlobal} from "./utils.ts";
import {RuntimeError} from "./errors.ts";
import {Module} from "./module.ts";
import {Variable, type ObserverInput} from "./variable.ts";

const frame: (callback: (value: unknown) => void) => void =
  typeof requestAnimationFrame === "function"
    ? requestAnimationFrame
    : typeof setImmediate === "function"
      ? setImmediate
      : (f: FrameRequestCallback) => setTimeout(f, 0);

export type Builtins = Record<string, unknown>;
export type GlobalFunction = (name: string) => unknown;
export type ModuleDefinition = (runtime: Runtime, observer: (name?: string) => ObserverInput) => Module;

/**
 * Runtime manages the reactive computation graph.
 *
 * The Runtime is responsible for:
 * - Scheduling and executing variable computations in topological order
 * - Tracking variable dependencies and reachability
 * - Managing modules and their variables
 * - Handling invalidation and recomputation
 */
export class Runtime {
  // Read-only cross-class access (getters only)
  private _builtin: Module;
  private _global: GlobalFunction;

  // Modifiable cross-class access (getters and setters)
  private _dirty: Set<Variable>;
  private _updates: Set<Variable>;
  private _precomputes: Array<() => void>;
  private _computing: Promise<void> | null;
  private _init: Module | null;
  private _modules: Map<ModuleDefinition, Module>;
  private _variables: Set<Variable>;
  private _disposed: boolean;

  // Getters for read-only cross-class members
  get builtin(): Module {
    return this._builtin;
  }

  get global(): GlobalFunction {
    return this._global;
  }

  // Getters for modifiable cross-class members (collections accessed via .add(), .delete(), etc.)
  get dirty(): Set<Variable> {
    return this._dirty;
  }

  get updates(): Set<Variable> {
    return this._updates;
  }

  get variables(): Set<Variable> {
    return this._variables;
  }

  /**
   * Creates a new Runtime instance.
   *
   * @param builtins - Optional object containing builtin variables to make available to all modules
   * @param global - Function to resolve global variable names (defaults to window/globalThis lookup)
   */
  constructor(builtins?: Builtins | null, global: GlobalFunction = defaultGlobal) {
    const builtin = new Module(this);

    this._dirty = new Set();
    this._updates = new Set();
    this._precomputes = [];
    this._computing = null;
    this._init = null;
    this._modules = new Map();
    this._variables = new Set();
    this._disposed = false;
    this._builtin = builtin;
    this._global = global;

    if (builtins) {
      for (const name in builtins) {
        new Variable(Variable.Type.IMPLICIT, builtin).define(name, [], builtins[name]);
      }
    }
  }

  /**
   * Schedules a callback to run before the next computation cycle.
   *
   * @param callback - Function to execute before computing variables
   * @internal
   */
  _precompute(callback: () => void): void {
    this._precomputes.push(callback);
    this.compute();
  }

  /**
   * Triggers a computation cycle to update all dirty variables.
   *
   * The computation is scheduled asynchronously and returns a promise that resolves
   * when the computation is complete. Multiple calls to compute() during the same
   * frame will return the same promise.
   *
   * @returns Promise that resolves when computation is complete
   */
  compute(): Promise<void> {
    return this._computing || (this._computing = this._computeSoon());
  }

  /** For compatibility of tests only. */
  private _compute(): Promise<void> {
    return this.compute();
  }

  /**
   * Schedules computation to occur in the next animation frame.
   *
   * @returns Promise that resolves when computation is complete
   */
  private async _computeSoon(): Promise<void> {
    await new Promise(frame);
    if (!this._disposed) {
      await this._computeNow();
    }
  }

  /**
   * Executes a complete computation cycle.
   *
   * This method:
   * 1. Runs any pending precompute callbacks
   * 2. Updates reachability status for all dirty variables
   * 3. Computes variables in topological order based on dependencies
   * 4. Detects and reports circular dependencies
   *
   * Variables are computed in dependency order using a queue with indegree tracking.
   */
  private async _computeNow(): Promise<void> {
    const queue: Variable[] = [];
    let variable: Variable | undefined;
    const precomputes = this._precomputes;

    if (precomputes.length) {
      this._precomputes = [];
      for (const callback of precomputes) callback();
      await defer(3);
    }

    const variables = new Set(this._dirty);
    variables.forEach((variable) => {
      variable.inputs.forEach(variables.add, variables);
      const reachable = variable.isReachable();
      // Boolean comparison: true > false detects became reachable, false < true detects became unreachable
      if (reachable > variable.reachable) {
        // Variable became reachable: schedule for computation
        this._updates.add(variable);
      } else if (reachable < variable.reachable) {
        // Variable became unreachable: invalidate to clean up pending computations
        variable.invalidate();
      }
      variable.reachable = reachable;
    });

    const updates = new Set(this._updates);
    updates.forEach((variable) => {
      if (variable.reachable) {
        variable.indegree = 0;
        variable.outputs.forEach(updates.add, updates);
      } else {
        variable.indegree = NaN;
        updates.delete(variable);
      }
    });

    this._computing = null;
    this._updates.clear();
    this._dirty.clear();

    updates.forEach((variable) => {
      variable.outputs.forEach((v) => v.incrementIndegree());
    });

    do {
      updates.forEach((variable) => {
        if (variable.indegree === 0) {
          queue.push(variable);
        }
      });

      while ((variable = queue.pop())) {
        variable.compute();
        variable.outputs.forEach(postqueue);
        updates.delete(variable);
      }

      updates.forEach((variable) => {
        if (variable.isCircular) {
          variable.setError(new RuntimeError("circular definition"));
          variable.outputs.forEach((v) => v.decrementIndegree());
          updates.delete(variable);
        }
      });
    } while (updates.size);

    function postqueue(variable: Variable): void {
      variable.decrementIndegree();
      if (variable.indegree === 0) {
        queue.push(variable);
      }
    }
  }

  /**
   * Disposes the runtime and invalidates all variables.
   *
   * After disposal, no further computations will occur and all variables
   * will be invalidated. Generators will be terminated.
   */
  dispose(): void {
    this._computing = Promise.resolve();
    this._disposed = true;
    this._variables.forEach((v) => {
      v.invalidate();
      v.version = NaN;
    });
  }

  /**
   * Creates or retrieves a module.
   *
   * When called with no arguments, creates a new empty module.
   *
   * When called with a module definition function, creates a new module and executes
   * the definition. If the same definition has been used before, returns the existing module.
   *
   * @param define - Optional module definition function
   * @param observer - Optional observer factory for variable notifications
   * @returns The created or existing module
   */
  module(): Module;
  module(define: ModuleDefinition, observer?: (name?: string) => ObserverInput): Module;
  module(define?: ModuleDefinition, observer: (name?: string) => ObserverInput = noop as () => undefined): Module {
    let module: Module;

    if (define === undefined) {
      if ((module = this._init!)) {
        this._init = null;
        return module;
      }
      return new Module(this);
    }

    module = this._modules.get(define)!;
    if (module) return module;

    this._init = module = new Module(this);
    this._modules.set(define, module);
    try {
      define(this, observer);
    } finally {
      this._init = null;
    }
    return module;
  }
}
