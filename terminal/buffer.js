// Document buffer with character-offset edits, line index, and cursor
// helpers. Positions are byte offsets in the internal string but since we
// only use ASCII + simple Unicode, that maps 1:1 to characters here.
//
// A `change` is `{from: number, to?: number, insert: string}` matching the
// CodeMirror change-spec used by the runtime.

export class Buffer {
  constructor(initial = "") {
    this.text = initial;
    this.lineStarts = computeLineStarts(this.text);
    // Cursor as character offset.
    this.cursor = 0;
    // Selection anchor (null if no selection).
    this.anchor = null;
    // Preferred column for vertical movement.
    this.preferredCol = 0;
  }

  get length() {
    return this.text.length;
  }

  get lineCount() {
    return this.lineStarts.length;
  }

  lineRange(line) {
    const start = this.lineStarts[line];
    const end = line + 1 < this.lineStarts.length ? this.lineStarts[line + 1] - 1 : this.text.length;
    return {start, end};
  }

  lineText(line) {
    const {start, end} = this.lineRange(line);
    return this.text.slice(start, end);
  }

  posToRowCol(pos) {
    pos = Math.max(0, Math.min(pos, this.text.length));
    // Binary search in lineStarts.
    let lo = 0;
    let hi = this.lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (this.lineStarts[mid] <= pos) lo = mid;
      else hi = mid - 1;
    }
    return {row: lo, col: pos - this.lineStarts[lo]};
  }

  rowColToPos(row, col) {
    row = Math.max(0, Math.min(row, this.lineStarts.length - 1));
    const start = this.lineStarts[row];
    const end = row + 1 < this.lineStarts.length ? this.lineStarts[row + 1] - 1 : this.text.length;
    return Math.max(start, Math.min(start + col, end));
  }

  // Apply an array of CodeMirror-style change specs in document order. The
  // cursor is mapped through the changes (associativity = right).
  applyChanges(changes) {
    // Sort by `from` ascending, with delete-only first to keep ordering
    // deterministic. Runtime emits non-overlapping changes.
    const sorted = changes
      .map((c) => ({from: c.from, to: c.to ?? c.from, insert: c.insert ?? ""}))
      .sort((a, b) => a.from - b.from);
    let offset = 0;
    let text = this.text;
    let cursor = this.cursor;
    let anchor = this.anchor;
    for (const c of sorted) {
      const from = c.from + offset;
      const to = c.to + offset;
      text = text.slice(0, from) + c.insert + text.slice(to);
      const delta = c.insert.length - (to - from);
      cursor = mapPos(cursor, from, to, c.insert.length, delta);
      if (anchor !== null) anchor = mapPos(anchor, from, to, c.insert.length, delta);
      offset += delta;
    }
    this.text = text;
    this.cursor = cursor;
    this.anchor = anchor;
    this.lineStarts = computeLineStarts(this.text);
    this.preferredCol = this.posToRowCol(this.cursor).col;
  }

  insertAtCursor(s) {
    if (this.anchor !== null) this.deleteSelection();
    const at = this.cursor;
    this.text = this.text.slice(0, at) + s + this.text.slice(at);
    this.cursor = at + s.length;
    this.lineStarts = computeLineStarts(this.text);
    this.preferredCol = this.posToRowCol(this.cursor).col;
  }

  deleteSelection() {
    if (this.anchor === null) return false;
    const from = Math.min(this.anchor, this.cursor);
    const to = Math.max(this.anchor, this.cursor);
    if (from === to) {
      this.anchor = null;
      return false;
    }
    this.text = this.text.slice(0, from) + this.text.slice(to);
    this.cursor = from;
    this.anchor = null;
    this.lineStarts = computeLineStarts(this.text);
    this.preferredCol = this.posToRowCol(this.cursor).col;
    return true;
  }

  backspace() {
    if (this.deleteSelection()) return;
    if (this.cursor === 0) return;
    this.text = this.text.slice(0, this.cursor - 1) + this.text.slice(this.cursor);
    this.cursor -= 1;
    this.lineStarts = computeLineStarts(this.text);
    this.preferredCol = this.posToRowCol(this.cursor).col;
  }

  del() {
    if (this.deleteSelection()) return;
    if (this.cursor === this.text.length) return;
    this.text = this.text.slice(0, this.cursor) + this.text.slice(this.cursor + 1);
    this.lineStarts = computeLineStarts(this.text);
    this.preferredCol = this.posToRowCol(this.cursor).col;
  }

  // Cursor movement. `extend` keeps the selection anchor (creates one if none).
  moveTo(pos, extend = false) {
    pos = Math.max(0, Math.min(pos, this.text.length));
    if (extend) {
      if (this.anchor === null) this.anchor = this.cursor;
    } else {
      this.anchor = null;
    }
    this.cursor = pos;
    this.preferredCol = this.posToRowCol(this.cursor).col;
  }

  moveLeft(extend = false) {
    this.moveTo(Math.max(0, this.cursor - 1), extend);
  }
  moveRight(extend = false) {
    this.moveTo(Math.min(this.text.length, this.cursor + 1), extend);
  }
  moveUp(extend = false) {
    const {row} = this.posToRowCol(this.cursor);
    if (row === 0) return this.moveTo(0, extend);
    const {start, end} = this.lineRange(row - 1);
    const col = Math.min(this.preferredCol, end - start);
    if (extend) {
      if (this.anchor === null) this.anchor = this.cursor;
    } else {
      this.anchor = null;
    }
    this.cursor = start + col;
  }
  moveDown(extend = false) {
    const {row} = this.posToRowCol(this.cursor);
    if (row >= this.lineStarts.length - 1) return this.moveTo(this.text.length, extend);
    const {start, end} = this.lineRange(row + 1);
    const col = Math.min(this.preferredCol, end - start);
    if (extend) {
      if (this.anchor === null) this.anchor = this.cursor;
    } else {
      this.anchor = null;
    }
    this.cursor = start + col;
  }
  moveHome(extend = false) {
    const {row} = this.posToRowCol(this.cursor);
    const {start, end} = this.lineRange(row);
    // Smart-home: jump to first non-whitespace char first.
    const line = this.text.slice(start, end);
    const indent = line.match(/^\s*/)[0].length;
    const target = this.cursor === start + indent ? start : start + indent;
    this.moveTo(target, extend);
  }
  moveEnd(extend = false) {
    const {row} = this.posToRowCol(this.cursor);
    const {end} = this.lineRange(row);
    this.moveTo(end, extend);
  }

  // Word-boundary helpers (for Alt+Left/Right).
  wordLeft(extend = false) {
    let p = this.cursor;
    if (p === 0) return;
    p--;
    while (p > 0 && /\s/.test(this.text[p])) p--;
    while (p > 0 && /\w/.test(this.text[p - 1])) p--;
    this.moveTo(p, extend);
  }
  wordRight(extend = false) {
    let p = this.cursor;
    const n = this.text.length;
    while (p < n && !/\w/.test(this.text[p])) p++;
    while (p < n && /\w/.test(this.text[p])) p++;
    this.moveTo(p, extend);
  }

  selection() {
    if (this.anchor === null) return null;
    return {from: Math.min(this.anchor, this.cursor), to: Math.max(this.anchor, this.cursor)};
  }
}

function computeLineStarts(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) === 10) starts.push(i + 1);
  }
  return starts;
}

function mapPos(pos, from, to, insLen, delta) {
  // Right-associative mapping (matches CodeMirror default for forward map).
  if (pos <= from) return pos;
  if (pos >= to) return pos + delta;
  // Position landed inside the replaced range — clamp to end of insertion.
  return from + insLen;
}
