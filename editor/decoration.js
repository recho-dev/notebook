import {Decoration, ViewPlugin, ViewUpdate, EditorView} from "@codemirror/view";
import {outputLinesField} from "./outputLines";
import {blockAttributesField} from "./blockAttributes";
import {RangeSet, RangeSetBuilder} from "@codemirror/state";

const highlight = Decoration.line({attributes: {class: "cm-output-line"}});
const errorHighlight = Decoration.line({attributes: {class: "cm-output-line cm-error-line"}});
const compactLineDecoration = Decoration.line({attributes: {class: "cm-output-line cm-compact-line"}});
// const linePrefix = Decoration.mark({attributes: {class: "cm-output-line-prefix"}});
// const lineContent = Decoration.mark({attributes: {class: "cm-output-line-content"}});

function createWidgets(lines, blockAttributes, state) {
  // Build the range set for output lines.
  const builder1 = new RangeSetBuilder();
  // Add output line decorations
  for (const {from, type} of lines) {
    if (type === "output") builder1.add(from, from, highlight);
    else if (type === "error") builder1.add(from, from, errorHighlight);
    // builder.add(from, from + 3, linePrefix);
    // builder.add(from + 4, to, lineContent);
  }
  const set1 = builder1.finish();

  // Build the range set for block attributes.
  const builder2 = new RangeSetBuilder();
  // Add block attribute decorations
  for (const {from, to, attributes} of blockAttributes) {
    // Apply decorations to each line in the block range
    const startLine = state.doc.lineAt(from);
    const endLine = state.doc.lineAt(to);

    for (let lineNum = startLine.number; lineNum <= endLine.number; lineNum++) {
      const line = state.doc.line(lineNum);
      if (attributes.compact === true) {
        builder2.add(line.from, line.from, compactLineDecoration);
      }
    }
  }
  const set2 = builder2.finish();

  // Range sets are required to be sorted. Fortunately, they provide a method
  // to merge multiple range sets into a single sorted range set.
  return RangeSet.join([set1, set2]);
}

export const outputDecoration = ViewPlugin.fromClass(
  class {
    #decorations;

    get decorations() {
      return this.#decorations;
    }

    /** @param {EditorView} view */
    constructor(view) {
      const outputLines = view.state.field(outputLinesField);
      const blockAttributes = view.state.field(blockAttributesField);
      this.#decorations = createWidgets(outputLines, blockAttributes, view.state);
    }

    /** @param {ViewUpdate} update */
    update(update) {
      const newOutputLines = update.state.field(outputLinesField);
      const newBlockAttributes = update.state.field(blockAttributesField);
      // A possible optimization would be to only update the changed lines.
      this.#decorations = createWidgets(newOutputLines, newBlockAttributes, update.state);
    }
  },
  {decorations: (v) => v.decorations},
);
