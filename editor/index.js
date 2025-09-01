import {EditorView, basicSetup} from "codemirror";
import {EditorState, Transaction} from "@codemirror/state";
import {keymap} from "@codemirror/view";
import {javascript} from "@codemirror/lang-javascript";
import {githubLight} from "@uiw/codemirror-theme-github";
import {createRuntime} from "../runtime/index.js";
import {outputDecoration} from "./decoration.js";
import {outputLines} from "./outputLines.js";
import {outputProtection} from "./protection.js";
import {dispatch as d3Dispatch} from "d3-dispatch";
import {controls} from "./controls/index.js";

export function createEditor(container, options) {
  const {code} = options;
  const dispatcher = d3Dispatch("userInput");

  const runtimeRef = {current: null};

  const state = EditorState.create({
    doc: code,
    extensions: [
      basicSetup,
      javascript(),
      githubLight,
      EditorView.lineWrapping,
      EditorView.theme({
        "&": {fontSize: "12px", fontFamily: "monospace"},
        ".cm-content": {whiteSpace: "pre"},
        ".cm-line": {wordWrap: "normal"},
      }),
      EditorView.updateListener.of(onChange),
      keymap.of([
        {
          key: "Mod-s",
          run: () => runtimeRef.current.run(),
          preventDefault: true,
        },
      ]),
      outputLines,
      outputDecoration,
      controls(runtimeRef),
      // Disable this for now, because it prevents copying/pasting the code.
      // outputProtection(),
    ],
  });

  const view = new EditorView({
    state,
    parent: container,
  });

  function initRuntime() {
    runtimeRef.current = createRuntime(view.state.doc.toString());
    runtimeRef.current.onChanges(dispatch);
  }

  function dispatch(changes) {
    // Mark this transaction as from runtime so that it will not be filtered out.
    view.dispatch({changes, annotations: [Transaction.remote.of("runtime")]});
  }

  function onChange(update) {
    if (update.docChanged) {
      const code = update.state.doc.toString();
      runtimeRef.current?.setCode(code);
      const userEdit = update.transactions.some((tr) => tr.annotation(Transaction.userEvent));
      // Stop updating the outputs when user edit the code.
      // Prevent triggering `run` by generators, which will parse the code immediately.
      // This may lead to syntax error if inputting code is not finished.
      if (userEdit) {
        runtimeRef.current?.setIsRunning(false);
        dispatcher.call("userInput", null, code);
      }
    }
  }

  return {
    run: () => {
      if (!runtimeRef.current) initRuntime();
      runtimeRef.current.run();
    },
    stop: () => {
      runtimeRef.current?.destroy();
      runtimeRef.current = null;
    },
    on: (event, callback) => dispatcher.on(event, callback),
    destroy: () => {
      runtimeRef.current?.destroy();
      view.destroy();
    },
  };
}
