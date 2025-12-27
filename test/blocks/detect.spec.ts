import {parser} from "@lezer/javascript";
import {detectBlocksWithinRange} from "../../lib/blocks/detect.js";
import {it, expect, describe} from "vitest";
import {Text} from "@codemirror/state";

describe("block detection simple test", () => {
  it("test parse", () => {
    const code = "const x = 0;";
    const tree = parser.parse(code);
    expect(tree).toBeDefined();
  });

  function viewEachLineAsBlock(lines: string[]) {
    const blocks = [];
    for (let i = 0, from = 0; i < lines.length; i++) {
      const line = lines[i]!;
      blocks.push({from, to: from + line.length});
      from += line.length + 1;
    }
    return blocks;
  }

  it("should detect two blocks in a full parse", () => {
    const lines = [`const code = "const x = 0;";`, `const y = 1;`];
    const doc = Text.of(lines);
    const tree = parser.parse(doc.toString());
    const blocks = detectBlocksWithinRange(tree, doc, 0, doc.length);
    expect(blocks).toMatchObject(viewEachLineAsBlock(lines));
  });

  it("should detect the first block in a partial parse", () => {
    const lines = [`const code = "const x = 0;";`, `const y = 1;`];
    const doc = Text.of(lines);
    const tree = parser.parse(doc.toString());
    const blocks = detectBlocksWithinRange(tree, doc, 0, 5);
    expect(blocks).toMatchObject(viewEachLineAsBlock(lines).slice(0, 1));
  });
});
