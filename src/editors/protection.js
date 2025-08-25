import {EditorState} from "@codemirror/state";
import {outputLinesField} from "./outputLines";
import {Transaction} from "@codemirror/state";

export function outputProtection() {
  return EditorState.transactionFilter.of((tr) => {
    if (!tr.docChanged) return tr;

    const lines = tr.startState.field(outputLinesField);
    if (lines.size === 0) return tr;

    if (tr.annotation(Transaction.remote) === "runtime") return tr;

    const lineNumberSet = new Set(lines.map((line) => line.number));

    let shouldReject = false;
    tr.changes.iterChanges((fromA, toA) => {
      if (shouldReject) return;

      console.log("Change detected", fromA, toA);
      console.log("Line numbers: ", lineNumberSet);

      if (fromA === toA) {
        const line = tr.startState.doc.lineAt(fromA);
        if (lineNumberSet.has(line.number)) shouldReject = true;
      } else {
        const startLine = tr.startState.doc.lineAt(fromA);
        const endLine = tr.startState.doc.lineAt(toA);
        for (let line = startLine.number; line <= endLine.number; line++) {
          if (lineNumberSet.has(line)) {
            shouldReject = true;
            break;
          }
        }
      }
    });

    return shouldReject ? [] : tr;
  });
}
