import {RangeSetBuilder} from "@codemirror/state";
import {Decoration, EditorView, ViewPlugin, ViewUpdate, type DecorationSet} from "@codemirror/view";
import {blockMetadataField} from "./state.ts";
import type {BlockMetadata} from "./BlockMetadata.ts";

const debugGreenDecoration = Decoration.mark({attributes: {class: "cm-debug-mark green"}});
const debugRedDecoration = Decoration.mark({attributes: {class: "cm-debug-mark red"}});
// const debugBlueDecoration = Decoration.mark({attributes: {class: "cm-debug-mark blue"}});

function createDebugMarks(blockMetadata: BlockMetadata[]): DecorationSet {
  // Build mark decorations separately from line decorations to avoid conflicts
  const builder = new RangeSetBuilder<Decoration>();

  for (const {output, source} of blockMetadata) {
    // Add red marks for output ranges
    if (output !== null && output.from < output.to) {
      // console.log(`Adding red decoration for output: ${output.from}-${output.to}`);
      builder.add(output.from, output.to, debugRedDecoration);
    }

    // Add green marks for source ranges
    if (source.from < source.to) {
      // console.log(`Adding green decoration for source: ${source.from}-${source.to}`);
      builder.add(source.from, source.to, debugGreenDecoration);
    }
  }

  return builder.finish();
}

export const debugDecoration = ViewPlugin.fromClass(
  class {
    #decorations: DecorationSet;

    get decorations(): DecorationSet {
      return this.#decorations;
    }

    constructor(view: EditorView) {
      const blockMetadata = view.state.field(blockMetadataField);
      this.#decorations = createDebugMarks(blockMetadata);
    }

    update(update: ViewUpdate) {
      const blockMetadata = update.state.field(blockMetadataField);
      this.#decorations = createDebugMarks(blockMetadata);
    }
  },
  {decorations: (v) => v.decorations},
);
