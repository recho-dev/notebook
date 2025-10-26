import {it, expect, describe} from "vitest";
import {transpileRechoJavaScript} from "../runtime/transpile.js";

describe("transpile", () => {
  it("should transpile block statements", () => {
    const input = `{setInterval(() => echo(1), 0);}`;
    const output = transpileRechoJavaScript(input);
    expect(output).toBe(
      `{setInterval(() => {if(__getEcho__()) {const echo = __getEcho__(); return echo(1);} return echo(1)}, 0);}`,
    );
  });
});
