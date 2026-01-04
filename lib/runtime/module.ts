import {constant, identity, rethrow} from "./utils.ts";
import {RuntimeError} from "./errors.ts";
import {Variable, no_observer, variable_stale, type ObserverLike, type VariableOptions} from "./variable.ts";
import type {Runtime} from "./runtime.ts";

export interface InjectSpecifier {
  name: string;
  alias?: string;
}

export type InjectInput = string | InjectSpecifier;

/**
 * A module represents a namespace for reactive variables. Variables within a
 * module can reference each other and form a dependency graph.
 */
export class Module {
  // Read-only cross-class access (getters only)
  private _runtime: Runtime;
  private _scope: Map<string, Variable>;
  private _builtins: Map<string, unknown>;
  private _source: Module | null;

  // Getters for read-only cross-class members
  get runtime(): Runtime {
    return this._runtime;
  }

  get scope(): Map<string, Variable> {
    return this._scope;
  }

  get builtins(): Map<string, unknown> {
    return this._builtins;
  }

  get source(): Module | null {
    return this._source;
  }

  /**
   * Creates a new module.
   * @param runtime The runtime that manages this module
   * @param builtins Optional builtin values to add to the module's scope
   */
  constructor(runtime: Runtime, builtins: Iterable<[string, unknown]> = []) {
    this._runtime = runtime;
    this._scope = new Map();
    this._builtins = new Map([
      ["@variable", Variable.VARIABLE],
      ["invalidation", Variable.INVALIDATION],
      ["visibility", Variable.VISIBILITY],
      ...builtins,
    ]);
    this._source = null;
  }

  /**
   * Resolves a variable by name, creating an implicit variable if needed.
   * This method looks up variables in the module's scope, builtins, runtime builtins, or global scope.
   * @param name The variable name to resolve
   * @returns The resolved variable
   * @internal
   */
  _resolve(name: string): Variable {
    let variable = this._scope.get(name);
    let value: unknown;

    if (!variable) {
      variable = new Variable(Variable.Type.IMPLICIT, this);
      if (this._builtins.has(name)) {
        variable.define(name, constant(this._builtins.get(name)));
      } else if (this._runtime.builtin.scope.has(name)) {
        variable.import(name, this._runtime.builtin);
      } else {
        try {
          value = this._runtime.global(name);
        } catch (error) {
          return variable.define(name, rethrow(error));
        }
        if (value === undefined) {
          this._scope.set(name, variable);
          variable.name = name;
        } else {
          variable.define(name, constant(value));
        }
      }
    }
    return variable;
  }

  /**
   * Redefines an existing variable in the module.
   * @param name The name of the variable to redefine
   * @param args The definition arguments (same as Variable.define)
   * @returns The redefined variable
   * @throws {RuntimeError} If the variable is not defined or is defined multiple times
   */
  redefine(name: string | null, definition: unknown): Variable;
  redefine(name: string | null, inputs: ArrayLike<string>, definition: unknown): Variable;
  redefine(name: string, ...args: [unknown] | [ArrayLike<string>, unknown]): Variable {
    const v = this._scope.get(name);
    if (!v) throw new RuntimeError(`${name} is not defined`);
    if (v.type === Variable.Type.DUPLICATE) throw new RuntimeError(`${name} is defined more than once`);
    const targs = [name, ...args] as Parameters<Variable["define"]>;
    return v.define(...targs);
  }

  /**
   * Defines a new variable in the module.
   * @param args The definition arguments (name, inputs, definition) - see Variable.define for details
   * @returns The newly created variable
   */
  define(...args: Parameters<Variable["define"]>): Variable {
    const v = new Variable(Variable.Type.NORMAL, this);
    return v.define(...args);
  }

  /**
   * Imports a variable from another module.
   * @param args The import arguments (remote name, local name, module) - see Variable.import for details
   * @returns The newly created import variable
   */
  import(...args: Parameters<Variable["import"]>): Variable {
    const v = new Variable(Variable.Type.NORMAL, this);
    return v.import(...args);
  }

  /**
   * Creates a new variable in the module with an optional observer.
   * @param observer Optional observer to monitor the variable's state changes
   * @param options Optional variable options (e.g., shadow variables)
   * @returns The newly created variable
   */
  variable(observer?: ObserverLike, options?: VariableOptions): Variable {
    return new Variable(Variable.Type.NORMAL, this, observer, options);
  }

  /**
   * Gets the current value of a variable by name.
   * This method waits for the runtime to compute all pending updates before returning the value.
   * If the variable becomes stale during computation, it retries until a stable value is obtained.
   * @param name The name of the variable
   * @returns A promise that resolves to the variable's current value
   * @throws {RuntimeError} If the variable is not defined
   */
  async value(name: string): Promise<unknown> {
    let v = this._scope.get(name);
    if (!v) throw new RuntimeError(`${name} is not defined`);
    if (v.observer === no_observer) {
      v = this.variable(true).define([name], identity);
      try {
        return await this._revalue(v);
      } finally {
        v.delete();
      }
    } else {
      return this._revalue(v);
    }
  }

  /**
   * Creates a derived module that imports specified variables from another module.
   * The derived module is a copy of this module with additional injected variables.
   * All transitive dependencies are also copied to maintain the dependency graph.
   * @param injects The variables to inject (can be strings or {name, alias} objects)
   * @param injectModule The module to import the variables from
   * @returns A new derived module with the injected variables
   */
  derive(injects: Iterable<InjectInput>, injectModule: Module): Module {
    const map = new Map<Module, Module>();
    const modules = new Set<Module>();
    const copies: Array<[Module, Module]> = [];

    const alias = (source: Module): Module => {
      let target = map.get(source);
      if (target) return target;
      target = new Module(source._runtime, source._builtins);
      target._source = source;
      map.set(source, target);
      copies.push([target, source]);
      modules.add(source);
      return target;
    };

    const derive = alias(this);
    for (const inject of injects) {
      const {alias: injectAlias, name} = typeof inject === "object" ? inject : {name: inject, alias: undefined};
      derive.import(name, injectAlias == null ? name : injectAlias, injectModule);
    }

    for (const module of modules) {
      for (const [name, variable] of module._scope) {
        if (variable.definition === identity) {
          if (module === this && derive._scope.has(name)) continue;
          const importedModule = variable.inputs[0].module;
          if (importedModule._source) alias(importedModule);
        }
      }
    }

    for (const [target, source] of copies) {
      for (const [name, sourceVariable] of source._scope) {
        const targetVariable = target._scope.get(name);
        if (targetVariable && targetVariable.type !== Variable.Type.IMPLICIT) continue;
        if (sourceVariable.definition === identity) {
          const sourceInput = sourceVariable.inputs[0];
          const sourceModule = sourceInput.module;
          target.import(sourceInput.name!, name, map.get(sourceModule) || sourceModule);
        } else {
          target.define(
            name,
            sourceVariable.inputs.map((v) => v.name!),
            sourceVariable.definition,
          );
        }
      }
    }

    return derive;
  }

  /**
   * Adds or updates a builtin value in the module.
   * Builtins are predefined values that can be referenced by variables in the module.
   * @param name The name of the builtin
   * @param value The value of the builtin
   */
  builtin(name: string, value: unknown): void {
    this._builtins.set(name, value);
  }

  /**
   * Retrieves the current value of a variable, retrying if it becomes stale during computation.
   * This is an internal helper method used by the value() method.
   * @param variable The variable to get the value from
   * @returns A promise that resolves to the variable's current value
   * @internal
   */
  private async _revalue(variable: Variable): Promise<unknown> {
    await this._runtime.compute();
    try {
      return await variable.promise;
    } catch (error) {
      if (error === variable_stale) return this._revalue(variable);
      throw error;
    }
  }
}
