import {Decoration, ViewPlugin, ViewUpdate, EditorView, type DecorationSet} from "@codemirror/view";
import {syntaxTree} from "@codemirror/language";
import {StateField, RangeSetBuilder, type EditorState} from "@codemirror/state";
import {OUTPUT_MARK, ERROR_MARK} from "../../runtime/constant.js";

const OUTPUT_MARK_CODE_POINT = OUTPUT_MARK.codePointAt(0)!;
const ERROR_MARK_CODE_POINT = ERROR_MARK.codePointAt(0)!;

type OutputLine = {
  number: number;
  from: number;
  to: number;
  type: "output" | "error";
};

function computeLineNumbers(state: EditorState): OutputLine[] {
  const lineNumbers: OutputLine[] = [];
  syntaxTree(state).iterate({
    enter: (node) => {
      // Find top-level single-line comments.
      if (node.name === "LineComment" && node.node.parent?.name === "Script") {
        const line = state.doc.lineAt(node.from);
        // Check if the line comment covers the entire line.
        if (line.from !== node.from || line.to !== node.to) return;
        if (line.text.codePointAt(2) === OUTPUT_MARK_CODE_POINT) {
          lineNumbers.push({
            number: line.number,
            from: line.from,
            to: line.to,
            type: "output",
          });
        }
      }

      // For error messages, it's Ok if the line is not top-level.
      if (node.name === "LineComment") {
        const line = state.doc.lineAt(node.from);
        if (line.from !== node.from || line.to !== node.to) return;
        if (line.text.codePointAt(2) === ERROR_MARK_CODE_POINT) {
          lineNumbers.push({
            number: line.number,
            from: line.from,
            to: line.to,
            type: "error",
          });
        }
      }
    },
  });
  return lineNumbers;
}

export const outputLinesField = StateField.define<OutputLine[]>({
  create(state) {
    return computeLineNumbers(state);
  },
  update(value, tr) {
    return tr.docChanged ? computeLineNumbers(tr.state) : value;
  },
});

export const outputLines = outputLinesField.extension;

const highlight = Decoration.line({attributes: {class: "cm-output-line"}});
const errorHighlight = Decoration.line({attributes: {class: "cm-output-line cm-error-line"}});

export const outputDecoration = ViewPlugin.fromClass(
  class {
    #decorations: DecorationSet;

    get decorations() {
      return this.#decorations;
    }

    constructor(view: EditorView) {
      const outputLines = view.state.field(outputLinesField);
      this.#decorations = this.createDecorations(outputLines);
    }

    update(update: ViewUpdate) {
      const newOutputLines = update.state.field(outputLinesField);
      // A possible optimization would be to only update the changed lines.
      this.#decorations = this.createDecorations(newOutputLines);
    }

    createDecorations(lines: OutputLine[]) {
      const builder = new RangeSetBuilder<Decoration>();
      // Add output line decorations
      for (const {from, type} of lines) {
        if (type === "output") builder.add(from, from, highlight);
        else if (type === "error") builder.add(from, from, errorHighlight);
      }
      return builder.finish();
    }
  },
  {decorations: (v) => v.decorations},
);
