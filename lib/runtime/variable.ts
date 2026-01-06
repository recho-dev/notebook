// Originally developed by Observable, Inc.
// Adapted and modified by Recho from @observablehq/runtime v6.0.0
// Copyright 2018-2024 Observable, Inc.
// Copyright 2025-2026 Recho
// ISC License

import {map, constant, identity, noop, generatorish, generatorReturn} from "./utils.ts";
import {RuntimeError} from "./errors.ts";
import type {Module} from "./module.ts";

export enum VariableType {
  NORMAL = 1,
  IMPLICIT = 2,
  DUPLICATE = 3,
}

export const no_observer = Symbol("no-observer");
export const no_value = Promise.resolve();

export interface Observer {
  pending?(): void;
  fulfilled?(value: unknown, name?: string | null): void;
  rejected?(error: unknown, name?: string | null): void;
  _node?: Element;
}

/**
 * A default observer that does nothing.
 */
const defaultObserver: Observer = {
  pending: noop,
  fulfilled: noop,
  rejected: noop,
};

export interface VariableOptions {
  shadow?: Record<string, unknown>;
}

export type ObserverInput = boolean | Observer | typeof no_observer | null | undefined;

export type VariableDefinition = (...args: unknown[]) => unknown;

export type VariableDefineParameters =
  | [definition: unknown]
  | [name: string | null, definition: unknown]
  | [inputs: ArrayLike<string>, definition: unknown]
  | [name: string | null, inputs: ArrayLike<string>, definition: unknown];

function variable_undefined(): never {
  throw variable_undefined;
}

export function variable_stale(): never {
  throw variable_stale;
}

/**
 * Variable represents a reactive cell in the computation graph.
 *
 * Variables track their dependencies (inputs), dependents (outputs), and manage
 * their computation lifecycle. They can be normal variables, implicit variables
 * (for imports), or duplicate markers (for name conflicts).
 *
 * Key features:
 * - Lazy evaluation: only computes when reachable (has observers)
 * - Automatic invalidation and recomputation when inputs change
 * - Support for synchronous values, promises, generators, and async generators
 * - Dependency tracking for topological ordering
 */
export class Variable {
  /** Variable type enumeration (NORMAL, IMPLICIT, DUPLICATE) */
  static readonly Type: typeof VariableType = VariableType;
  /** Symbol used to access the variable instance itself */
  static readonly VARIABLE = Symbol("variable");
  /** Symbol used to access the invalidation promise */
  static readonly INVALIDATION = Symbol("invalidation");
  /** Symbol used to access visibility tracking */
  static readonly VISIBILITY = Symbol("visibility");

  // Read-only cross-class access (getters only)
  private _observer: Observer | typeof no_observer;
  private _definition: VariableDefinition;
  private _duplicate?: VariableDefinition;
  private _duplicates?: Set<Variable>;
  private _inputs: Variable[];
  private _module: Module;
  private _outputs: Set<Variable>;
  private _type: number;
  private _rejector: (error: unknown) => never;
  private _shadow: Map<string, Variable> | null;

  // Modifiable cross-class access (getters and setters)
  private _indegree: number;
  private _invalidate: () => void;
  private _name: string | null;
  private _promise: Promise<unknown>;
  private _reachable: boolean;
  private _value: unknown;
  private _version: number;

  // Getters for read-only cross-class members
  get observer(): Observer | symbol {
    return this._observer;
  }

  get definition(): VariableDefinition {
    return this._definition;
  }

  get duplicate(): VariableDefinition | undefined {
    return this._duplicate;
  }

  get duplicates(): Set<Variable> | undefined {
    return this._duplicates;
  }

  get inputs(): Variable[] {
    return this._inputs;
  }

  get module(): Module {
    return this._module;
  }

  get outputs(): Set<Variable> {
    return this._outputs;
  }

  get type(): number {
    return this._type;
  }

  get rejector(): (error: unknown) => never {
    return this._rejector;
  }

  // Getters and setters for modifiable cross-class members
  get indegree(): number {
    return this._indegree;
  }

  set indegree(value: number) {
    this._indegree = value;
  }

  get invalidate(): () => void {
    return this._invalidate;
  }

  get name(): string | null {
    return this._name;
  }

  set name(value: string | null) {
    this._name = value;
  }

  get promise(): Promise<unknown> {
    return this._promise;
  }

  get reachable(): boolean {
    return this._reachable;
  }

  set reachable(value: boolean) {
    this._reachable = value;
  }

  get value(): unknown {
    return this._value;
  }

  get version(): number {
    return this._version;
  }

  set version(value: number) {
    this._version = value;
  }

  /**
   * Creates a new Variable instance.
   *
   * @param type - The type of variable (NORMAL, IMPLICIT, or DUPLICATE)
   * @param module - The module this variable belongs to
   * @param observer - Optional observer for notifications (true creates default observer, false/undefined means no observer)
   * @param options - Optional configuration including shadow variables
   */
  constructor(type: VariableType, module: Module, observer?: ObserverInput, options?: VariableOptions) {
    if (observer === true) {
      observer = defaultObserver;
    } else if (!observer) {
      observer = no_observer;
    }

    this._observer = observer;
    this._definition = variable_undefined;
    this._duplicate = undefined;
    this._duplicates = undefined;
    this._indegree = NaN;
    this._inputs = [];
    this._invalidate = noop;
    this._module = module;
    this._name = null;
    this._outputs = new Set();
    this._promise = no_value;
    this._reachable = observer !== no_observer;
    this._rejector = this._createRejector();
    this._shadow = this._initShadow(options);
    this._type = type;
    this._value = undefined;
    this._version = 0;
  }

  /**
   * Notifies the observer that computation is pending.
   *
   * @internal
   */
  _pending(): void {
    if (this._observer !== no_observer && typeof this._observer.pending === "function") {
      this._observer.pending!();
    }
  }

  /**
   * Notifies the observer that a value was successfully computed.
   *
   * @param value - The computed value
   * @internal
   */
  _fulfilled(value: unknown): void {
    if (this._observer !== no_observer && typeof this._observer.fulfilled === "function") {
      this._observer.fulfilled!(value, this._name);
    }
  }

  /**
   * Notifies the observer that an error occurred during computation.
   *
   * @param error - The error that occurred
   * @internal
   */
  _rejected(error: unknown): void {
    if (this._observer !== no_observer && typeof this._observer.rejected === "function") {
      this._observer.rejected!(error, this._name);
    }
  }

  /**
   * Resolves a variable name to a Variable instance.
   *
   * Resolution order: shadow variables, module scope, module resolver.
   *
   * @param name - The variable name to resolve
   * @returns The resolved Variable instance
   * @internal
   */
  _resolve(name: string): Variable {
    return this._shadow?.get(name) ?? this._module.scope.get(name) ?? this._module._resolve(name);
  }

  /**
   * Initializes shadow variables from options.
   *
   * Shadow variables override normal variable resolution for this variable's scope.
   *
   * @param options - Variable options containing shadow definitions
   * @returns Map of shadow variables or null
   */
  private _initShadow(options?: VariableOptions): Map<string, Variable> | null {
    if (!options?.shadow) return null;
    return new Map(
      Object.entries(options.shadow).map(([name, definition]) => [
        name,
        new Variable(Variable.Type.IMPLICIT, this._module).define([], definition),
      ]),
    );
  }

  /**
   * Attaches this variable as a dependent (output) of another variable.
   *
   * Marks the input variable as dirty and adds this variable to its outputs.
   *
   * @param variable - The input variable to attach to
   */
  private _attach(variable: Variable): void {
    variable.module.runtime.dirty.add(variable);
    variable._outputs.add(this);
  }

  /**
   * Detaches this variable from being a dependent (output) of another variable.
   *
   * Marks the input variable as dirty and removes this variable from its outputs.
   *
   * @param variable - The input variable to detach from
   */
  private _detach(variable: Variable): void {
    variable.module.runtime.dirty.add(variable);
    variable._outputs.delete(this);
  }

  /**
   * Creates a function that wraps errors into RuntimeError instances.
   *
   * @returns Function that converts errors to RuntimeError
   */
  private _createRejector(): (error: unknown) => never {
    return (error: unknown): never => {
      if (error === variable_stale) throw error;
      if (error === variable_undefined) throw new RuntimeError(`${this._name} is not defined`, this._name ?? undefined);
      if (error instanceof Error && error.message) throw new RuntimeError(error.message, this._name ?? undefined);
      throw new RuntimeError(`${this._name} could not be resolved`, this._name ?? undefined);
    };
  }

  /**
   * Creates a function that throws a duplicate definition error.
   *
   * @param name - The name that is duplicated
   * @returns Function that throws the duplicate error
   */
  private _createDuplicate(name: string): () => never {
    return (): never => {
      throw new RuntimeError(`${name} is defined more than once`);
    };
  }

  /**
   * Internal implementation of variable definition.
   *
   * This method handles:
   * - Updating input dependencies
   * - Managing variable naming and scope
   * - Detecting and handling duplicate definitions
   * - Creating implicit variables for missing references
   * - Scheduling recomputation
   *
   * @param name - Variable name (null for anonymous)
   * @param inputs - Array of input dependencies
   * @param definition - The definition function
   * @returns This variable instance for chaining
   */
  private _defineImpl(name: string | null, inputs: Variable[], definition: VariableDefinition): this {
    const scope = this._module.scope;
    const runtime = this._module.runtime;

    this._inputs.forEach(this._detach, this);
    inputs.forEach(this._attach, this);
    this._inputs = inputs;
    this._definition = definition;
    this._value = undefined;

    if (definition === noop) runtime.variables.delete(this);
    else runtime.variables.add(this);

    if (name !== this._name || scope.get(name!) !== this) {
      let error: Variable | undefined;
      let found: Variable | undefined;

      if (this._name) {
        if (this._outputs.size) {
          scope.delete(this._name);
          found = this._module._resolve(this._name);
          found._outputs = this._outputs;
          this._outputs = new Set();
          found._outputs.forEach(function (this: Variable, output: Variable) {
            output._inputs[output._inputs.indexOf(this)] = found!;
          }, this);
          found._outputs.forEach(runtime.updates.add, runtime.updates);
          runtime.dirty.add(found).add(this);
          scope.set(this._name, found);
        } else if ((found = scope.get(this._name)) === this) {
          scope.delete(this._name);
        } else if (found && found._type === Variable.Type.DUPLICATE) {
          found._duplicates!.delete(this);
          this._duplicate = undefined;
          if (found._duplicates!.size === 1) {
            const newFound = found._duplicates!.keys().next().value as Variable;
            error = scope.get(this._name);
            newFound._outputs = error!._outputs;
            error!._outputs = new Set();
            newFound._outputs.forEach(function (output: Variable) {
              output._inputs[output._inputs.indexOf(error!)] = newFound;
            });
            newFound._definition = newFound._duplicate!;
            newFound._duplicate = undefined;
            runtime.dirty.add(error!).add(newFound);
            runtime.updates.add(newFound);
            scope.set(this._name, newFound);
          }
        } else {
          throw new Error("Unexpected state");
        }
      }

      if (this._outputs.size) throw new Error("Cannot rename variable with outputs");

      if (name) {
        found = scope.get(name);
        if (found) {
          if (found._type === Variable.Type.DUPLICATE) {
            this._definition = this._createDuplicate(name);
            this._duplicate = definition;
            found._duplicates!.add(this);
          } else if (found._type === Variable.Type.IMPLICIT) {
            this._outputs = found._outputs;
            found._outputs = new Set();
            this._outputs.forEach(function (this: Variable, output: Variable) {
              output._inputs[output._inputs.indexOf(found!)] = this;
            }, this);
            runtime.dirty.add(found).add(this);
            scope.set(name, this);
          } else {
            found._duplicate = found._definition;
            this._duplicate = definition;
            error = new Variable(Variable.Type.DUPLICATE, this._module);
            error._name = name;
            error._definition = this._definition = found._definition = this._createDuplicate(name);
            error._outputs = found._outputs;
            found._outputs = new Set();
            error._outputs.forEach(function (output: Variable) {
              output._inputs[output._inputs.indexOf(found!)] = error!;
            });
            error._duplicates = new Set([this, found]);
            runtime.dirty.add(found).add(error);
            runtime.updates.add(found).add(error);
            scope.set(name, error);
          }
        } else {
          scope.set(name, this);
        }
      }

      this._name = name;
    }

    if (this._version > 0) ++this._version;

    runtime.updates.add(this);
    runtime.compute();
    return this;
  }

  /**
   * Defines or redefines this variable with a new value or computation.
   *
   * This method supports multiple overloads:
   * - `define(value)` - Anonymous constant or function
   * - `define(name, value)` - Named constant or function
   * - `define(inputs, definition)` - Anonymous variable with dependencies
   * - `define(name, inputs, definition)` - Named variable with dependencies
   *
   * When a function is provided, it will be called with the resolved values of the inputs.
   * When a non-function value is provided, it's treated as a constant.
   *
   * @param args - Variable arguments matching one of the overload signatures
   * @returns This variable instance for chaining
   */
  define(definition: unknown): this;
  define(name: string | null, definition: unknown): this;
  define(inputs: ArrayLike<string>, definition: unknown): this;
  define(name: string | null, inputs: ArrayLike<string>, definition: unknown): this;
  define(...args: VariableDefineParameters): this {
    let name: string | null = null;
    let inputs: Variable[] | null = null;
    let def: unknown;

    if (args.length === 1) {
      // define(definition)
      def = args[0];
    } else if (args.length === 2) {
      // define(name, definition) or define(inputs, definition)
      def = args[1];
      if (typeof args[0] === "string" || args[0] === null) {
        name = args[0];
      } else {
        inputs = map(args[0], this._resolve, this) as Variable[];
      }
    } else if (args.length === 3) {
      // define(name, inputs, definition)
      name = args[0] == null ? null : String(args[0]);
      inputs = map(args[1], this._resolve, this) as Variable[];
      def = args[2];
    } else {
      throw new Error("Invalid arguments");
    }

    if (name != null) name = String(name);
    if (inputs == null) inputs = [];

    return this._defineImpl(name, inputs, typeof def === "function" ? (def as VariableDefinition) : constant(def));
  }

  /**
   * Imports a variable from another module.
   *
   * Supports two forms:
   * - `import(name, module)` - Import with same name
   * - `import(remoteName, localName, module)` - Import with alias
   *
   * @param remote - The name of the variable in the remote module
   * @param nameOrModule - Either the local alias name or the module to import from
   * @param module - The module to import from (when using alias form)
   * @returns This variable instance for chaining
   */
  import(remote: string, module: Module): this;
  import(remote: string, name: string, module: Module): this;
  import(remote: string, nameOrModule: string | Module, module?: Module): this {
    if (arguments.length < 3) {
      module = nameOrModule as Module;
      return this._defineImpl(String(remote), [module._resolve(String(remote))], identity);
    }
    const name = nameOrModule as string;
    return this._defineImpl(String(name), [module!._resolve(String(remote))], identity);
  }

  /**
   * Deletes this variable, removing it from the computation graph.
   *
   * @returns This variable instance for chaining
   */
  delete(): this {
    return this._defineImpl(null, [], noop);
  }

  /**
   * Checks if this variable has a circular dependency.
   *
   * @returns True if this variable depends on itself (directly or indirectly)
   */
  get isCircular(): boolean {
    const inputs = new Set(this._inputs);
    for (const i of inputs) {
      if (i === this) return true;
      i._inputs.forEach(inputs.add, inputs);
    }
    return false;
  }

  /**
   * Increments the indegree counter.
   *
   * Used during topological sorting to track how many dependencies need to resolve.
   */
  incrementIndegree(): void {
    this._indegree += 1;
  }

  /**
   * Decrements the indegree counter.
   *
   * Used during topological sorting to track when all dependencies have resolved.
   */
  decrementIndegree(): void {
    this._indegree -= 1;
  }

  /**
   * Gets the variable's value as a promise.
   *
   * If the variable has an error, the promise will reject with a RuntimeError.
   *
   * @returns Promise that resolves to the variable's value
   */
  getValue(): Promise<unknown> {
    return this._promise.catch(this._rejector);
  }

  /**
   * Gets a promise that resolves when this variable is invalidated.
   *
   * Used by variables that depend on invalidation events (e.g., generators).
   *
   * @returns Promise that resolves when invalidated
   */
  getInvalidator(): Promise<void> {
    return new Promise((resolve) => {
      this._invalidate = resolve;
    });
  }

  /**
   * Sets this variable to an error state.
   *
   * Invalidates the variable, increments version, and notifies observers of the error.
   *
   * @param error - The error to set
   */
  setError(error: Error): void {
    this._invalidate();
    this._invalidate = noop;
    this._pending();
    this._version = this._version + 1;
    this._indegree = NaN;
    this._promise = Promise.reject(error);
    this._promise.catch(noop);
    this._value = undefined;
    this._rejected(error);
  }

  /**
   * Checks if this variable is reachable (has observers directly or transitively).
   *
   * A variable is reachable if it has an observer, or if any of its outputs
   * (direct or transitive) have observers. Only reachable variables are computed.
   *
   * @returns True if the variable is reachable
   */
  isReachable(): boolean {
    if (this._observer !== no_observer) return true;
    const outputs = new Set(this._outputs);
    for (const output of outputs) {
      if (output.observer !== no_observer) return true;
      output.outputs.forEach(outputs.add, outputs);
    }
    return false;
  }

  /**
   * Creates an intersector function for visibility-based computation.
   *
   * The intersector delays value propagation until the associated DOM element
   * becomes visible in the viewport, using IntersectionObserver.
   *
   * @param invalidation - Promise that resolves when the variable is invalidated
   * @returns Function that takes a value and returns a promise that resolves when visible
   */
  createIntersector(invalidation: Promise<void>): (value: unknown) => Promise<unknown> {
    const node =
      typeof IntersectionObserver === "function" && this._observer && (this._observer as unknown as Observer)._node;
    let visible = !node;
    let resolve: () => void = noop;
    let reject: () => void = noop;
    let promise: Promise<void> | null = null;
    let observer: IntersectionObserver | null = null;

    if (node) {
      observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          promise = null;
          resolve();
        }
      });
      observer.observe(node);
      invalidation.then(() => {
        if (observer) {
          observer.disconnect();
          observer = null;
        }
        reject();
      });
    }

    return function (value: unknown): Promise<unknown> {
      if (visible) return Promise.resolve(value);
      if (!observer) return Promise.reject();
      if (!promise)
        promise = new Promise((y, n) => {
          resolve = y;
          reject = n;
        });
      return promise.then(() => value);
    };
  }

  /**
   * Computes this variable's new value.
   *
   * This method:
   * 1. Invalidates the current value
   * 2. Waits for the previous computation to settle
   * 3. Resolves all input dependencies
   * 4. Calls the definition function with resolved inputs
   * 5. Handles generators and promises appropriately
   * 6. Notifies observers of the new value or error
   */
  compute(): void {
    this._invalidate();
    this._invalidate = noop;
    this._pending();

    const value0 = this._value;
    const version = this._version + 1;
    this._version = version;
    const inputs = this._inputs;
    const definition = this._definition;

    let invalidation: Promise<void> | null = null;

    const init = (): Promise<unknown[]> => {
      return Promise.all(inputs.map((v) => v.getValue()));
    };

    const define = (inputs: unknown[]): unknown => {
      if (this._version !== version) throw variable_stale;

      for (let i = 0, n = inputs.length; i < n; ++i) {
        switch (inputs[i]) {
          case Variable.INVALIDATION: {
            inputs[i] = invalidation = this.getInvalidator();
            break;
          }
          case Variable.VISIBILITY: {
            if (!invalidation) invalidation = this.getInvalidator();
            inputs[i] = this.createIntersector(invalidation);
            break;
          }
          case Variable.VARIABLE: {
            inputs[i] = this;
            break;
          }
        }
      }

      return definition.apply(value0, inputs);
    };

    const generate = (value: unknown): unknown => {
      if (this._version !== version) throw variable_stale;
      if (generatorish(value)) {
        (invalidation || this.getInvalidator()).then(generatorReturn(value));
        return this.generate(version, value);
      }
      return value;
    };

    const promise = this._promise.then(init, init).then(define).then(generate);
    this._promise = promise;

    promise.then(
      (value) => {
        this._value = value;
        this._fulfilled(value);
      },
      (error) => {
        if (error === variable_stale || this._version !== version) return;
        this._value = undefined;
        this._rejected(error);
      },
    );
  }

  /**
   * Manages a generator or async generator to produce successive values.
   *
   * When a variable's definition returns a generator, this method handles the
   * iteration loop. Each yielded value triggers observer notifications and
   * schedules the next iteration.
   *
   * @param version - The version number to track staleness
   * @param generator - The generator or async generator to iterate
   * @returns Promise that resolves when the generator completes or is invalidated
   */
  generate(version: number, generator: Generator | AsyncGenerator): Promise<unknown> {
    const runtime = this._module.runtime;
    let currentValue: unknown;

    const compute = (onfulfilled: (value: unknown) => unknown): Promise<unknown> => {
      return new Promise<IteratorResult<unknown, unknown>>((resolve) => resolve(generator.next(currentValue))).then(
        ({done, value}) => {
          return done ? undefined : Promise.resolve(value).then(onfulfilled);
        },
      );
    };

    const recompute = (): void => {
      const promise = compute((value: unknown) => {
        if (this._version !== version) throw variable_stale;
        currentValue = value;
        postcompute(value, promise).then(() => runtime._precompute(recompute));
        this._fulfilled(value);
        return value;
      });
      promise.catch((error) => {
        if (error === variable_stale || this._version !== version) return;
        postcompute(undefined, promise);
        this._rejected(error);
      });
    };

    const postcompute = (value: unknown, promise: Promise<unknown>): Promise<void> => {
      this._value = value;
      this._promise = promise;
      this._outputs.forEach(runtime.updates.add, runtime.updates);
      return runtime.compute();
    };

    return compute((value: unknown) => {
      if (this._version !== version) throw variable_stale;
      currentValue = value;
      runtime._precompute(recompute);
      return value;
    });
  }
}
