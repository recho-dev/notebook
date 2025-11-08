import {transpileJavaScript} from "@observablehq/notebook-kit";
import {Runtime} from "@observablehq/runtime";
import {parse} from "acorn";
import {group, max} from "d3-array";
import {dispatch as d3Dispatch} from "d3-dispatch";
import * as stdlib from "./stdlib/index.js";
import {Inspector} from "./stdlib/inspect.js";
import {OUTPUT_MARK, ERROR_MARK} from "./constant.js";
import {transpileRechoJavaScript} from "./transpile.js";

const OUTPUT_PREFIX = `//${OUTPUT_MARK}`;

const ERROR_PREFIX = `//${ERROR_MARK}`;

const BUILTINS = {
  recho: () => stdlib,
};

function uid() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function isError(value) {
  return value instanceof Error;
}

function safeEval(code, inputs, __setEcho__) {
  const create = (code) => {
    // Ensure the current echo function is bound for the executing cell.
    const body = `__setEcho__(echo); const __foo__ = ${code}; const v = __foo__(${inputs.join(",")}); __setEcho__(null); return v;`;
    const fn = new Function("__setEcho__", ...inputs, body);
    return (...args) => fn(__setEcho__, ...args);
  };
  try {
    return create(code);
  } catch (error) {
    // Wrap non-function statements in an arrow function for proper evaluation.
    // Example:
    // Input: `for (let i = 0; i < 10; i++) { echo(i); }`
    // Output: `() => { for (let i = 0; i < 10; i++) { echo(i); } }`
    const wrapped = `() => {${code}}`;
    return create(wrapped);
  }
}

function debounce(fn, delay = 0) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

function padStringWidth(string) {
  const lines = string.split("\n");
  const maxLength = max(lines, (line) => line.length);
  return lines.map((line) => line.padEnd(maxLength)).join("\n");
}

function padStringHeight(string, height) {
  const lines = string.split("\n");
  const diff = height - lines.length;
  return lines.join("\n") + "\n".repeat(diff);
}

function merge(...strings) {
  const maxHeight = max(strings, (string) => string.split("\n").length);
  const aligned = strings
    .map((string) => padStringHeight(string, maxHeight))
    .map((string) => padStringWidth(string))
    .map((string) => string.split("\n"));
  let output = "";
  for (let i = 0; i < maxHeight; i++) {
    for (let j = 0; j < aligned.length; j++) {
      const line = aligned[j][i];
      output += line;
      output += j < aligned.length - 1 ? " " : "";
    }
    output += i < maxHeight - 1 ? "\n" : "";
  }
  return output;
}

function addPrefix(string, prefix) {
  const lines = string.split("\n");
  return lines.map((line) => `${prefix} ${line}`).join("\n");
}

export function createRuntime(initialCode) {
  let code = initialCode;
  let prevCode = null;
  let isRunning = false;

  // Echo context management system for proper output routing.
  // Execution flow:
  // 1. Before execution: __setEcho__(echo) stores the current cell's echo function
  // 2. During execution: __getEcho__() retrieves the stored echo function
  // 3. After execution: __setEcho__(null) restores the original echo context
  // This ensures nested function calls output to the executing cell rather than
  // the cell where the function was originally defined.
  let __echo__ = null;
  const __getEcho__ = () => __echo__;
  const __setEcho__ = (echo) => (__echo__ = echo);

  const runtime = new Runtime({
    ...BUILTINS,
    __getEcho__: () => __getEcho__,
    __setEcho__: () => __setEcho__,
  });

  const main = runtime.module();
  const nodesByKey = new Map();
  const dispatcher = d3Dispatch("changes");

  const refresh = debounce((code) => {
    const changes = removeChanges(code);

    // Process and format output for all execution nodes
    const nodes = Array.from(nodesByKey.values()).flat(Infinity);
    for (const node of nodes) {
      const start = node.start;
      const {values} = node.state;
      if (values.length) {
        let output = "";
        let error = false;
        for (let i = 0; i < values.length; i++) {
          const line = values[i];
          const n = line.length;
          const formatted = line.map((v) => {
            if (isError(v)) error = true;
            // Disable string quoting for multi-value outputs to improve readability.
            // Example: echo("a =", 1) produces "a = 1" instead of "a = "1""
            const options = n === 1 ? {} : {quote: false};
            const inspector = v instanceof Inspector ? v : new Inspector(v, options);
            return inspector.format();
          });
          const merged = merge(...formatted);
          output += merged;
          output += i < values.length - 1 ? "\n" : "";
        }
        const prefix = error ? ERROR_PREFIX : OUTPUT_PREFIX;
        const prefixed = addPrefix(output, prefix);
        changes.push({from: start, insert: prefixed + "\n"});
      }
    }

    dispatch(changes);
  }, 0);

  function setCode(newCode) {
    code = newCode;
  }

  function setIsRunning(value) {
    isRunning = value;
  }

  function dispatch(changes) {
    dispatcher.call("changes", null, changes);
  }

  function onChanges(callback) {
    dispatcher.on("changes", callback);
  }

  function destroy() {
    runtime.dispose();
  }

  function observer(state) {
    return {
      pending() {},
      fulfilled() {
        // Re-execute code to synchronize block positions after state changes.
        // Note: A more robust solution would involve applying changes from both
        // output generation and user edits, but this approach provides adequate
        // synchronization for the current implementation.
        if (isRunning) rerun(code);
      },
      rejected(error) {
        const e = state.syntaxError || error;
        console.error(e);
        clear(state);
        echo(state, e);
      },
    };
  }

  function split(code) {
    try {
      return parse(code, {ecmaVersion: "latest", sourceType: "module"}).body;
    } catch (error) {
      console.error(error);
      // Calculate error position and display syntax error at the appropriate location.
      const loc = error.loc;
      const prevLine = code.split("\n").slice(0, loc.line - 1);
      const offset = loc.line === 1 ? 0 : 1;
      const from = prevLine.join("\n").length + offset;
      const changes = removeChanges(code);
      const errorMsg = addPrefix(new Inspector(error).format(), ERROR_PREFIX) + "\n";
      changes.push({from, insert: errorMsg});
      dispatch(changes);
      return null;
    }
  }

  function transpile(cell) {
    try {
      return transpileJavaScript(transpileRechoJavaScript(cell));
    } catch (error) {
      console.error(error);
      return {body: cell, inputs: [], outputs: [], error};
    }
  }

  function removeChanges(code) {
    const changes = [];

    const oldOutputs = code
      .split("\n")
      .map((l, i) => [l, i])
      .filter(([l]) => l.startsWith(OUTPUT_PREFIX) || l.startsWith(ERROR_PREFIX))
      .map(([_, i]) => i);

    const lineOf = (i) => {
      const lines = code.split("\n");
      const line = lines[i];
      const from = lines.slice(0, i).join("\n").length;
      const to = from + line.length;
      return {from, to};
    };

    for (const i of oldOutputs) {
      const line = lineOf(i);
      const from = line.from;
      const to = line.to + 1 > code.length ? line.to : line.to + 1;
      changes.push({from, to, insert: ""});
    }

    return changes;
  }

  function echo(state, ...values) {
    if (!isRunning) return;
    state.values.push(values);
    rerun(code);
  }

  function clear(state) {
    if (!isRunning) return;
    state.values = [];
    rerun(code);
  }

  function rerun(code) {
    if (code === prevCode) return refresh(code);

    prevCode = code;
    isRunning = true;

    const nodes = split(code);
    if (!nodes) return;

    for (const node of nodes) {
      const cell = code.slice(node.start, node.end);
      const transpiled = transpile(cell);
      node.transpiled = transpiled;
    }

    const groups = group(nodes, (n) => code.slice(n.start, n.end));
    const enter = [];
    const remove = [];
    const exit = new Set(nodesByKey.keys());

    for (const [key, nodes] of groups) {
      if (nodesByKey.has(key)) {
        exit.delete(key);
        const preNodes = nodesByKey.get(key);
        const pn = preNodes.length;
        const n = nodes.length;
        if (n > pn) {
          const newNodes = nodes.slice(pn);
          enter.push(...newNodes);
          preNodes.push(...newNodes);
        } else if (n < pn) {
          const oldNodes = preNodes.slice(n);
          remove.push(...oldNodes);
        }
        // Transfer state from previous nodes to updated nodes.
        for (let i = 0; i < Math.min(n, pn); i++) {
          nodes[i].state = preNodes[i].state;
        }
      } else {
        enter.push(...nodes);
      }
      nodesByKey.set(key, nodes);
    }

    for (const key of exit) {
      const preNodes = nodesByKey.get(key);
      remove.push(...preNodes);
      nodesByKey.delete(key);
    }

    for (const node of remove) {
      const {variables} = node.state;
      for (const variable of variables) variable.delete();
    }

    // Derived from Observable Notebook Kit's define.
    // https://github.com/observablehq/notebook-kit/blob/02914e034fd21a50ebcdca08df57ef5773864125/src/runtime/define.ts#L33
    for (const node of enter) {
      const vid = uid();
      const {inputs, body, outputs, error = null} = node.transpiled;
      const state = {values: [], variables: [], error: null, syntaxError: error, doc: false};
      node.state = state;
      const v = main.variable(observer(state), {shadow: {}});

      // Create echo variable for every node to support internal echo calls.
      // This ensures echo functionality works even when not explicitly used in code,
      // such as `add(1, 2)`, because the evaluated code may call echo internally.
      let echoVersion = -1;
      const vd = new v.constructor(2, v._module);
      vd.define(
        inputs.filter((i) => i !== "echo"),
        () => {
          const version = v._version; // Capture version on input change.
          const __echo__ = (value, ...args) => {
            if (version < echoVersion) throw new Error("stale echo");
            else if (state.variables[0] !== v) throw new Error("stale echo");
            else if (version > echoVersion) clear(state);
            echoVersion = version;
            echo(state, value, ...args);
            return args.length ? [value, ...args] : value;
          };
          __echo__.clear = () => clear(state);
          return __echo__;
        },
      );
      v._shadow.set("echo", vd);
      const newInputs = [...inputs, "echo"];
      state.variables.push(v.define(vid, newInputs, safeEval(body, newInputs, __setEcho__)));

      // Export cell-level variables for external access.
      for (const o of outputs) {
        state.variables.push(main.variable(true).define(o, [vid], (exports) => exports[o]));
      }
    }

    refresh(code);
  }

  function run() {
    rerun(code);
  }

  return {setCode, setIsRunning, run, onChanges, destroy, isRunning: () => isRunning};
}
