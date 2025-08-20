import {EditorView, basicSetup} from "codemirror";
import {EditorState} from "@codemirror/state";
import {javascript} from "@codemirror/lang-javascript";
import {transpileJavaScript} from "@observablehq/notebook-kit";
import {Runtime} from "@observablehq/runtime";
import * as cm from "charmingjs";

function split(code) {
  return code.split(/\n\s*\n/).filter((block) => block.trim().length > 0);
}

function uid() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function safeEval(code, inputs) {
  const body = `const foo = ${code}; return foo(${inputs.join(",")})`;
  const fn = new Function(...inputs, body);
  return fn;
}

function removeComments(code) {
  return code.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, "");
}

function debounce(fn, delay = 0) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

function inspect(value) {
  const string = value.toString();
  const lines = string.split("\n");
  return lines.map((line) => `// ${line}`).join("\n");
}

function main(root) {
  const editor = cm.html("div");
  const button = cm.html("button", {
    textContent: "Run",
    onclick: onRun,
    style_margin_bottom: "10px",
  });
  root.appendChild(button);
  root.appendChild(editor);

  let code = `const a = 3;

const b = a ** 2;
print(b);
  
const sum = add(a, b);
print(sum);
  
function add(a, b) {
  return a + b;
}`;

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
    parent: editor,
  });

  function onChange(update) {
    if (update.docChanged) code = update.state.doc.toString();
  }

  function onRun() {
    run(code);
  }

  const runtime = new Runtime();
  const main = runtime.module();
  const stateByKey = new Map();
  const indexByKey = new Map();

  const refresh = debounce(() => {
    const keyCode = [];
    for (const [cell, state] of stateByKey) {
      const {code, values} = state;
      const removed = removeComments(code);
      const output = values.map(inspect).join("\n");
      const outputCode = output ? output + "\n" + removed : removed;
      keyCode.push([cell, outputCode]);
    }
    keyCode.sort((a, b) => indexByKey.get(a[0]) - indexByKey.get(b[0]));
    const newCode = keyCode.map(([cell, code]) => code).join("\n\n");
    view.dispatch({
      changes: {from: 0, to: code.length, insert: newCode},
    });
  }, 0);

  function observer(state) {
    return {
      pending() {},
      fulfilled() {},
      rejected(error) {
        state.values = [error];
        refresh();
      },
    };
  }

  function print(state, value) {
    state.values.push(value);
    refresh();
  }

  function clear(state) {
    state.values = [];
  }

  function run(code) {
    const cells = split(removeComments(code));
    const enter = [];
    const exit = new Set(stateByKey.keys());

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      if (stateByKey.has(cell)) {
        exit.delete(cell);
        indexByKey.set(cell, i);
      } else {
        enter.push(cell);
        indexByKey.set(cell, i);
      }
    }

    for (const cell of exit) {
      const {variables} = stateByKey.get(cell);
      for (const variable of variables) variable.delete();
      stateByKey.delete(cell);
      indexByKey.delete(cell);
    }

    for (const cell of enter) {
      const vid = uid();
      const variables = [];
      const state = {variables, values: [], code: cell};
      const parsed = transpileJavaScript(cell);
      const {inputs, body, outputs} = parsed;
      const v = main.variable(observer(state), {shadow: {}});
      if (inputs.includes("print")) {
        let printVersion = -1;
        const vd = new v.constructor(2, v._module);
        vd.define(
          inputs.filter((i) => i !== "print"),
          () => {
            const version = v._version; // capture version on input change
            return (value) => {
              if (version < printVersion) throw new Error("stale print");
              else if (state.variables[0] !== v) throw new Error("stale print");
              else if (version > printVersion) clear(state);
              printVersion = version;
              print(state, value);
              return value;
            };
          }
        );
        v._shadow.set("print", vd);
      }
      variables.push(v.define(vid, inputs, safeEval(body, inputs)));
      for (const o of outputs) {
        variables.push(main.variable(true).define(o, [vid], (exports) => exports[o]));
      }
      stateByKey.set(cell, state);
    }

    refresh();
  }

  run(code);
}

main(document.getElementById("app"));
