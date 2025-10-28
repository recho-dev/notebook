import {Decoration, ViewPlugin, ViewUpdate, EditorView} from "@codemirror/view";
import {outputLinesField} from "./outputLines";
import {blockMetadataField} from "./blockMetadata";
import {RangeSet, RangeSetBuilder} from "@codemirror/state";

const highlight = Decoration.line({attributes: {class: "cm-output-line"}});
const errorHighlight = Decoration.line({attributes: {class: "cm-output-line cm-error-line"}});
const compactLineDecoration = Decoration.line({attributes: {class: "cm-output-line cm-compact-line"}});
const debugGreenDecoration = Decoration.mark({attributes: {class: "cm-debug-mark green"}});
const debugRedDecoration = Decoration.mark({attributes: {class: "cm-debug-mark red"}});
const debugBlueDecoration = Decoration.mark({attributes: {class: "cm-debug-mark blue"}});
// const linePrefix = Decoration.mark({attributes: {class: "cm-output-line-prefix"}});
// const lineContent = Decoration.mark({attributes: {class: "cm-output-line-content"}});

function createWidgets(lines, blockMetadata, state) {
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
  console.groupCollapsed("Decorations for block attributes");
  const builder2 = new RangeSetBuilder();
  // Add block attribute decorations
  for (const {output, attributes} of blockMetadata) {
    if (output === null) continue;
    // Apply decorations to each line in the block range
    const startLine = state.doc.lineAt(output.from);
    const endLine = state.doc.lineAt(output.to);
    console.log(`Make lines from ${startLine.number} to ${endLine.number} compact`);
    if (attributes.compact === true) {
      for (let lineNum = startLine.number; lineNum <= endLine.number; lineNum++) {
        const line = state.doc.line(lineNum);
        builder2.add(line.from, line.from, compactLineDecoration);
      }
    }
  }
  const set2 = builder2.finish();
  console.groupEnd();

  const builder3 = new RangeSetBuilder();
  for (const {output} of blockMetadata) {
    if (output === null) continue;
    builder3.add(output.from, output.to, debugRedDecoration);
  }
  const set3 = builder3.finish();

  const builder4 = new RangeSetBuilder();
  for (const {source} of blockMetadata) {
    builder4.add(source.from, source.to, debugGreenDecoration);
  }
  const set4 = builder4.finish();

  // Range sets are required to be sorted. Fortunately, they provide a method
  // to merge multiple range sets into a single sorted range set.
  return RangeSet.join([set1, set2, set3, set4]);
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
      const blockMetadata = view.state.field(blockMetadataField);
      this.#decorations = createWidgets(outputLines, blockMetadata, view.state);
    }

    /** @param {ViewUpdate} update */
    update(update) {
      const newOutputLines = update.state.field(outputLinesField);
      const blockMetadata = update.state.field(blockMetadataField);
      // A possible optimization would be to only update the changed lines.
      this.#decorations = createWidgets(newOutputLines, blockMetadata, update.state);
    }
  },
  {decorations: (v) => v.decorations},
);
