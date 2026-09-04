// Detect whether the terminal has a light or dark background, so the TUI
// can pick a palette with proper contrast.
//
// Resolution order:
//   1. RECHO_THEME env var ("light" | "dark") — explicit override.
//   2. OSC 11 query — asks the terminal for its background color and derives
//      the answer from its luminance. Supported by iTerm2, Terminal.app,
//      kitty, WezTerm, Alacritty, VS Code, and most modern emulators.
//   3. COLORFGBG env var — set by some terminals (rxvt lineage, Konsole).
//   4. Default: dark.

export type Theme = "dark" | "light";

type Rgb = {r: number; g: number; b: number};

// Parse one hex component from an OSC color response. Components are 1-4
// hex digits scaled to their own width (e.g. "ff"/0xff and "ffff"/0xffff
// both mean 1.0).
function hexComponent(s: string): number {
  return parseInt(s, 16) / (16 ** s.length - 1);
}

// Query the terminal's background color via OSC 11. Resolves null when the
// terminal doesn't answer within `timeoutMs` (many multiplexers and CI
// pseudo-terminals swallow the query).
function queryBackgroundColor(timeoutMs: number): Promise<Rgb | null> {
  return new Promise((resolve) => {
    const {stdin, stdout} = process;
    if (!stdin.isTTY || !stdout.isTTY || typeof stdin.setRawMode !== "function") return resolve(null);

    const wasRaw = stdin.isRaw;
    const wasPaused = stdin.isPaused();
    let buffer = "";
    let done = false;

    const finish = (result: Rgb | null) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      stdin.off("data", onData);
      if (!wasRaw) stdin.setRawMode(false);
      if (wasPaused) stdin.pause();
      resolve(result);
    };

    const onData = (chunk: Buffer | string) => {
      buffer += chunk.toString();
      // Match the full response including its BEL / ST terminator, so no
      // stray bytes of it leak into the app's input handler afterwards.
      const m = buffer.match(
        /\x1b\]11;rgba?:([0-9a-fA-F]+)\/([0-9a-fA-F]+)\/([0-9a-fA-F]+)[^\x07\x1b]*(?:\x07|\x1b\\)/,
      );
      if (m) finish({r: hexComponent(m[1]), g: hexComponent(m[2]), b: hexComponent(m[3])});
    };

    stdin.setRawMode(true);
    stdin.resume();
    stdin.on("data", onData);
    stdout.write("\x1b]11;?\x07");
    const timer = setTimeout(() => finish(null), timeoutMs);
  });
}

function themeFromColorFgBg(): Theme | null {
  // Format: "<fg>;<bg>" or "<fg>;<default>;<bg>". Background palette index
  // 7 (white) and 9+ (bright colors) mean a light background.
  const raw = process.env.COLORFGBG;
  if (!raw) return null;
  const bg = Number(raw.split(";").pop());
  if (!Number.isFinite(bg)) return null;
  return bg === 7 || bg >= 9 ? "light" : "dark";
}

export async function detectTerminalTheme(timeoutMs = 200): Promise<Theme> {
  const override = process.env.RECHO_THEME;
  if (override === "light" || override === "dark") return override;

  const bg = await queryBackgroundColor(timeoutMs);
  if (bg) {
    const luminance = 0.2126 * bg.r + 0.7152 * bg.g + 0.0722 * bg.b;
    return luminance > 0.5 ? "light" : "dark";
  }

  return themeFromColorFgBg() ?? "dark";
}
