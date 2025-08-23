import {EditorView, basicSetup} from "codemirror";
import {EditorState, Transaction} from "@codemirror/state";
import {javascript} from "@codemirror/lang-javascript";
import {createRuntime} from "./runtime.js";

export function createEditor(container, options) {
  const {code} = options;

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
      runtime.setCode(update.state.doc.toString());
      const userEdit = update.transactions.some((tr) => tr.annotation(Transaction.userEvent));
      // Stop updating the outputs when user edit the code.
      // Prevent triggering `onRun` by generators, which will parse the code immediately.
      // This may lead to syntax error if imputing code is not finished.
      if (userEdit) runtime.setIsRunning(false);
    }
  }

  return {
    run: () => runtime.run(),
    destroy: () => {
      runtime.destroy();
      view.destroy();
    },
  };
}
