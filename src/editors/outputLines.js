import {syntaxTree} from "@codemirror/language";
import {StateField} from "@codemirror/state";

const OUTPUT_MARK_CODE_POINT = "➜".codePointAt(0);

/** @type {StateField<{number: number, from: number, to: number}[]>} */
export const outputLinesField = StateField.define({
  create(state) {
    return computeLineNumbers(state);
  },
  update(value, tr) {
    return tr.docChanged ? computeLineNumbers(tr.state) : value;
  },
});

function computeLineNumbers(state) {
  const lineNumbers = [];
  // for (let {from, to} of view.visibleRanges) {
  syntaxTree(state).iterate({
    // from,
    // to,
    enter: (node) => {
      // Find top-level single-line comments.
      if (node.name === "LineComment" && node.node.parent.name === "Script") {
        // Check if the line comment covers the entire line.
        const line = state.doc.lineAt(node.from);
        if (line.from === node.from && line.to === node.to && line.text.codePointAt(2) === OUTPUT_MARK_CODE_POINT) {
          lineNumbers.push({
            number: line.number,
            from: line.from,
            to: line.to,
          });
        }
      }
    },
  });
  // }
  return lineNumbers;
}

export const outputLines = outputLinesField.extension;
