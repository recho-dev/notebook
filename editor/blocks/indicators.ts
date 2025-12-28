import {GutterMarker, gutter} from "@codemirror/view";
import {BlockMetadata} from "./BlockMetadata.ts";
import {blockMetadataField} from "./state.ts";

export class BlockIndicator extends GutterMarker {
  constructor(
    private className: string,
    private blockId: string | null = null,
  ) {
    super();
  }
  toDOM() {
    const div = document.createElement("div");
    div.className = this.className;
    div.dataset.blockId = this.blockId ?? undefined;
    return div;
  }
}

const constant =
  <T>(x: T) =>
  (): T =>
    x;

const indicatorMarkers = {
  output: {
    head: (blockId: string) => new BlockIndicator("cm-block-indicator output head", blockId),
    tail: (blockId: string) => new BlockIndicator("cm-block-indicator output tail", blockId),
    sole: (blockId: string) => new BlockIndicator("cm-block-indicator output head tail", blockId),
    body: (blockId: string) => new BlockIndicator("cm-block-indicator output", blockId),
  },
  source: {
    head: constant(new BlockIndicator("cm-block-indicator source head")),
    tail: constant(new BlockIndicator("cm-block-indicator source tail")),
    sole: constant(new BlockIndicator("cm-block-indicator source head tail")),
    body: constant(new BlockIndicator("cm-block-indicator source")),
  },
  error: {
    head: constant(new BlockIndicator("cm-block-indicator error head")),
    tail: constant(new BlockIndicator("cm-block-indicator error tail")),
    sole: constant(new BlockIndicator("cm-block-indicator error head tail")),
    body: constant(new BlockIndicator("cm-block-indicator error")),
  },
};

export const blockIndicator = gutter({
  class: "cm-blockIndicators",
  /**
   * Create a gutter marker for the given line.
   *
   * @param view the editor view
   * @param line a record used to represent information about a block-level element
   * in the editor view.
   * @returns a gutter marker for the line
   */
  lineMarker(view, line) {
    // Get the block metadata from the state.
    const blocks = view.state.field(blockMetadataField, false);
    if (blocks === undefined) return null;

    // Find the block that contains the given line.
    const index = findEnclosingBlock(blocks, line.from);
    if (index === null) return null;

    // Get the current line number.
    const block = blocks[index];
    const currentLine = view.state.doc.lineAt(line.from).number;

    // Determine the positional relationship between the current line and the block.
    const sourceFirstLine = view.state.doc.lineAt(block.source.from).number;
    const group = block.error
      ? indicatorMarkers.error
      : currentLine < sourceFirstLine
        ? indicatorMarkers.output
        : indicatorMarkers.source;

    // Determine the gutter marker to use.
    const blockFirstLine = view.state.doc.lineAt(block.from).number;
    const blockLastLine = view.state.doc.lineAt(block.to).number;
    if (blockFirstLine === currentLine) {
      return blockLastLine === currentLine ? group.sole(block.id) : group.head(block.id);
    } else if (blockLastLine === currentLine) {
      return group.tail(block.id);
    } else {
      return group.body(block.id);
    }
  },
  initialSpacer() {
    return indicatorMarkers.source.body();
  },
});

function findEnclosingBlock(blocks: BlockMetadata[], pos: number): number | null {
  let left = 0;
  let right = blocks.length - 1;

  while (left <= right) {
    const middle = (left + right) >>> 1;
    const pivot = blocks[middle];
    if (pos < pivot.from) {
      right = middle - 1;
    } else if (pos > pivot.to) {
      left = middle + 1;
    } else {
      return middle;
    }
  }

  return null;
}
