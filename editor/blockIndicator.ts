import {GutterMarker, gutter} from "@codemirror/view";
import {BlockMetadata, blockMetadataField} from "./blockMetadata";

export class BlockIndicator extends GutterMarker {
  constructor(private className: string) {
    super();
  }
  toDOM() {
    const div = document.createElement("div");
    div.className = this.className;
    return div;
  }
}

const indicatorMarkers = {
  output: {
    head: new BlockIndicator("cm-block-indicator output head"),
    tail: new BlockIndicator("cm-block-indicator output tail"),
    sole: new BlockIndicator("cm-block-indicator output head tail"),
    body: new BlockIndicator("cm-block-indicator output"),
  },
  source: {
    head: new BlockIndicator("cm-block-indicator source head"),
    tail: new BlockIndicator("cm-block-indicator source tail"),
    sole: new BlockIndicator("cm-block-indicator source head tail"),
    body: new BlockIndicator("cm-block-indicator source"),
  },
  error: {
    head: new BlockIndicator("cm-block-indicator error head"),
    tail: new BlockIndicator("cm-block-indicator error tail"),
    sole: new BlockIndicator("cm-block-indicator error head tail"),
    body: new BlockIndicator("cm-block-indicator error"),
  },
};

export const blockIndicator = gutter({
  class: "cm-blockIndicators",
  lineMarker(view, line) {
    const blocks = view.state.field(blockMetadataField, false);
    if (blocks === undefined) return null;
    const index = findEnclosingBlock(blocks, line.from);
    if (index === null) return null;
    const currentLine = view.state.doc.lineAt(line.from).number;
    const sourceFirstLine = view.state.doc.lineAt(blocks[index].source.from).number;
    const group = blocks[index].error
      ? indicatorMarkers.error
      : currentLine < sourceFirstLine
        ? indicatorMarkers.output
        : indicatorMarkers.source;
    const blockFirstLine = view.state.doc.lineAt(blocks[index].from).number;
    const blockLastLine = view.state.doc.lineAt(blocks[index].to).number;
    if (blockFirstLine === currentLine) {
      return blockLastLine === currentLine ? group.sole : group.head;
    } else if (blockLastLine === currentLine) {
      return group.tail;
    } else {
      return group.body;
    }
  },
  initialSpacer() {
    return indicatorMarkers.source.body;
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
