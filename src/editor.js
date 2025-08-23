import {EditorView, basicSetup} from "codemirror";
import {EditorState, Transaction} from "@codemirror/state";
import {javascript} from "@codemirror/lang-javascript";
import {transpileJavaScript} from "@observablehq/notebook-kit";
import {Runtime} from "@observablehq/runtime";
import inspector from "object-inspect";
import {parse} from "acorn";
import {group} from "d3-array";
import {require} from "d3-require";

const PREFIX = "//➜";

const BUILTINS = {
  require: () => require,
};

function uid() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function safeEval(code, inputs) {
  const body = `const foo = ${code}; return foo(${inputs.join(",")})`;
  const fn = new Function(...inputs, body);
  return fn;
}

function debounce(fn, delay = 0) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

function isMultiline(value) {
  const isString = typeof value === "string";
  if (!isString) return false;
  const lines = value.split("\n");
  return lines.length > 1;
}

function inspect(value, {limit = 200, quote = true, ...rest} = {}) {
  if (isMultiline(value)) return value;
  if (typeof value === "string" && !quote) return value;
  const string = inspector(value, rest);
  if (string.length > limit) return string.slice(0, limit) + "…";
  return string;
}

function format(value, options) {
  const string = inspect(value, options);
  const lines = string.split("\n");
  return lines.map((line) => `${PREFIX} ${line}`).join("\n");
}

export function createEditor(container, options) {
  let {code} = options;
  let prevCode = null;
  let isRunning = false;

  const state = EditorState.create({
    doc: code,
    extensions: [
      basicSetup,
      javascript(),
      EditorView.lineWrapping,
      EditorView.theme({"&": {fontSize: "14px", fontFamily: "monospace"}}),
      EditorView.updateListener.of(onChange),
    ],
  });

  const view = new EditorView({
    state,
    parent: container,
  });

  function onChange(update) {
    if (update.docChanged) {
      code = update.state.doc.toString();
      const userEdit = update.transactions.some((tr) => tr.annotation(Transaction.userEvent));
      // Stop updating the outputs when user edit the code.
      // Prevent triggering `onRun` by generators, which will parse the code immediately.
      // This may lead to syntax error if imputing code is not finished.
      if (userEdit) isRunning = false;
    }
  }

  function onRun() {
    run(code);
  }

  const runtime = new Runtime(BUILTINS);
  const main = runtime.module();
  const nodesByKey = new Map();

  const refresh = debounce(() => {
    const changes = removeChanges(code);

    // Insert new outputs
    const nodes = Array.from(nodesByKey.values()).flat(Infinity);
    for (const node of nodes) {
      const start = node.start;
      const {values} = node.state;
      if (values.length) {
        const output = values.map(({value, options}) => format(value, options)).join("\n") + "\n";
        changes.push({from: start, insert: output});
      }
    }

    view.dispatch({changes});
  }, 0);

  function removeChanges(code) {
    const doc = view.state.doc;
    const changes = [];

    const oldOutputs = code
      .split("\n")
      .map((l, i) => [l, i])
      .filter(([l]) => l.startsWith(PREFIX))
      .map(([_, i]) => i + 1);

    for (const i of oldOutputs) {
      const line = doc.line(i);
      const from = line.from;
      const to = line.to + 1 > code.length ? line.to : line.to + 1;
      changes.push({from, to, insert: ""});
    }

    return changes;
  }

  function observer(state) {
    return {
      pending() {
        clear(state);
        if (state.doc) doc(state, "Pending…", {quote: false});
      },
      fulfilled() {
        // Before blocks are fulfilled, their position might be changed or
        // they might be removed. Run `onRun` to make sure the position of blocks are updated.
        // The better way is to sync the position by applying all the changes, from both the
        // output and the user edits. But it's not easy to implement.
        if (isRunning) onRun();
      },
      rejected(error) {
        console.error(error);
        clear(state);
        doc(state, error);
      },
    };
  }

  function doc(state, value, options) {
    if (!isRunning) return;
    state.values.push({value, options});
    onRun();
  }

  function clear(state) {
    if (!isRunning) return;
    state.values = [];
    onRun();
  }

  function split(code) {
    try {
      return parse(code, {ecmaVersion: "latest", sourceType: "module"}).body;
    } catch (error) {
      console.error(error);
      const changes = removeChanges(code);
      const errorMsg = format(error) + "\n";
      changes.push({from: 0, insert: errorMsg});
      view.dispatch({changes});
      return null;
    }
  }

  function run(code) {
    // If the code is the same as the pervious one, there is no need to to update
    // the position of blocks. So skip the diffing and just refresh the outputs.
    if (code === prevCode) {
      refresh();
      return;
    }

    prevCode = code;
    isRunning = true;

    const nodes = split(code);
    if (!nodes) return;
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
        // Pass states to new nodes.
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

    for (const node of enter) {
      const vid = uid();
      const state = {values: [], variables: [], error: null, doc: false};
      node.state = state;
      const cell = code.slice(node.start, node.end);
      const parsed = transpileJavaScript(cell);
      const {inputs, body, outputs} = parsed;
      const v = main.variable(observer(state), {shadow: {}});
      if (inputs.includes("doc")) {
        state.doc = true;
        let docVersion = -1;
        const vd = new v.constructor(2, v._module);
        vd.define(
          inputs.filter((i) => i !== "doc" && i !== "clear"),
          () => {
            const version = v._version; // Capture version on input change.
            return (value, options) => {
              if (version < docVersion) throw new Error("stale doc");
              else if (state.variables[0] !== v) throw new Error("stale doc");
              else if (version > docVersion) clear(state);
              docVersion = version;
              doc(state, value, options);
              return value;
            };
          }
        );
        v._shadow.set("doc", vd);
      }
      if (inputs.includes("clear")) {
        let clearVersion = -1;
        const vc = new v.constructor(2, v._module);
        vc.define(
          inputs.filter((i) => i !== "clear" && i !== "doc"),
          () => {
            const version = v._version;
            return () => {
              if (version < clearVersion) throw new Error("stale clear");
              else if (state.variables[0] !== v) throw new Error("stale clear");
              clearVersion = version;
              clear(state);
            };
          }
        );
        v._shadow.set("clear", vc);
      }
      state.variables.push(v.define(vid, inputs, safeEval(body, inputs)));
      for (const o of outputs) {
        state.variables.push(main.variable(true).define(o, [vid], (exports) => exports[o]));
      }
    }
    refresh();
  }

  run(code);

  function destroy() {
    view.destroy();
    runtime.dispose();
  }

  return {
    run: onRun,
    destroy,
  };
}
