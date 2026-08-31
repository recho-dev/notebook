import {afterEach, describe, expect, it} from "vitest";
import {COLORS, setTheme, highlightLine} from "../terminal/highlight.ts";
import {detectTerminalTheme} from "../terminal/theme.ts";

// In the test environment stdin is not a TTY, so the OSC 11 query resolves
// null immediately and detection falls through to the env-based paths.
describe("terminal theme detection", () => {
  afterEach(() => {
    delete process.env.RECHO_THEME;
    delete process.env.COLORFGBG;
    setTheme("dark");
  });

  it("honors the RECHO_THEME override", async () => {
    process.env.RECHO_THEME = "light";
    process.env.COLORFGBG = "15;0"; // says dark — override must win
    expect(await detectTerminalTheme()).toBe("light");
  });

  it("falls back to COLORFGBG", async () => {
    process.env.COLORFGBG = "15;0";
    expect(await detectTerminalTheme()).toBe("dark");
    process.env.COLORFGBG = "0;15";
    expect(await detectTerminalTheme()).toBe("light");
    process.env.COLORFGBG = "0;default;7";
    expect(await detectTerminalTheme()).toBe("light");
  });

  it("defaults to dark", async () => {
    expect(await detectTerminalTheme()).toBe("dark");
  });
});

describe("setTheme", () => {
  afterEach(() => setTheme("dark"));

  it("swaps the palette in place so existing references update", () => {
    const ref = COLORS;
    const darkFg = COLORS.fg;
    setTheme("light");
    expect(ref.fg).not.toBe(darkFg);
    expect(ref).toBe(COLORS);
    setTheme("dark");
    expect(ref.fg).toBe(darkFg);
  });

  it("changes highlight output", () => {
    const dark = highlightLine("const x = 1;");
    setTheme("light");
    const light = highlightLine("const x = 1;");
    expect(light).not.toBe(dark);
  });
});
