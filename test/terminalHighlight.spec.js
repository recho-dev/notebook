import {describe, expect, it} from "vitest";
import {OUTPUT_PREFIX} from "../runtime/output.js";
import {highlightLine, nextHighlightState, COLORS} from "../terminal/highlight.ts";
import {App} from "../terminal/app.ts";
import {fg, italic, bold, stripAnsi, Grid} from "../terminal/screen.ts";

const keywordStyle = fg(COLORS.keyword) + bold;

describe("terminal highlighting", () => {
  it("does not italicize output comments", () => {
    const line = `${OUTPUT_PREFIX} for in`;
    const styled = highlightLine(line);

    expect(stripAnsi(styled)).toBe(line);
    expect(styled).toContain(fg(COLORS.output));
    expect(styled).not.toContain(italic);
    expect(styled).not.toContain(keywordStyle);
  });

  it("does not highlight keywords inside line comments", () => {
    const line = "// for in";
    const styled = highlightLine(line);

    expect(stripAnsi(styled)).toBe(line);
    expect(styled).toContain(italic);
    expect(styled).not.toContain(keywordStyle);
  });

  it("keeps keywords inside block comment bodies styled as comments", () => {
    const state = nextHighlightState("/**");
    const line = " * for in";
    const styled = highlightLine(line, state);

    expect(stripAnsi(styled)).toBe(line);
    expect(styled).toContain(italic);
    expect(styled).not.toContain(keywordStyle);
  });

  it("keeps the line-number gutter intact while horizontally scrolled", () => {
    const app = new App({initialPath: null, initialCode: "const answer = 42;", examplesDir: null});
    app.cols = 14;
    app.rows = 6;
    app.scrollX = 2;
    app.grid = new Grid(app.rows, app.cols);

    app.drawEditor();

    const row = 2;
    const chars = app.grid.cells.slice(row * app.cols, row * app.cols + 6).map((cell) => cell.ch);
    expect(chars.join("")).toBe("   1 n");
  });
});
