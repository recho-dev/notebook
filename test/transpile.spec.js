import {it, expect, describe} from "vitest";
import {transpileRechoJavaScript} from "../runtime/transpile.js";

describe("transpile", () => {
  it("should transpile block statements", () => {
    const input = `{setInterval(() => echo(1), 0);}`;
    const output = transpileRechoJavaScript(input);
    expect(output).toBe(
      `let __cellEcho__ = __getEcho__();{setInterval(() =>{const echo = __getEcho__() || __cellEcho__;return  echo(1);}, 0);}`,
    );
  });
});
