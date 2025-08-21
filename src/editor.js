import {EditorView, basicSetup} from "codemirror";
import {EditorState} from "@codemirror/state";
import {javascript} from "@codemirror/lang-javascript";
import {transpileJavaScript} from "@observablehq/notebook-kit";
import {Runtime} from "@observablehq/runtime";
import inspector from "object-inspect";
import {parse} from "acorn";
import {group} from "d3-array";

const PREFIX = "//➜";

function split(code) {
  return parse(code, {ecmaVersion: "latest"}).body;
}

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

function formatMultiline(value) {
  const lines = value.split("\n");
  return `\`${lines.map((line, i) => (i === 0 ? line : ` ${line}`)).join("\n")}\``;
}

function isMultiline(value) {
  const isString = typeof value === "string";
  if (!isString) return false;
  const lines = value.split("\n");
  return lines.length > 1;
}

function inspect(value, options) {
  if (isMultiline(value)) return formatMultiline(value);
  return inspector(value, options);
}

function format(value, options) {
  const string = inspect(value, options);
  const lines = string.split("\n");
  return lines.map((line) => `${PREFIX} ${line}`).join("\n");
}

export function createEditor(container, options) {
  let {code} = options;

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
    if (update.docChanged) code = update.state.doc.toString();
  }

  function onRun() {
    run(code);
  }

  const runtime = new Runtime();
  const main = runtime.module();
  const nodesByKey = new Map();

  const refresh = debounce(() => {
    const dispatch = [];
    const doc = view.state.doc;

    // Remove old outputs
    const oldOutputs = code
      .split("\n")
      .map((l, i) => [l, i])
      .filter(([l]) => l.startsWith(PREFIX))
      .map(([_, i]) => i + 1);
    for (const i of oldOutputs) {
      const line = doc.line(i);
      const from = line.from;
      const to = line.to + 1 > code.length ? line.to : line.to + 1;
      dispatch.push({from, to, insert: ""});
    }

    // Insert new outputs
    const nodes = Array.from(nodesByKey.values()).flat(Infinity);
    for (const node of nodes) {
      const start = node.start;
      const {values, error} = node.state;
      const V = error ? {value: error} : values;
      if (V.length) {
        const output = V.map(({value, options}) => format(value, options)).join("\n") + "\n";
        dispatch.push({from: start, insert: output});
      }
    }

    view.dispatch({
      changes: dispatch,
    });
  }, 0);

  function observer(state) {
    return {
      pending() {},
      fulfilled() {
        state.error = null;
        refresh();
      },
      rejected(error) {
        state.error = error;
        refresh();
      },
    };
  }

  function doc(state, value, options) {
    state.values.push({value, options});
    refresh();
  }

  function clear(state) {
    state.values = [];
  }

  function run(code) {
    const nodes = split(code);
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
      const state = {values: [], variables: [], error: null};
      node.state = state;
      const cell = code.slice(node.start, node.end);
      const parsed = transpileJavaScript(cell);
      const {inputs, body, outputs} = parsed;
      const v = main.variable(observer(state), {shadow: {}});
      if (inputs.includes("doc")) {
        let printVersion = -1;
        const vd = new v.constructor(2, v._module);
        vd.define(
          inputs.filter((i) => i !== "doc"),
          () => {
            const version = v._version; // capture version on input change
            return (value, options) => {
              if (version < printVersion) throw new Error("stale doc");
              else if (state.variables[0] !== v) throw new Error("stale doc");
              else if (version > printVersion) clear(state);
              printVersion = version;
              doc(state, value, options);
              return value;
            };
          }
        );
        v._shadow.set("doc", vd);
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
