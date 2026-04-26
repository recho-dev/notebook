// Low-level terminal IO: alternate-screen, raw mode, mouse, key parsing,
// styled writing and a tiny diff-aware grid renderer.
//
// Everything is encoded as ANSI/CSI/SGR escape sequences and written to
// stdout. Input is read raw from stdin and parsed into key/mouse events.

const ESC = "\x1b";
export const CSI = ESC + "[";

export const enterAlt = CSI + "?1049h";
export const leaveAlt = CSI + "?1049l";
export const hideCursor = CSI + "?25l";
export const showCursor = CSI + "?25h";
export const clearScreen = CSI + "2J";
export const home = CSI + "H";

// SGR mouse with extended coordinates + button-press tracking + drag tracking.
export const enableMouse = CSI + "?1000h" + CSI + "?1002h" + CSI + "?1006h";
export const disableMouse = CSI + "?1006l" + CSI + "?1002l" + CSI + "?1000l";

export const reset = CSI + "0m";

export function moveTo(row, col) {
  return CSI + (row + 1) + ";" + (col + 1) + "H";
}

export function fg(n) {
  return CSI + "38;5;" + n + "m";
}
export function bg(n) {
  return CSI + "48;5;" + n + "m";
}
export function rgbFg(r, g, b) {
  return CSI + "38;2;" + r + ";" + g + ";" + b + "m";
}
export function rgbBg(r, g, b) {
  return CSI + "48;2;" + r + ";" + g + ";" + b + "m";
}
export const bold = CSI + "1m";
export const dim = CSI + "2m";
export const italic = CSI + "3m";
export const underline = CSI + "4m";
export const inverse = CSI + "7m";
export const noBold = CSI + "22m";
export const noItalic = CSI + "23m";
export const noUnderline = CSI + "24m";
export const noInverse = CSI + "27m";

// Strip SGR codes for length measurement.
const ANSI_RE = /\x1b\[[0-9;]*[A-Za-z]/g;
export function stripAnsi(s) {
  return s.replace(ANSI_RE, "");
}
export function visibleLength(s) {
  return stripAnsi(s).length;
}

// Pad a styled string to width n using spaces (preserving ANSI).
export function padToWidth(s, n) {
  const v = visibleLength(s);
  if (v >= n) return s;
  return s + " ".repeat(n - v);
}

// Truncate styled string to visible width n (drops trailing chars; ignores
// the rare case of mid-escape splitting which is not produced by us).
export function truncateToWidth(s, n) {
  if (visibleLength(s) <= n) return s;
  let out = "";
  let used = 0;
  let i = 0;
  while (i < s.length && used < n) {
    if (s[i] === "\x1b" && s[i + 1] === "[") {
      const end = s.indexOf("m", i);
      if (end === -1) break;
      out += s.slice(i, end + 1);
      i = end + 1;
      continue;
    }
    out += s[i];
    used++;
    i++;
  }
  return out + reset;
}

// ---------------------------------------------------------------------------
// Input parsing: keyboard + mouse events.

// A key event has: {type: "key", name, ch, ctrl, alt, shift}
// A mouse event has: {type: "mouse", action, button, row, col, mods}
// A resize event: {type: "resize", rows, cols}
// A paste event: {type: "paste", text}

const NAMED = new Map([
  [13, "enter"],
  [10, "enter"],
  [9, "tab"],
  [127, "backspace"],
  [8, "backspace"],
  [27, "escape"],
  [32, "space"],
]);

export function parseInput(buf) {
  // Returns array of events and the number of bytes consumed (some bytes
  // may remain if a sequence is partial; for simplicity we always consume
  // everything we recognized).
  const events = [];
  let i = 0;
  const s = buf;
  while (i < s.length) {
    const ch = s.charCodeAt(i);
    if (ch === 0x1b) {
      // Escape sequences
      if (s[i + 1] === "[") {
        // CSI
        let j = i + 2;
        // SGR mouse: ESC[<n;n;n[Mm]
        if (s[j] === "<") {
          let k = j + 1;
          while (k < s.length && s[k] !== "M" && s[k] !== "m") k++;
          if (k >= s.length) break;
          const params = s.slice(j + 1, k).split(";").map(Number);
          const action = s[k] === "M" ? "press" : "release";
          const [code, col, row] = params;
          // code bits: low 2 = button (0=left,1=mid,2=right,3=release-old)
          // bit 5 (32) = motion, bit 6 (64) = wheel
          const button = code & 3;
          const motion = (code & 32) !== 0;
          const wheel = (code & 64) !== 0;
          const shift = (code & 4) !== 0;
          const meta = (code & 8) !== 0;
          const ctrl = (code & 16) !== 0;
          let kind = "press";
          if (action === "release") kind = "release";
          else if (motion) kind = "drag";
          if (wheel) kind = button === 0 ? "wheel-up" : "wheel-down";
          events.push({
            type: "mouse",
            kind,
            button,
            row: row - 1,
            col: col - 1,
            shift,
            meta,
            ctrl,
          });
          i = k + 1;
          continue;
        }
        // Extract intermediate
        let k = j;
        while (k < s.length && s.charCodeAt(k) >= 0x30 && s.charCodeAt(k) <= 0x3f) k++;
        const finalChar = s[k];
        const params = s.slice(j, k);
        const seq = "[" + params + finalChar;
        const ev = csiToEvent(seq);
        if (ev) events.push(ev);
        i = k + 1;
        continue;
      }
      if (s[i + 1] === "O") {
        // SS3 (function keys, sometimes home/end)
        const code = s[i + 2];
        let name = null;
        if (code === "P") name = "f1";
        else if (code === "Q") name = "f2";
        else if (code === "R") name = "f3";
        else if (code === "S") name = "f4";
        else if (code === "H") name = "home";
        else if (code === "F") name = "end";
        if (name) events.push({type: "key", name, ch: "", ctrl: false, alt: false, shift: false});
        i += 3;
        continue;
      }
      // Alt+key
      if (i + 1 < s.length) {
        const next = s.charCodeAt(i + 1);
        if (next >= 0x20 && next < 0x7f) {
          events.push({
            type: "key",
            name: NAMED.get(next) || s[i + 1],
            ch: s[i + 1],
            ctrl: false,
            alt: true,
            shift: false,
          });
          i += 2;
          continue;
        }
      }
      // Lone escape
      events.push({type: "key", name: "escape", ch: "", ctrl: false, alt: false, shift: false});
      i++;
      continue;
    }
    // Control characters
    if (ch < 0x20 || ch === 0x7f) {
      const named = NAMED.get(ch);
      if (named) {
        events.push({type: "key", name: named, ch: "", ctrl: false, alt: false, shift: false});
      } else {
        // Ctrl+letter: Ctrl+A=1 ... Ctrl+Z=26
        const letter = String.fromCharCode(ch + 96);
        events.push({type: "key", name: letter, ch: letter, ctrl: true, alt: false, shift: false});
      }
      i++;
      continue;
    }
    // Printable text — group consecutive bytes into a single text event
    let j = i;
    while (j < s.length) {
      const c = s.charCodeAt(j);
      if (c < 0x20 || c === 0x7f || c === 0x1b) break;
      j++;
    }
    events.push({type: "text", text: s.slice(i, j)});
    i = j;
  }
  return events;
}

function csiToEvent(seq) {
  // seq is everything after the leading ESC, e.g. "[A" or "[1;5C"
  // Common sequences
  const map = {
    "[A": "up",
    "[B": "down",
    "[C": "right",
    "[D": "left",
    "[H": "home",
    "[F": "end",
    "[2~": "insert",
    "[3~": "delete",
    "[5~": "pageup",
    "[6~": "pagedown",
    "[1~": "home",
    "[4~": "end",
    "[7~": "home",
    "[8~": "end",
    "[Z": "shift-tab",
  };
  if (map[seq]) {
    return {type: "key", name: map[seq], ch: "", ctrl: false, alt: false, shift: seq === "[Z"};
  }
  // Modifier sequences like "[1;5C" (Ctrl+Right). Strip "1;<m>" prefix.
  const m = seq.match(/^\[(\d+);(\d+)([A-Za-z~])$/);
  if (m) {
    const code = parseInt(m[2], 10) - 1;
    const shift = (code & 1) !== 0;
    const alt = (code & 2) !== 0;
    const ctrl = (code & 4) !== 0;
    const tail = m[1] + m[3];
    const sub = "[" + (m[3] === "~" ? m[1] + "~" : m[3]);
    const baseMap = {
      "[A": "up",
      "[B": "down",
      "[C": "right",
      "[D": "left",
      "[H": "home",
      "[F": "end",
      "[3~": "delete",
      "[1~": "home",
      "[4~": "end",
      "[5~": "pageup",
      "[6~": "pagedown",
    };
    const name = baseMap[sub];
    if (name) return {type: "key", name, ch: "", ctrl, alt, shift};
  }
  return null;
}

// ---------------------------------------------------------------------------
// Grid: a virtual screen made of style+char per cell. We diff against the
// previously emitted grid and only repaint cells that changed.

export class Grid {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.cells = new Array(rows * cols);
    for (let i = 0; i < this.cells.length; i++) this.cells[i] = {ch: " ", style: ""};
  }

  resize(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.cells = new Array(rows * cols);
    for (let i = 0; i < this.cells.length; i++) this.cells[i] = {ch: " ", style: ""};
  }

  clear() {
    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i].ch = " ";
      this.cells[i].style = "";
    }
  }

  setCell(row, col, ch, style) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return;
    const cell = this.cells[row * this.cols + col];
    cell.ch = ch;
    cell.style = style;
  }

  // Write a styled string (already containing SGR codes) starting at (row,
  // col), clipping at the right edge. The provided `style` is the style at
  // entry; SGR escapes inside `s` may modify the live style.
  writeStyled(row, col, s, baseStyle = "") {
    if (row < 0 || row >= this.rows) return col;
    let style = baseStyle;
    let i = 0;
    let c = col;
    while (i < s.length && c < this.cols) {
      if (s[i] === "\x1b" && s[i + 1] === "[") {
        const end = s.indexOf("m", i);
        if (end === -1) break;
        style += s.slice(i, end + 1);
        i = end + 1;
        continue;
      }
      // Skip combining \r etc.
      const ch = s[i];
      if (ch === "\n" || ch === "\r") {
        i++;
        continue;
      }
      this.setCell(row, c, ch, style);
      c++;
      i++;
    }
    return c;
  }

  // Fill a row range with the given (plain) char and style.
  fillRect(row0, col0, row1, col1, ch, style) {
    for (let r = row0; r < row1; r++) {
      for (let c = col0; c < col1; c++) {
        this.setCell(r, c, ch, style);
      }
    }
  }
}

// Render `next` to stdout, computing a minimal diff from `prev`.
export function renderDiff(prev, next, write) {
  let out = "";
  let curStyle = "";
  let curRow = -1;
  let curCol = -1;
  for (let r = 0; r < next.rows; r++) {
    for (let c = 0; c < next.cols; c++) {
      const i = r * next.cols + c;
      const a = prev && prev.rows === next.rows && prev.cols === next.cols ? prev.cells[i] : null;
      const b = next.cells[i];
      if (a && a.ch === b.ch && a.style === b.style) continue;
      if (curRow !== r || curCol !== c) {
        out += moveTo(r, c);
        curRow = r;
        curCol = c;
      }
      if (b.style !== curStyle) {
        out += reset + b.style;
        curStyle = b.style;
      }
      out += b.ch;
      curCol++;
    }
  }
  if (out) write(reset + out + reset);
}
