// Runtime worker: boots the Recho/Observable runtime in its own thread so
// the TUI in the main thread keeps painting and reading input even when a
// notebook does something pathological (an async tight loop, a recursive
// promise chain, or a long blocking call that vm.timeout can't catch on its
// own).
//
// The protocol is small. Main thread sends:
//   {type: "init",  code, options?}        — boot a fresh runtime
//   {type: "setCode", code}                — keep runtime's view in sync
//   {type: "setIsRunning", value}          — pause/resume the runtime
//   {type: "run"}                          — re-run from scratch
//   {type: "destroy"}                      — drop the runtime
// The worker sends back:
//   {type: "ready"}                        — initial run completed
//   {type: "changes", changes: [...]}      — buffer change-spec array
//   {type: "error",   error, source}       — parse / split errors
//   {type: "console", level, text}         — captured console.error etc.
//   {type: "heartbeat", t}                 — every 200ms; main uses these
//                                            to detect a hung worker
//
// Effects are intentionally dropped from "changes" — they hold CodeMirror
// state-effect objects that don't structured-clone.

import {parentPort} from "node:worker_threads";

if (!parentPort) {
  throw new Error("runtime/worker.ts must be loaded as a worker_thread.");
}

const port = parentPort;

type WorkerPostMessage =
  | {type: "ready"}
  | {type: "changes"; changes: unknown[]}
  | {type: "error"; error: SerializedError; source: string}
  | {type: "console"; level: ConsoleLevel; text: string}
  | {type: "heartbeat"; t: number}
  | {type: "online"};

type WorkerCommand =
  | {type: "init"; code: string; options?: RuntimeOptions}
  | {type: "setCode"; code: string}
  | {type: "setIsRunning"; value: boolean}
  | {type: "run"}
  | {type: "destroy"};

type ConsoleLevel = "log" | "info" | "warn" | "error" | "debug";
type RuntimeOptions = {cellTimeoutMs?: number};
type SerializedError = {message: string; name: string; stack: string | null; code: unknown};
type RuntimeInstance = {
  destroy?: () => void;
  onChanges: (callback: (event: {changes: unknown[]}) => void) => void;
  onError: (callback: (event: {error: unknown; source?: string}) => void) => void;
  setIsRunning: (value: boolean) => void;
  setCode: (code: string) => void;
  run: () => void;
};

// -- Capture console & stderr BEFORE loading the runtime, so anything the
// stdlib (or its observer.rejected path) writes during boot is forwarded.
function safePost(msg: WorkerPostMessage) {
  try {
    port.postMessage(msg);
  } catch {
    /* parent gone */
  }
}

function stringifyArgs(args: unknown[]): string {
  return args
    .map((a) => {
      if (a instanceof Error) return (a.stack ? a.stack : a.message) || String(a);
      if (typeof a === "string") return a;
      try {
        return JSON.stringify(a);
      } catch {
        return String(a);
      }
    })
    .join(" ");
}

function serializeError(e: unknown): SerializedError {
  if (!e) return {message: "(unknown error)", name: "Error", stack: null, code: null};
  const error = e as {message?: string; name?: string; stack?: string; code?: unknown};
  return {
    message: error.message || String(e),
    name: error.name || "Error",
    stack: error.stack || null,
    code: error.code || null,
  };
}

for (const level of ["log", "info", "warn", "error", "debug"] satisfies ConsoleLevel[]) {
  console[level] = (...args) => safePost({type: "console", level, text: stringifyArgs(args)});
}

const origStderrWrite = process.stderr.write.bind(process.stderr);
process.stderr.write = ((
  chunk: string | Uint8Array,
  encoding?: BufferEncoding | ((err?: Error | null) => void),
  callback?: (err?: Error | null) => void,
) => {
  const text = typeof chunk === "string" ? chunk : (chunk?.toString?.() ?? String(chunk));
  if (text.trim()) safePost({type: "console", level: "error", text: text.replace(/\n+$/, "")});
  if (typeof encoding === "function") encoding();
  else if (typeof callback === "function") callback();
  return true;
}) as typeof process.stderr.write;

// Process-level catch-alls — async failures in notebook code shouldn't kill
// the worker (and even if they do, the main thread will just respawn).
process.on("unhandledRejection", (e) => {
  safePost({type: "console", level: "error", text: `[unhandledRejection] ${stringifyArgs([e])}`});
});
process.on("uncaughtException", (e) => {
  safePost({type: "console", level: "error", text: `[uncaughtException] ${stringifyArgs([e])}`});
});

// Heartbeat: as long as the worker's event loop turns, the main thread sees
// a tick. A blocked sync loop short-circuits this — vm.timeout typically
// kicks in first, but if it doesn't, the main-thread watchdog notices the
// gap and terminates the worker.
const HEARTBEAT_MS = 200;
setInterval(() => safePost({type: "heartbeat", t: Date.now()}), HEARTBEAT_MS).unref();

let rt: RuntimeInstance | null = null;

function bootRuntime(code: string, options?: RuntimeOptions) {
  rt?.destroy?.();
  rt = null;

  // Lazy import so the heartbeat above is already running when the runtime
  // (and its dependencies) get evaluated.
  return import("./index.js").then(({createRuntime}) => {
    rt = createRuntime(code, options || {}) as RuntimeInstance;
    rt.onChanges((evt) => safePost({type: "changes", changes: evt.changes}));
    rt.onError((evt) => safePost({type: "error", error: serializeError(evt.error), source: evt.source || "runtime"}));
    rt.setIsRunning(true);
    try {
      rt.run();
    } catch (e) {
      safePost({type: "console", level: "error", text: `[run] ${stringifyArgs([e])}`});
    }
    safePost({type: "ready"});
  });
}

port.on("message", (msg: WorkerCommand) => {
  switch (msg?.type) {
    case "init":
      bootRuntime(msg.code, msg.options).catch((e) =>
        safePost({type: "console", level: "error", text: `[init] ${stringifyArgs([e])}`}),
      );
      break;
    case "setCode":
      try {
        rt?.setCode(msg.code);
      } catch (e) {
        safePost({type: "console", level: "error", text: `[setCode] ${stringifyArgs([e])}`});
      }
      break;
    case "setIsRunning":
      try {
        rt?.setIsRunning(msg.value);
      } catch (e) {
        safePost({type: "console", level: "error", text: `[setIsRunning] ${stringifyArgs([e])}`});
      }
      break;
    case "run":
      try {
        rt?.run();
      } catch (e) {
        safePost({type: "console", level: "error", text: `[run] ${stringifyArgs([e])}`});
      }
      break;
    case "destroy":
      try {
        rt?.destroy?.();
      } catch {
        /* ignore */
      }
      rt = null;
      break;
    default:
      // Unknown message — log to original stderr (which we replaced above).
      try {
        origStderrWrite(`recho-worker: unknown message type ${JSON.stringify((msg as {type?: unknown}).type)}\n`);
      } catch {
        /* ignore */
      }
  }
});

safePost({type: "online"});
