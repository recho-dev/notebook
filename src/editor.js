import {EditorView, basicSetup} from "codemirror";
import {EditorState, Transaction} from "@codemirror/state";
import {javascript} from "@codemirror/lang-javascript";
import {createRuntime} from "./runtime.js";
import {dispatch as d3Dispatch} from "d3-dispatch";

export function createEditor(container, options) {
  const {code} = options;
  const dispatcher = d3Dispatch("userInput");

  const runtime = createRuntime(code);

  runtime.onChanges(dispatch);

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

  runtime.run();

  function dispatch(changes) {
    view.dispatch({changes});
  }

  function onChange(update) {
    if (update.docChanged) {
      const code = update.state.doc.toString();
      runtime.setCode(code);
      const userEdit = update.transactions.some((tr) => tr.annotation(Transaction.userEvent));
      // Stop updating the outputs when user edit the code.
      // Prevent triggering `run` by generators, which will parse the code immediately.
      // This may lead to syntax error if inputting code is not finished.
      if (userEdit) {
        runtime.setIsRunning(false);
        dispatcher.call("userInput", null, code);
      }
    }
  }

  return {
    run: () => runtime.run(),
    on: (event, callback) => dispatcher.on(event, callback),
    destroy: () => {
      runtime.destroy();
      view.destroy();
    },
  };
}
