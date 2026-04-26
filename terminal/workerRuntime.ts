// Main-thread proxy for the runtime worker. Wraps a Worker so the rest of
// the TUI can stay near the original `createRuntime` shape: `setCode`,
// `setIsRunning`, `run`, `onChanges`, `onError`, `destroy`. Adds:
//
//   onConsole(cb)  — receives captured console output from the worker
//   onHung(cb)     — fires when the heartbeat watchdog trips
//   onExit(cb)     — fires when the underlying Worker exits
//   isAlive()      — false once the worker has exited and not been respawned
//   terminate()    — kill the worker without spawning a new one
//   restart(code)  — kill + respawn fresh with the given source

import {Worker} from "node:worker_threads";
import {fileURLToPath} from "node:url";
import path from "node:path";
import {dispatch as d3Dispatch} from "d3-dispatch";
import type {ChangeSpec} from "./buffer.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKER_PATH = path.resolve(__dirname, "..", "runtime", "worker.ts");

function workerExecArgv(): string[] {
  return process.execArgv.filter((arg) => !arg.startsWith("--input-type"));
}

export type WorkerRuntimeOptions = {
  cellTimeoutMs?: number;
  heartbeatGraceMs?: number;
};

export type RuntimeErrorEvent = {error: Error & {code?: unknown}; source?: string};
export type RuntimeConsoleEvent = {level: string; text: string};
export type RuntimeChangesEvent = {changes: ChangeSpec[]; effects: []};
export type RuntimeHungEvent = {sinceHeartbeatMs: number};
export type RuntimeExitEvent = {code: number | null};

type WorkerMessage =
  | {type: "heartbeat"}
  | {type: "online"}
  | {type: "ready"}
  | {type: "changes"; changes: ChangeSpec[]}
  | {type: "error"; error?: {message?: string; name?: string; stack?: string; code?: unknown}; source?: string}
  | {type: "console"; level: string; text: string};

export function createWorkerRuntime(initialCode: string, options: WorkerRuntimeOptions = {}) {
  const dispatcher = d3Dispatch("changes", "error", "console", "ready", "online", "hung", "exit");

  // Watchdog: if the worker stops sending heartbeats for this long, we
  // consider it hung. The `cellTimeoutMs` (default 1000) catches sync
  // infinite loops first; this catches the async cases (`while (true)
  // await ...`, recursive promise chains, blocking native calls) that
  // vm.timeout can't.
  const heartbeatGraceMs = options.heartbeatGraceMs ?? 3000;
  const cellTimeoutMs = options.cellTimeoutMs ?? 1000;

  let worker: Worker | null = null;
  let alive = false;
  let hung = false;
  let isRunning = false;
  let booting = false;
  let lastHeartbeat = Date.now();
  let lastCode = initialCode;
  let watchdog: NodeJS.Timeout | null = null;

  function spawn(code: string) {
    teardownWorker();
    hung = false;
    alive = true;
    lastHeartbeat = Date.now();
    lastCode = code;
    booting = true;
    worker = new Worker(WORKER_PATH, {
      // Do not inherit eval-only flags such as --input-type=module; workers
      // load a real file and Node rejects those flags for file entry points.
      execArgv: workerExecArgv(),
      stdout: false,
      stderr: false,
    });
    worker.on("message", onMessage);
    worker.on("error", (e) =>
      dispatcher.call("console", null, {level: "error", text: `[worker] ${e?.stack || String(e)}`}),
    );
    worker.on("exit", (code) => {
      alive = false;
      booting = false;
      worker = null;
      dispatcher.call("exit", null, {code});
    });
    worker.postMessage({type: "init", code, options: {cellTimeoutMs}});
  }

  function teardownWorker() {
    if (!worker) return;
    try {
      worker.removeAllListeners();
      worker.terminate();
    } catch {
      /* ignore */
    }
    worker = null;
    alive = false;
    booting = false;
  }

  function onMessage(msg: WorkerMessage) {
    if (!msg || typeof msg !== "object") return;
    switch (msg.type) {
      case "heartbeat":
        lastHeartbeat = Date.now();
        break;
      case "online":
        dispatcher.call("online", null, {});
        break;
      case "ready":
        booting = false;
        if (isRunning) worker?.postMessage({type: "setIsRunning", value: true});
        dispatcher.call("ready", null, {});
        break;
      case "changes":
        // Effects are dropped at the worker boundary — only `changes` matter
        // to a non-CodeMirror frontend.
        dispatcher.call("changes", null, {changes: msg.changes, effects: []});
        break;
      case "error": {
        const err: Error & {code?: unknown} = new Error(msg.error?.message || "runtime error");
        if (msg.error?.name) err.name = msg.error.name;
        if (msg.error?.stack) err.stack = msg.error.stack;
        if (msg.error?.code) err.code = msg.error.code;
        dispatcher.call("error", null, {error: err, source: msg.source});
        break;
      }
      case "console":
        dispatcher.call("console", null, {level: msg.level, text: msg.text});
        break;
    }
  }

  function checkWatchdog() {
    if (!alive || hung) return;
    const gap = Date.now() - lastHeartbeat;
    if (gap > heartbeatGraceMs) {
      hung = true;
      dispatcher.call("hung", null, {sinceHeartbeatMs: gap});
    }
  }

  watchdog = setInterval(checkWatchdog, 250);
  watchdog.unref?.();

  spawn(initialCode);

  return {
    setCode(code: string) {
      lastCode = code;
      worker?.postMessage({type: "setCode", code});
    },
    setIsRunning(value: boolean) {
      isRunning = !!value;
      worker?.postMessage({type: "setIsRunning", value: !!value});
    },
    run() {
      if (!alive || !worker || hung) {
        spawn(lastCode);
        isRunning = true;
        return;
      }
      isRunning = true;
      worker?.postMessage({type: "run"});
    },
    isRunning: () => isRunning,
    isAlive: () => alive && !hung,
    isHung: () => hung,
    terminate() {
      teardownWorker();
      isRunning = false;
    },
    restart(code?: string) {
      spawn(code ?? lastCode);
      isRunning = true;
    },
    destroy() {
      if (watchdog) clearInterval(watchdog);
      teardownWorker();
      isRunning = false;
    },
    onChanges: (cb: ((event: RuntimeChangesEvent) => void) | null) =>
      dispatcher.on("changes", cb as unknown as ((...args: unknown[]) => void) | null),
    onError: (cb: ((event: RuntimeErrorEvent) => void) | null) =>
      dispatcher.on("error", cb as unknown as ((...args: unknown[]) => void) | null),
    onConsole: (cb: ((event: RuntimeConsoleEvent) => void) | null) =>
      dispatcher.on("console", cb as unknown as ((...args: unknown[]) => void) | null),
    onReady: (cb: (() => void) | null) =>
      dispatcher.on("ready", cb as unknown as ((...args: unknown[]) => void) | null),
    onOnline: (cb: (() => void) | null) =>
      dispatcher.on("online", cb as unknown as ((...args: unknown[]) => void) | null),
    onHung: (cb: ((event: RuntimeHungEvent) => void) | null) =>
      dispatcher.on("hung", cb as unknown as ((...args: unknown[]) => void) | null),
    onExit: (cb: ((event: RuntimeExitEvent) => void) | null) =>
      dispatcher.on("exit", cb as unknown as ((...args: unknown[]) => void) | null),
    isBooting: () => booting,
  };
}

export type WorkerRuntime = ReturnType<typeof createWorkerRuntime>;
