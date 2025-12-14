declare module "@observablehq/runtime" {
  // Error types
  export class RuntimeError extends Error {
    constructor(message: string, input?: string);
    input?: string;
  }

  // Observer interface
  export interface Observer<T = any> {
    pending?(): void;
    fulfilled?(value: T, name?: string | null): void;
    rejected?(error: Error, name?: string | null): void;
  }

  // Variable options
  export interface VariableOptions {
    shadow?: Record<string, any>;
  }

  // Variable definition function type
  export type DefinitionFunction<T = any> = (...inputs: any[]) => T | Promise<T> | Generator<T>;

  // Special symbols for module builtins
  export const variable_variable: unique symbol;
  export const variable_invalidation: unique symbol;
  export const variable_visibility: unique symbol;

  // Variable class
  export class Variable<T = any> {
    constructor(
      type: number,
      module: Module,
      observer?: Observer<T> | boolean,
      options?: VariableOptions
    );

    // Define a variable with optional name, inputs, and definition
    define(definition: DefinitionFunction<T> | T): this;
    define(name: string, definition: DefinitionFunction<T> | T): this;
    define(inputs: string[], definition: DefinitionFunction<T>): this;
    define(name: string | null, inputs: string[], definition: DefinitionFunction<T>): this;

    // Import a variable from another module
    import(remote: string, module: Module): this;
    import(remote: string, name: string, module: Module): this;

    // Delete the variable
    delete(): this;

    // Internal properties (readonly from external perspective)
    readonly _name: string | null;
    readonly _module: Module;
    readonly _promise: Promise<T>;
    readonly _value: T | undefined;
    readonly _version: number;
  }

  // Module class
  export class Module {
    constructor(runtime: Runtime, builtins?: Array<[string, any]>);

    // Define a new variable
    define(): Variable;
    define(definition: DefinitionFunction): Variable;
    define(name: string, definition: DefinitionFunction): Variable;
    define(inputs: string[], definition: DefinitionFunction): Variable;
    define(name: string | null, inputs: string[], definition: DefinitionFunction): Variable;

    // Redefine an existing variable
    redefine(name: string): Variable;
    redefine(name: string, definition: DefinitionFunction): Variable;
    redefine(name: string, inputs: string[], definition: DefinitionFunction): Variable;

    // Import a variable from another module
    import(): Variable;
    import(remote: string, module: Module): Variable;
    import(remote: string, name: string, module: Module): Variable;

    // Create a variable with an observer
    variable(observer?: Observer | boolean, options?: VariableOptions): Variable;

    // Derive a new module with injected variables
    derive(
      injects: Array<string | { name: string; alias?: string }>,
      injectModule: Module
    ): Module;

    // Get the value of a variable by name
    value(name: string): Promise<any>;

    // Add a builtin to the module
    builtin(name: string, value: any): void;

    // Internal properties
    readonly _runtime: Runtime;
    readonly _scope: Map<string, Variable>;
  }

  // Runtime builtins type
  export type RuntimeBuiltins = Record<string, any>;

  // Runtime global function type
  export type RuntimeGlobal = (name: string) => any;

  // Runtime class
  export class Runtime {
    constructor(builtins?: RuntimeBuiltins, global?: RuntimeGlobal);

    // Create a new module
    module(): Module;
    module(
      define: (runtime: Runtime, observer: (variable: Variable) => Observer) => void,
      observer?: (variable: Variable) => Observer
    ): Module;

    // Dispose the runtime
    dispose(): void;

    // Internal properties
    readonly _builtin: Module;
    readonly _modules: Map<any, Module>;
  }
}
