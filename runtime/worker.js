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
  throw new Error("runtime/worker.js must be loaded as a worker_thread.");
}

// -- Capture console & stderr BEFORE loading the runtime, so anything the
// stdlib (or its observer.rejected path) writes during boot is forwarded.
function safePost(msg) {
  try {
    parentPort.postMessage(msg);
  } catch {
    /* parent gone */
  }
}

function stringifyArgs(args) {
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

function serializeError(e) {
  if (!e) return {message: "(unknown error)"};
  return {
    message: e.message || String(e),
    name: e.name || "Error",
    stack: e.stack || null,
    code: e.code || null,
  };
}

for (const level of ["log", "info", "warn", "error", "debug"]) {
  console[level] = (...args) => safePost({type: "console", level, text: stringifyArgs(args)});
}

const origStderrWrite = process.stderr.write.bind(process.stderr);
process.stderr.write = (chunk, encoding, callback) => {
  const text = typeof chunk === "string" ? chunk : (chunk?.toString?.() ?? String(chunk));
  if (text.trim()) safePost({type: "console", level: "error", text: text.replace(/\n+$/, "")});
  if (typeof encoding === "function") encoding();
  else if (typeof callback === "function") callback();
  return true;
};

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

let rt = null;

function bootRuntime(code, options) {
  rt?.destroy?.();
  rt = null;

  // Lazy import so the heartbeat above is already running when the runtime
  // (and its dependencies) get evaluated.
  return import("./index.js").then(({createRuntime}) => {
    rt = createRuntime(code, options || {});
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

parentPort.on("message", (msg) => {
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
        origStderrWrite(`recho-worker: unknown message type ${JSON.stringify(msg?.type)}\n`);
      } catch {
        /* ignore */
      }
  }
});

safePost({type: "online"});
