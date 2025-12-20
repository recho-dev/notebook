import {Decoration, ViewPlugin, ViewUpdate, EditorView, type DecorationSet} from "@codemirror/view";
import {blockMetadataField} from "./state.ts";
import {BlockMetadata} from "./BlockMetadata.ts";
import {RangeSetBuilder} from "@codemirror/state";

const compactLineDecoration = Decoration.line({attributes: {class: "cm-output-line cm-compact-line"}});

export const compactDecoration = ViewPlugin.fromClass(
  class {
    #decorations: DecorationSet;

    get decorations() {
      return this.#decorations;
    }

    /** @param {EditorView} view */
    constructor(view: EditorView) {
      const blockMetadata = view.state.field(blockMetadataField);
      this.#decorations = this.createDecorations(blockMetadata, view.state);
    }

    /** @param {ViewUpdate} update */
    update(update: ViewUpdate) {
      const blockMetadata = update.state.field(blockMetadataField);
      // A possible optimization would be to only update the changed lines.
      this.#decorations = this.createDecorations(blockMetadata, update.state);
    }

    createDecorations(blockMetadata: BlockMetadata[], state: EditorView["state"]) {
      const builder = new RangeSetBuilder<Decoration>();
      // Add block attribute decorations
      for (const {output, attributes} of blockMetadata) {
        if (output === null) continue;
        // Apply decorations to each line in the block range
        const startLine = state.doc.lineAt(output.from);
        const endLine = state.doc.lineAt(output.to);
        const endLineNumber = endLine.from < output.to ? endLine.number + 1 : endLine.number;
        if (attributes.compact === true) {
          for (let lineNum = startLine.number; lineNum < endLineNumber; lineNum++) {
            const line = state.doc.line(lineNum);
            builder.add(line.from, line.from, compactLineDecoration);
          }
        }
      }
      return builder.finish();
    }
  },
  {decorations: (v) => v.decorations},
);
