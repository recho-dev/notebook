import {Decoration, ViewPlugin, ViewUpdate, EditorView} from "@codemirror/view";
import {outputLinesField} from "./outputLines";
import {RangeSetBuilder} from "@codemirror/state";

const highlight = Decoration.line({attributes: {class: "cm-output-line"}});

function createWidgets(lines) {
  const builder = new RangeSetBuilder();
  for (const {from} of lines) {
    builder.add(from, from, highlight);
  }
  return builder.finish();
}

export const outputDecoration = ViewPlugin.fromClass(
  class {
    #decorations;

    get decorations() {
      return this.#decorations;
    }

    /** @param {EditorView} view */
    constructor(view) {
      this.#decorations = createWidgets(view.state.field(outputLinesField));
    }

    /** @param {ViewUpdate} update */
    update(update) {
      const newOutputLines = update.state.field(outputLinesField);
      // A possible optimization would be to only update the changed lines.
      this.#decorations = createWidgets(newOutputLines);
    }
  },
  {decorations: (v) => v.decorations},
);
