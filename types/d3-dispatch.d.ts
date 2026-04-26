declare module "d3-dispatch" {
  export function dispatch(...types: string[]): {
    call(type: string, that?: unknown, ...args: unknown[]): void;
    on(type: string, callback: ((...args: unknown[]) => void) | null): unknown;
  };
}
