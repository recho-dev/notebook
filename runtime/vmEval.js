// Node-only cell compiler: runs cell bodies through vm with a timeout so a
// synchronous infinite loop is interrupted instead of freezing the event
// loop. runtime/index.js must stay free of node: imports so it bundles for
// the browser — never import this module from browser-reachable code; the
// TUI worker injects it into createRuntime as the `compileCell` option.
import vm from "node:vm";

// Default cell timeout. vm's timeout option aborts synchronous loops longer
// than this — the most common "accidentally hung the app" bug. It does NOT
// catch async hangs (timers, awaits) — those are the worker watchdog's job —
// but `while(true) {}` and friends are no longer fatal.
export const DEFAULT_CELL_TIMEOUT_MS = 1000;

// We deliberately compile and execute cells in the *current* JS realm
// (`runInThisContext`) instead of a fresh vm context. A fresh context has its
// own primordials, so `{a: 1}` inside it inspects as
// `[Object: null prototype] { ... }` from the host — that breaks the
// existing inspector snapshots and feels foreign in error messages. Using
// the host realm keeps Object/Array/Promise identical to what the rest of
// the runtime uses, while still letting `vm.Script.timeout` interrupt the
// synchronous cell body. This means we don't get *security* sandboxing, but
// the user is running their own notebook, so the goal is liveness, not
// isolation.
const CELL_FN_SLOT = "__rechoCellFn$$";
const CELL_ARGS_SLOT = "__rechoCellArgs$$";
const CALL_SCRIPT = new vm.Script(`globalThis.${CELL_FN_SLOT}.apply(undefined, globalThis.${CELL_ARGS_SLOT})`, {
  filename: "recho:call.js",
});

function isTimeoutError(error) {
  return (
    error && (error.code === "ERR_SCRIPT_EXECUTION_TIMEOUT" || /Script execution timed out/i.test(error?.message || ""))
  );
}

export class CellTimeoutError extends Error {
  constructor(timeoutMs) {
    super(
      `Cell execution exceeded ${timeoutMs}ms — likely an infinite loop. The runtime kept the editor responsive; fix the cell and re-run.`,
    );
    this.name = "TimeoutError";
    this.code = "ERR_RECHO_CELL_TIMEOUT";
    this.timeoutMs = timeoutMs;
  }
}

// Returns a `compileCell` hook for createRuntime: compiles the wrapper
// function source (a parenthesized function expression) and arms vm's
// timeout around every invocation.
export function createVmCellCompiler({cellTimeoutMs = DEFAULT_CELL_TIMEOUT_MS} = {}) {
  return function compileCell(source) {
    const fn = vm.runInThisContext(source, {filename: "recho:cell.js"});
    return (...args) => {
      const prevFn = globalThis[CELL_FN_SLOT];
      const prevArgs = globalThis[CELL_ARGS_SLOT];
      globalThis[CELL_FN_SLOT] = fn;
      globalThis[CELL_ARGS_SLOT] = args;
      try {
        return CALL_SCRIPT.runInThisContext({
          timeout: cellTimeoutMs,
          breakOnSigint: true,
        });
      } catch (e) {
        if (isTimeoutError(e)) throw new CellTimeoutError(cellTimeoutMs);
        throw e;
      } finally {
        // Restore (rather than delete) so a re-entrant call from a nested
        // cell invocation — should one ever happen — sees its own slot.
        globalThis[CELL_FN_SLOT] = prevFn;
        globalThis[CELL_ARGS_SLOT] = prevArgs;
      }
    };
  };
}
