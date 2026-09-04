import {describe, expect, it} from "vitest";
import {Buffer} from "../terminal/buffer.ts";
import {trimChange} from "../runtime/index.js";

// A runtime rewrite of an output block must not kick the cursor out of it:
// positions inside a replaced range are restored at the same row/col
// relative to the range.
describe("cursor stability across runtime rewrites", () => {
  const setup = () => {
    // 0: "code();"  1-3: output block  4: "more();"
    const b = new Buffer("code();\n//➜ aaa\n//➜ bbb\n//➜ ccc\nmore();\n");
    const blockFrom = b.rowColToPos(1, 0);
    const blockTo = b.rowColToPos(4, 0);
    return {b, blockFrom, blockTo};
  };

  it("keeps the cursor at its row/col when a same-shaped block is rewritten", () => {
    const {b, blockFrom, blockTo} = setup();
    b.cursor = b.rowColToPos(2, 4); // on "bbb", after the prefix
    b.applyChanges([{from: blockFrom, to: blockTo, insert: "//➜ xxx\n//➜ yyy\n//➜ zzz\n"}]);
    expect(b.posToRowCol(b.cursor)).toEqual({row: 2, col: 4});
    expect(b.lineText(2)).toBe("//➜ yyy");
  });

  it("keeps the block-relative position when lines above the block shift", () => {
    const {b, blockFrom, blockTo} = setup();
    b.cursor = b.rowColToPos(2, 4);
    b.applyChanges([
      {from: 0, to: 0, insert: "//➜ new\n"}, // another cell's output grows above
      {from: blockFrom, to: blockTo, insert: "//➜ xxx\n//➜ yyy\n//➜ zzz\n"},
    ]);
    // The whole block moved down one line; the cursor moved with it.
    expect(b.posToRowCol(b.cursor)).toEqual({row: 3, col: 4});
  });

  it("clamps into the block when it shrinks", () => {
    const {b, blockFrom, blockTo} = setup();
    b.cursor = b.rowColToPos(3, 4); // last output line
    b.applyChanges([{from: blockFrom, to: blockTo, insert: "//➜ x\n"}]);
    const {row, col} = b.posToRowCol(b.cursor);
    expect(row).toBe(1); // clamped into the remaining output line
    expect(col).toBeLessThanOrEqual("//➜ x".length);
  });

  it("maps the selection anchor the same way", () => {
    const {b, blockFrom, blockTo} = setup();
    b.anchor = b.rowColToPos(1, 4);
    b.cursor = b.rowColToPos(3, 4);
    b.applyChanges([{from: blockFrom, to: blockTo, insert: "//➜ xxx\n//➜ yyy\n//➜ zzz\n"}]);
    expect(b.posToRowCol(b.anchor)).toEqual({row: 1, col: 4});
    expect(b.posToRowCol(b.cursor)).toEqual({row: 3, col: 4});
  });

  it("leaves positions outside the changes to plain mapping", () => {
    const {b, blockFrom, blockTo} = setup();
    b.cursor = b.rowColToPos(4, 3); // in "more();"
    b.applyChanges([{from: blockFrom, to: blockTo, insert: "//➜ x\n"}]);
    expect(b.lineText(b.posToRowCol(b.cursor).row)).toBe("more();");
    expect(b.posToRowCol(b.cursor).col).toBe(3);
  });
});

// The runtime shrinks each block replacement to the span that differs, so
// unchanged output dispatches nothing and animations touch only the moving
// region.
describe("trimChange", () => {
  it("drops identical replacements", () => {
    expect(trimChange("ab//➜ out\ncd", {from: 2, to: 10, insert: "//➜ out\n"})).toBeNull();
  });

  it("narrows to the differing span", () => {
    const old = "//➜ frame 1\n";
    const doc = "x();\n" + old;
    const t = trimChange(doc, {from: 5, to: 5 + old.length, insert: "//➜ frame 2\n"});
    expect(t).toEqual({from: 5 + 10, to: 5 + 11, insert: "2"});
  });

  it("passes through fully-different replacements", () => {
    const c = {from: 0, to: 3, insert: "xyzw"};
    expect(trimChange("abc", c)).toBe(c);
  });

  it("handles pure inserts and pure deletes", () => {
    const ins = {from: 2, to: 2, insert: "new"};
    expect(trimChange("abcd", ins)).toBe(ins);
    const del = {from: 1, to: 3, insert: ""};
    expect(trimChange("abcd", del)).toBe(del);
  });
});
