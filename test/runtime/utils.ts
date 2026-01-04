import type {Variable} from "@/lib/runtime/variable.ts";

export async function valueof(variable: Variable) {
  await variable.module.runtime.compute();
  try {
    return {value: await variable.promise};
  } catch (error) {
    return {error: error instanceof Error ? error.toString() : String(error)};
  }
}

export function promiseInspector() {
  let fulfilled: (value: unknown) => void, rejected: (reason: unknown) => void;
  const promise = new Promise((resolve, reject) => {
    fulfilled = resolve;
    rejected = reject;
  });
  return Object.assign(promise, {fulfilled: fulfilled!, rejected: rejected!});
}

export function sleep(ms = 50) {
  return delay(undefined, ms);
}

export function delay<T>(value: T, ms: number): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
