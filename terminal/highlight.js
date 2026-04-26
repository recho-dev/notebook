// Lightweight JavaScript syntax highlighting that emits styled spans for
// each line. Output line is treated specially: if the line begins with the
// runtime's output or error prefix it's colored as such. Everything else
// gets a single regex-based pass over keyword/number/string/comment.

import {fg, dim, italic, reset, bold} from "./screen.js";
import {OUTPUT_PREFIX, ERROR_PREFIX} from "../runtime/output.js";

// Theme palette (256-color indices).
const C = {
  fg: 252,
  comment: 244,
  keyword: 175,
  string: 150,
  number: 222,
  fn: 110,
  punct: 246,
  output: 114, // green
  error: 203, // red
  output_dim: 65,
  ln: 240,
  lnActive: 252,
  border: 240,
  borderHi: 250,
  title: 252,
  status: 250,
  dimText: 245,
  panelBg: 235,
  selBg: 24,
  cursorLineBg: 236,
  marker: 110,
  hot: 209,
};

export const COLORS = C;

const KEYWORDS = new Set([
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "from",
  "function",
  "if",
  "import",
  "in",
  "instanceof",
  "let",
  "new",
  "null",
  "of",
  "return",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "true",
  "try",
  "typeof",
  "undefined",
  "var",
  "void",
  "while",
  "with",
  "yield",
  "async",
  "await",
]);

const TOKEN_RE = new RegExp(
  [
    String.raw`\/\/.*$`, // line comment (until end)
    String.raw`\/\*[\s\S]*?\*\/`, // block comment
    String.raw`"(?:\\.|[^"\\])*"`, // double-quoted string
    String.raw`'(?:\\.|[^'\\])*'`, // single-quoted string
    String.raw`\`(?:\\.|[^\\\`])*\``, // template literal (no expressions support)
    String.raw`\b\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?\b`, // number
    String.raw`\b[A-Za-z_$][\w$]*\b`, // identifier
    String.raw`[{}()[\];,.<>:?!+\-*/%=&|^~]`,
  ].join("|"),
  "g",
);

// Highlight a single line of source (without the runtime output prefix).
// Returns a styled string (length = visible chars equal to `line`).
export function highlightLine(line) {
  // Comment? Whole-line color.
  const trimmed = line.trimStart();
  if (trimmed.startsWith(OUTPUT_PREFIX) || trimmed.startsWith("//➜")) {
    return fg(C.output) + italic + line + reset;
  }
  if (trimmed.startsWith(ERROR_PREFIX) || trimmed.startsWith("//✗")) {
    return fg(C.error) + italic + line + reset;
  }
  if (trimmed.startsWith("//")) {
    return fg(C.comment) + italic + line + reset;
  }

  let out = fg(C.fg);
  let last = 0;
  TOKEN_RE.lastIndex = 0;
  let m;
  while ((m = TOKEN_RE.exec(line)) !== null) {
    if (m.index > last) {
      out += line.slice(last, m.index);
    }
    const tok = m[0];
    let style;
    if (tok.startsWith("//")) style = fg(C.comment) + italic;
    else if (tok.startsWith("/*")) style = fg(C.comment) + italic;
    else if (tok[0] === '"' || tok[0] === "'" || tok[0] === "`") style = fg(C.string);
    else if (/^\d/.test(tok)) style = fg(C.number);
    else if (/^[A-Za-z_$]/.test(tok) && KEYWORDS.has(tok)) style = fg(C.keyword) + bold;
    else if (/^[A-Za-z_$]/.test(tok)) {
      // Function-call heuristic: identifier followed by '('.
      const next = line[m.index + tok.length];
      if (next === "(") style = fg(C.fn);
      else style = fg(C.fg);
    } else style = fg(C.punct);

    out += style + tok + reset + fg(C.fg);
    last = m.index + tok.length;
  }
  if (last < line.length) out += line.slice(last);
  out += reset;
  return out;
}
