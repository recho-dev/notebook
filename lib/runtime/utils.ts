// Array utilities
export function map<T, U>(
  array: ArrayLike<T>,
  fn: (value: T, index: number, array: ArrayLike<T>) => U,
  thisArg?: unknown,
): Array<U> {
  return Array.prototype.map.call<
    ArrayLike<T>,
    [(value: T, index: number, array: ArrayLike<T>) => U, unknown],
    Array<U>
  >(array, fn, thisArg);
}

// Function utilities
export function noop(): void {}

export function constant<T>(x: T): () => T {
  return () => x;
}

export function identity<T>(x: T): T {
  return x;
}

export function rethrow(error: unknown): () => never {
  return () => {
    throw error;
  };
}

// Type checking utilities
export function generatorish(value: unknown): value is Generator | AsyncGenerator {
  return (
    typeof value === "object" &&
    value !== null &&
    "next" in value &&
    typeof value.next === "function" &&
    "return" in value &&
    typeof value.return === "function"
  );
}

// Async utilities
export function defer(depth = 0): Promise<void> {
  let p: Promise<void> = Promise.resolve();
  for (let i = 0; i < depth; ++i) p = p.then(() => {});
  return p;
}

// Generator utilities
export function generatorReturn(generator: Generator | AsyncGenerator): () => void {
  return function () {
    generator.return(undefined);
  };
}

// Global resolution utilities
export function defaultGlobal(name: string): unknown {
  return Reflect.get(globalThis, name);
}
