// Terminal Recho Notebook — TUI editor that runs the same notebook runtime
// used by the web app and echoes output as inline `//➜` comments above each
// expression. Mouse-aware (click to focus, drag to select, wheel to scroll).

import fs from "node:fs";
import path from "node:path";
import {createRuntime} from "../runtime/index.js";
import {OUTPUT_PREFIX, ERROR_PREFIX} from "../runtime/output.js";
import {Buffer} from "./buffer.js";
import {highlightLine, COLORS} from "./highlight.js";
import * as scr from "./screen.js";
import {fg, bg, rgbBg, rgbFg, dim, italic, reset, bold, inverse, moveTo, padToWidth, truncateToWidth, visibleLength} from "./screen.js";

const HEADER_ROWS = 2;
const FOOTER_ROWS = 2;
const GUTTER = 5; // " 123 "

const HELP_LINES = [
  "Welcome to Recho · the reactive notebook in your terminal.",
  "Type code; press ^S to run it. Output appears inline as //➜ comments.",
];

export class App {
  constructor({initialPath, initialCode, examplesDir}) {
    this.path = initialPath;
    this.examplesDir = examplesDir;
    this.buffer = new Buffer(initialCode);
    this.scrollY = 0;
    this.scrollX = 0;
    this.cols = process.stdout.columns || 100;
    this.rows = process.stdout.rows || 30;
    this.runtime = null;
    this.runError = null;
    this.message = null;
    this.messageUntil = 0;
    this.dirty = true;
    this.prevGrid = null;
    this.grid = new scr.Grid(this.rows, this.cols);
    this.cursorVisible = true;
    this.mouseSelecting = false;
    this.modal = null; // null | {type, ...}
    // Run-state machine — drives the title-bar dot and the status text.
    //   idle    : ready, no run in flight (initial / after edits)
    //   running : a run is in progress (sync execution may be blocking)
    //   success : last run finished without errors
    //   error   : last run produced one or more errors (echoed as //✗)
    //   timeout : last run hit the cell timeout (likely an infinite loop)
    this.runState = "idle";
    this.runStartTs = 0;
    this.runErrorCountAtStart = 0;
    this.lastChangeTs = 0;
    this.runFinishTs = 0;
    this.spinnerFrame = 0;
    this.editorRowMap = new Map(); // screen row -> {pos, line}
    this.statusFlash = null;
    // Captured stderr/console output (notebook code, the runtime, or async
    // rejections — all things that would otherwise scribble over the screen).
    this.console = []; // {ts, level, text, count}
    this.consoleSeen = 0; // index up to which the user has dismissed
    this.consoleSavedHandlers = null;
    // Cell timeout for vm.Script — long-running synchronous loops are
    // aborted after this many ms instead of freezing the TUI forever.
    this.cellTimeoutMs = 1000;
  }

  start() {
    process.stdout.write(scr.enterAlt + scr.hideCursor + scr.enableMouse + scr.clearScreen + scr.home);
    process.stdin.setRawMode?.(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    // Redirect stray writes BEFORE booting the runtime — Observable's
    // variable rejections hit `console.error` synchronously and would
    // otherwise corrupt the alt-screen.
    this.captureConsole();
    this.installProcessHandlers();

    this.initRuntime();

    process.stdin.on("data", (chunk) => this.onInput(chunk));
    process.stdout.on("resize", () => this.onResize());

    this.flash("Press ^S to run · ^E for examples · ^Q to quit", 4000);
    this.loop();
  }

  installProcessHandlers() {
    const onSig = () => this.quit();
    process.on("SIGINT", onSig);
    process.on("SIGTERM", onSig);
    // Don't tear the UI down on async failures from notebook code — capture
    // them into the message log and keep going. Truly fatal TUI bugs surface
    // as synchronous throws inside our render path, which we let crash.
    process.on("uncaughtException", (e) => this.onAsyncError(e, "uncaughtException"));
    process.on("unhandledRejection", (e) => this.onAsyncError(e, "unhandledRejection"));
  }

  captureConsole() {
    if (this.consoleSavedHandlers) return;
    this.consoleSavedHandlers = {
      error: console.error,
      warn: console.warn,
      log: console.log,
      info: console.info,
      stderrWrite: process.stderr.write.bind(process.stderr),
    };
    const push = (level, args) => {
      const text = args
        .map((a) => {
          if (a instanceof Error) return a.message + (a.stack ? "\n" + a.stack : "");
          if (typeof a === "string") return a;
          try {
            return JSON.stringify(a);
          } catch {
            return String(a);
          }
        })
        .join(" ");
      this.pushConsole(level, text);
    };
    console.error = (...args) => push("error", args);
    console.warn = (...args) => push("warn", args);
    console.log = (...args) => push("log", args);
    console.info = (...args) => push("log", args);
    // Some libraries write directly to stderr; swallow those too while the
    // alt-screen is up so they don't tear the layout.
    process.stderr.write = (chunk) => {
      const text = typeof chunk === "string" ? chunk : Buffer.isBuffer(chunk) ? chunk.toString("utf8") : String(chunk);
      if (text.trim()) this.pushConsole("error", text.replace(/\n+$/, ""));
      return true;
    };
  }

  restoreConsole() {
    if (!this.consoleSavedHandlers) return;
    console.error = this.consoleSavedHandlers.error;
    console.warn = this.consoleSavedHandlers.warn;
    console.log = this.consoleSavedHandlers.log;
    console.info = this.consoleSavedHandlers.info;
    process.stderr.write = this.consoleSavedHandlers.stderrWrite;
    this.consoleSavedHandlers = null;
  }

  pushConsole(level, text) {
    // De-duplicate consecutive identical messages — the runtime can fire the
    // same rejection many times while a generator re-runs. We bump a count on
    // the previous entry instead of flooding the log.
    const last = this.console[this.console.length - 1];
    if (last && last.level === level && last.text === text) {
      last.count = (last.count || 1) + 1;
      last.ts = Date.now();
    } else {
      this.console.push({ts: Date.now(), level, text, count: 1});
      if (this.console.length > 500) this.console.splice(0, this.console.length - 500);
    }
    if (level === "error") {
      const summary = text.split("\n")[0].slice(0, 200);
      this.flash("✗ " + summary, 4000);
    }
    this.dirty = true;
  }

  unseenErrorCount() {
    let n = 0;
    for (let i = this.consoleSeen; i < this.console.length; i++) {
      if (this.console[i].level === "error") n++;
    }
    return n;
  }

  onAsyncError(error, source) {
    const msg = error?.stack || error?.message || String(error);
    this.pushConsole("error", `[${source}] ${msg}`);
  }

  loop() {
    const tick = () => {
      const now = Date.now();
      if (this.message && now > this.messageUntil) {
        this.message = null;
        this.dirty = true;
      }
      // While running, keep advancing the spinner so the user sees motion.
      if (this.runState === "running") {
        this.spinnerFrame = (this.spinnerFrame + 1) % 10;
        this.dirty = true;
      }
      // Settle "running" → "success" / "error" / "timeout" once the runtime
      // has been quiet for a moment. The Observable runtime doesn't emit a
      // "done" event, so we wait for a short window with no new changes
      // and no new errors.
      if (this.runState === "running") {
        const SETTLE_MS = 500;
        const sinceStart = now - this.runStartTs;
        const sinceChange = now - (this.lastChangeTs || this.runStartTs);
        const lastErr = this.lastErrorAfter(this.runErrorCountAtStart);
        const sinceError = lastErr ? now - lastErr.ts : Infinity;
        if (sinceStart > SETTLE_MS && sinceChange > SETTLE_MS && sinceError > SETTLE_MS) {
          const seenErrors = this.console.length - this.runErrorCountAtStart > 0;
          this.runState = seenErrors
            ? this.lastErrorIsTimeout()
              ? "timeout"
              : "error"
            : "success";
          this.runFinishTs = now;
          this.dirty = true;
        }
      }
      if (this.dirty) this.render();
    };
    this.tickInterval = setInterval(tick, 80);
  }

  lastErrorAfter(fromIndex) {
    for (let i = this.console.length - 1; i >= fromIndex; i--) {
      const m = this.console[i];
      if (m.level === "error") return m;
    }
    return null;
  }

  lastErrorIsTimeout() {
    const m = this.lastErrorAfter(this.runErrorCountAtStart);
    if (!m) return false;
    return /TimeoutError|exceeded \d+ms|infinite loop|ERR_RECHO_CELL_TIMEOUT|Script execution timed out/i.test(
      m.text,
    );
  }

  flash(msg, ms = 2500) {
    this.message = msg;
    this.messageUntil = Date.now() + ms;
    this.dirty = true;
  }

  onFatal(e) {
    this.cleanup();
    console.error("Fatal:", e);
    process.exit(1);
  }

  quit() {
    this.cleanup();
    process.exit(0);
  }

  cleanup() {
    try {
      if (this.tickInterval) clearInterval(this.tickInterval);
      this.runtime?.destroy?.();
      process.stdin.setRawMode?.(false);
      process.stdout.write(scr.disableMouse + scr.showCursor + scr.leaveAlt + reset);
      this.restoreConsole();
      // Replay anything that was captured while the alt-screen was up so the
      // user isn't left wondering what happened (only show errors to avoid
      // flooding the regular terminal with debug noise).
      const errors = this.console.filter((m) => m.level === "error");
      if (errors.length) {
        for (const e of errors.slice(-10)) {
          process.stderr.write(`recho: ${e.text.split("\n")[0]}\n`);
        }
      }
    } catch {
      /* ignore */
    }
  }

  // -------------------------------------------------------------------------
  // Runtime
  initRuntime() {
    this.runtime?.destroy?.();
    this.runtime = createRuntime(this.buffer.text, {cellTimeoutMs: this.cellTimeoutMs});
    this.runtime.onChanges(({changes}) => {
      if (!changes || !changes.length) return;
      this.buffer.applyChanges(changes);
      // Keep the runtime's internal view of `code` in sync with the buffer
      // — the web editor does the same in its EditorView change handler.
      this.runtime.setCode(this.buffer.text);
      this.lastChangeTs = Date.now();
      this.dirty = true;
    });
    this.runtime.onError(({error, source}) => {
      // Parse / split errors are reported here. They end up as `//✗` lines
      // in the buffer too, but we want a status-bar nudge as well.
      this.runState = "error";
      this.pushConsole("error", `[${source || "runtime"}] ${error?.message || String(error)}`);
      this.dirty = true;
    });
    this.markRunStart();
    this.runtime.setIsRunning(true);
    try {
      this.runtime.run();
    } catch (e) {
      this.runState = "error";
      this.pushConsole("error", "[run] " + (e?.message || String(e)));
    }
  }

  markRunStart() {
    this.runState = "running";
    this.runStartTs = Date.now();
    this.runErrorCountAtStart = this.console.length;
    this.spinnerFrame = 0;
    this.dirty = true;
  }

  runNow(force = false) {
    if (!this.runtime) return this.initRuntime();
    this.markRunStart();
    this.runtime.setIsRunning(true);
    try {
      this.runtime.setCode(this.buffer.text);
      this.runtime.run();
      this.flash("Running…", 800);
    } catch (e) {
      this.runState = "error";
      this.pushConsole("error", "[run] " + (e?.message || String(e)));
    }
    this.dirty = true;
  }

  stopNow() {
    this.runtime?.setIsRunning(false);
    this.runState = "idle";
    this.flash("Stopped", 1500);
    this.dirty = true;
  }

  // -------------------------------------------------------------------------
  // Layout
  editorBox() {
    const top = HEADER_ROWS;
    const bottom = this.rows - FOOTER_ROWS;
    const left = 0;
    const right = this.cols;
    return {top, bottom, left, right, width: right - left, height: bottom - top};
  }

  visibleEditorRows() {
    const box = this.editorBox();
    return box.height;
  }

  // -------------------------------------------------------------------------
  // Input
  onInput(chunk) {
    if (this.modal) return this.onModalInput(chunk);
    const events = scr.parseInput(chunk);
    for (const ev of events) this.handleEvent(ev);
  }

  handleEvent(ev) {
    if (ev.type === "text") {
      this.userEdit(() => this.buffer.insertAtCursor(ev.text));
      return;
    }
    if (ev.type === "key") return this.handleKey(ev);
    if (ev.type === "mouse") return this.handleMouse(ev);
  }

  userEdit(fn) {
    this.runtime?.setIsRunning(false);
    this.runState = "idle";
    fn();
    this.runtime?.setCode(this.buffer.text);
    this.ensureCursorVisible();
    this.dirty = true;
  }

  handleKey(ev) {
    const {name, ctrl, alt, shift} = ev;
    // Quit / save / run shortcuts.
    if (ctrl && (name === "q" || name === "c")) return this.quit();
    if (ctrl && name === "s") return this.runNow(true);
    if (ctrl && name === "x") return this.stopNow();
    if (ctrl && name === "r") {
      this.initRuntime();
      this.flash("Runtime restarted", 1500);
      return;
    }
    if (ctrl && name === "e") return this.openExamples();
    if (ctrl && name === "o") return this.openFilePrompt();
    if (ctrl && name === "w") return this.savePrompt();
    if (ctrl && name === "l") return this.openConsole();
    if (ctrl && name === "k") return this.openHelp();
    if (ctrl && name === "a") {
      this.buffer.moveTo(0);
      this.buffer.moveTo(this.buffer.length, true);
      this.dirty = true;
      return;
    }
    if (ctrl && name === "home") {
      this.buffer.moveTo(0, shift);
      this.ensureCursorVisible();
      this.dirty = true;
      return;
    }
    if (ctrl && name === "end") {
      this.buffer.moveTo(this.buffer.length, shift);
      this.ensureCursorVisible();
      this.dirty = true;
      return;
    }

    switch (name) {
      case "left":
        if (alt) this.buffer.wordLeft(shift);
        else this.buffer.moveLeft(shift);
        break;
      case "right":
        if (alt) this.buffer.wordRight(shift);
        else this.buffer.moveRight(shift);
        break;
      case "up":
        this.buffer.moveUp(shift);
        break;
      case "down":
        this.buffer.moveDown(shift);
        break;
      case "home":
        this.buffer.moveHome(shift);
        break;
      case "end":
        this.buffer.moveEnd(shift);
        break;
      case "pageup":
        for (let i = 0; i < this.visibleEditorRows() - 2; i++) this.buffer.moveUp(shift);
        break;
      case "pagedown":
        for (let i = 0; i < this.visibleEditorRows() - 2; i++) this.buffer.moveDown(shift);
        break;
      case "backspace":
        this.userEdit(() => this.buffer.backspace());
        return;
      case "delete":
        this.userEdit(() => this.buffer.del());
        return;
      case "enter": {
        // Auto-indent: copy leading whitespace of current line.
        const {row} = this.buffer.posToRowCol(this.buffer.cursor);
        const line = this.buffer.lineText(row);
        const indent = line.match(/^[\t ]*/)[0];
        const trimmed = line.slice(0, this.buffer.cursor - this.buffer.lineStarts[row]).trimEnd();
        const extra = /[{[(]\s*$/.test(trimmed) ? "  " : "";
        this.userEdit(() => this.buffer.insertAtCursor("\n" + indent + extra));
        return;
      }
      case "tab":
        this.userEdit(() => this.buffer.insertAtCursor("  "));
        return;
      case "escape":
        this.buffer.anchor = null;
        break;
      case "space":
        this.userEdit(() => this.buffer.insertAtCursor(" "));
        return;
    }
    this.ensureCursorVisible();
    this.dirty = true;
  }

  handleMouse(ev) {
    const box = this.editorBox();
    const {row, col, kind, button, shift} = ev;
    if (kind === "wheel-up") {
      this.scrollBy(-3);
      return;
    }
    if (kind === "wheel-down") {
      this.scrollBy(3);
      return;
    }
    if (row >= box.top && row < box.bottom && col >= box.left && col < box.right) {
      const mapped = this.editorRowMap.get(row);
      if (!mapped) return;
      const sourceRow = mapped.line;
      const lineStart = this.buffer.lineStarts[sourceRow] ?? 0;
      const lineEnd = this.buffer.lineRange(sourceRow).end;
      const targetCol = Math.max(0, col - GUTTER + this.scrollX);
      const targetPos = Math.min(lineStart + targetCol, lineEnd);
      if (kind === "press" && button === 0) {
        this.buffer.moveTo(targetPos, shift);
        this.mouseSelecting = true;
      } else if (kind === "drag" && this.mouseSelecting) {
        this.buffer.moveTo(targetPos, true);
      } else if (kind === "release") {
        this.mouseSelecting = false;
      }
      this.cursorBlinkOn = true;
      this.lastBlinkTs = Date.now();
      this.dirty = true;
      return;
    }
    // Click on title bar's "Run" hot zone
    if (row === 0 && kind === "press" && button === 0) {
      const hotStart = this.cols - 12;
      if (col >= hotStart) this.runNow(true);
    }
  }

  scrollBy(dy) {
    const max = Math.max(0, this.buffer.lineCount - this.visibleEditorRows());
    this.scrollY = Math.max(0, Math.min(max, this.scrollY + dy));
    this.dirty = true;
  }

  ensureCursorVisible() {
    const {row} = this.buffer.posToRowCol(this.buffer.cursor);
    const h = this.visibleEditorRows();
    if (row < this.scrollY) this.scrollY = row;
    else if (row >= this.scrollY + h) this.scrollY = row - h + 1;
    // Horizontal scroll
    const {col} = this.buffer.posToRowCol(this.buffer.cursor);
    const w = this.editorBox().width - GUTTER;
    if (col < this.scrollX) this.scrollX = col;
    else if (col >= this.scrollX + w) this.scrollX = col - w + 1;
  }

  onResize() {
    this.cols = process.stdout.columns || this.cols;
    this.rows = process.stdout.rows || this.rows;
    this.grid = new scr.Grid(this.rows, this.cols);
    this.prevGrid = null;
    process.stdout.write(scr.clearScreen);
    this.dirty = true;
  }

  // -------------------------------------------------------------------------
  // Render
  render() {
    this.dirty = false;
    this.grid.clear();
    this.editorRowMap.clear();
    this.drawHeader();
    this.drawEditor();
    this.drawFooter();
    if (this.modal) this.drawModal();
    scr.renderDiff(this.prevGrid, this.grid, (s) => process.stdout.write(s));
    this.prevGrid = cloneGrid(this.grid);

    // Real terminal cursor positioned at the editing caret (only when no modal).
    if (!this.modal) {
      const {row, col} = this.buffer.posToRowCol(this.buffer.cursor);
      const screenRow = HEADER_ROWS + (row - this.scrollY);
      const screenCol = GUTTER + (col - this.scrollX);
      const box = this.editorBox();
      if (
        screenRow >= box.top &&
        screenRow < box.bottom &&
        screenCol >= GUTTER &&
        screenCol < this.cols
      ) {
        process.stdout.write(scr.moveTo(screenRow, screenCol) + scr.showCursor);
      } else {
        process.stdout.write(scr.hideCursor);
      }
    } else {
      process.stdout.write(scr.hideCursor);
    }
  }

  drawHeader() {
    const title = " Recho · " + (this.path ? path.basename(this.path) : "untitled.recho.js");
    const headerStyle = bg(234) + fg(COLORS.title);
    this.grid.fillRect(0, 0, 1, this.cols, " ", headerStyle);
    this.grid.writeStyled(0, 0, headerStyle + bold + title + reset, headerStyle);

    // Status indicator: spinner + colored dot + label.
    const SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    const state = this.runState;
    let dot, label, indicatorColor;
    if (state === "running") {
      indicatorColor = COLORS.hot;
      dot = fg(indicatorColor) + bold + SPINNER[this.spinnerFrame % SPINNER.length] + reset;
      const elapsedMs = Date.now() - this.runStartTs;
      label = `running ${(elapsedMs / 1000).toFixed(1)}s`;
    } else if (state === "success") {
      indicatorColor = COLORS.output;
      dot = fg(indicatorColor) + "●" + reset;
      label = "success";
    } else if (state === "error") {
      indicatorColor = COLORS.error;
      dot = fg(indicatorColor) + bold + "●" + reset;
      const errs = this.console.filter((m) => m.level === "error").length;
      label = errs > 1 ? `error · ${errs} issues` : "error";
    } else if (state === "timeout") {
      indicatorColor = COLORS.error;
      dot = fg(indicatorColor) + bold + "⏱" + reset;
      label = `timed out (${this.cellTimeoutMs}ms)`;
    } else {
      indicatorColor = COLORS.dimText;
      dot = fg(indicatorColor) + "○" + reset;
      label = "idle";
    }

    const labelStyled = fg(indicatorColor) + label + reset;
    const runBtn = ` ${fg(COLORS.fg)}[ Run ^S ]${reset}`;
    const rightInfo = `${dot} ${labelStyled} ${runBtn}`;
    const rightLen = visibleLength(rightInfo);
    this.grid.writeStyled(0, this.cols - rightLen - 1, rightInfo, headerStyle);

    // Divider row
    const divStyle = fg(COLORS.border);
    this.grid.fillRect(1, 0, 2, this.cols, "─", divStyle);
  }

  drawEditor() {
    const box = this.editorBox();
    const {row: cRow} = this.buffer.posToRowCol(this.buffer.cursor);
    const sel = this.buffer.selection();

    for (let i = 0; i < box.height; i++) {
      const screenRow = box.top + i;
      const line = this.scrollY + i;
      if (line >= this.buffer.lineCount) {
        // Empty filler row, render a soft tilde gutter
        this.grid.writeStyled(screenRow, 0, fg(COLORS.ln) + "    ~ " + reset, "");
        continue;
      }
      this.editorRowMap.set(screenRow, {line, pos: this.buffer.lineStarts[line]});
      const isCursorLine = line === cRow;

      // Gutter: line number, right-aligned in (GUTTER-1) chars + 1 space padding.
      const lnText = String(line + 1);
      const lnPad = " ".repeat(Math.max(0, GUTTER - 1 - lnText.length));
      const lnStyle = fg(isCursorLine ? COLORS.lnActive : COLORS.ln);
      const gutter = lnPad + lnStyle + lnText + reset + " ";
      this.grid.writeStyled(screenRow, 0, gutter, "");

      // Source line content (with horizontal scroll).
      const text = this.buffer.lineText(line);
      const visible = text.slice(this.scrollX, this.scrollX + (box.width - GUTTER));
      const styled = highlightLine(visible);

      this.grid.writeStyled(screenRow, GUTTER, styled, "");

      // Cursor-line subtle background overlay — appended to each cell's
      // style so the bg wins even when the highlighted token's style
      // contains an inline `reset`.
      if (isCursorLine) {
        const lnBg = bg(COLORS.cursorLineBg);
        for (let c = GUTTER; c < this.cols; c++) {
          const cell = this.grid.cells[screenRow * this.cols + c];
          if (cell) cell.style = cell.style + lnBg;
        }
      }

      // Selection overlay — paint inverse over selected cells.
      if (sel) {
        const lineStart = this.buffer.lineStarts[line];
        const lineEnd = this.buffer.lineRange(line).end;
        const selFrom = Math.max(sel.from, lineStart);
        const selTo = Math.min(sel.to, lineEnd);
        if (selFrom < selTo) {
          const a = selFrom - lineStart - this.scrollX;
          const b = selTo - lineStart - this.scrollX;
          const x0 = GUTTER + Math.max(0, a);
          const x1 = GUTTER + Math.max(0, b);
          if (x1 > x0) {
            const overlayStyle = bg(COLORS.selBg) + fg(255);
            // Keep the existing characters, just override style.
            const cols = Math.min(this.cols, x1) - x0;
            for (let c = 0; c < cols; c++) {
              const cell = this.grid.cells[screenRow * this.cols + x0 + c];
              if (cell) cell.style = overlayStyle;
            }
          }
        }
      }
    }
  }

  drawFooter() {
    const divStyle = fg(COLORS.border);
    this.grid.fillRect(this.rows - FOOTER_ROWS, 0, this.rows - FOOTER_ROWS + 1, this.cols, "─", divStyle);
    const status = this.buildStatusLine();
    const statusStyle = bg(234) + fg(COLORS.status);
    this.grid.fillRect(this.rows - 1, 0, this.rows, this.cols, " ", statusStyle);
    this.grid.writeStyled(this.rows - 1, 0, statusStyle + status + reset, statusStyle);
  }

  buildStatusLine() {
    const {row, col} = this.buffer.posToRowCol(this.buffer.cursor);
    const pos = ` Ln ${row + 1}, Col ${col + 1} `;
    const left = bold + pos + reset;

    // Hints, in priority order (most useful first). Drop tail items until
    // the whole line fits the terminal width.
    const unread = this.unseenErrorCount();
    const journalLabel = unread > 0 ? `Console (${unread})` : `Console`;
    const allHints = [
      [`^S`, `Run`],
      [`^E`, `Examples`],
      [`^L`, journalLabel],
      [`^O`, `Open`],
      [`^W`, `Save`],
      [`^X`, `Stop`],
      [`^R`, `Reset`],
      [`^K`, `Help`],
      [`^Q`, `Quit`],
    ];
    const renderHints = (items) =>
      items
        .map(([k, l]) => {
          const labelColor = l.startsWith("Console") && unread > 0 ? fg(COLORS.error) : "";
          return `${fg(COLORS.hot)}${k}${reset} ${labelColor}${l}${reset}`;
        })
        .join(" · ");

    let right;
    if (this.message) {
      right = " " + fg(COLORS.marker) + this.message + reset + "  ";
    } else {
      let items = allHints.slice();
      let candidate = " " + renderHints(items) + " ";
      const leftLen = visibleLength(left);
      while (items.length > 2 && leftLen + visibleLength(candidate) > this.cols) {
        items.pop();
        candidate = " " + renderHints(items) + " ";
      }
      right = candidate;
    }
    const leftLen = visibleLength(left);
    const rightLen = visibleLength(right);
    const filler = Math.max(1, this.cols - leftLen - rightLen);
    return left + " ".repeat(filler) + right;
  }

  // -------------------------------------------------------------------------
  // Modals
  drawModal() {
    if (this.modal.type === "examples") return this.drawExamplesModal();
    if (this.modal.type === "input") return this.drawInputModal();
    if (this.modal.type === "help") return this.drawHelpModal();
    if (this.modal.type === "console") return this.drawConsoleModal();
    if (this.modal.type === "confirm") return this.drawConfirmModal();
  }

  onModalInput(chunk) {
    const events = scr.parseInput(chunk);
    for (const ev of events) {
      if (this.modal.type === "examples") this.handleExamplesKey(ev);
      else if (this.modal.type === "input") this.handleInputKey(ev);
      else if (this.modal.type === "help") this.handleHelpKey(ev);
      else if (this.modal.type === "console") this.handleConsoleKey(ev);
      else if (this.modal.type === "confirm") this.handleConfirmKey(ev);
    }
  }

  // ---- examples picker
  openExamples() {
    if (!this.examplesDir) {
      this.flash("No examples directory available", 2000);
      return;
    }
    let entries = [];
    try {
      entries = fs
        .readdirSync(this.examplesDir)
        .filter((f) => f.endsWith(".recho.js"))
        .sort();
    } catch (e) {
      this.flash("Cannot read examples: " + e.message, 3000);
      return;
    }
    this.modal = {type: "examples", entries, index: 0, query: "", scroll: 0};
    this.dirty = true;
  }

  filteredExamples() {
    const {entries, query} = this.modal;
    if (!query) return entries;
    const q = query.toLowerCase();
    return entries.filter((e) => e.toLowerCase().includes(q));
  }

  handleExamplesKey(ev) {
    if (ev.type === "key") {
      const {name, ctrl} = ev;
      if (name === "escape" || (ctrl && name === "g")) {
        this.modal = null;
        this.dirty = true;
        return;
      }
      if (name === "enter") return this.confirmExample();
      if (name === "down") {
        this.modal.index = Math.min(this.filteredExamples().length - 1, this.modal.index + 1);
        this.dirty = true;
        return;
      }
      if (name === "up") {
        this.modal.index = Math.max(0, this.modal.index - 1);
        this.dirty = true;
        return;
      }
      if (name === "backspace") {
        this.modal.query = this.modal.query.slice(0, -1);
        this.modal.index = 0;
        this.dirty = true;
        return;
      }
      if (name === "pagedown") {
        this.modal.index = Math.min(this.filteredExamples().length - 1, this.modal.index + 10);
        this.dirty = true;
        return;
      }
      if (name === "pageup") {
        this.modal.index = Math.max(0, this.modal.index - 10);
        this.dirty = true;
        return;
      }
    } else if (ev.type === "text") {
      this.modal.query += ev.text;
      this.modal.index = 0;
      this.dirty = true;
    } else if (ev.type === "mouse") {
      if (ev.kind === "wheel-up") {
        this.modal.index = Math.max(0, this.modal.index - 3);
        this.dirty = true;
      } else if (ev.kind === "wheel-down") {
        this.modal.index = Math.min(this.filteredExamples().length - 1, this.modal.index + 3);
        this.dirty = true;
      } else if (ev.kind === "press" && ev.button === 0) {
        // Click in list to select; click outside to dismiss.
        const box = this.modalBox();
        const listTop = box.top + 4;
        const listLeft = box.left + 1;
        const listRight = box.left + box.width - 1;
        const i = ev.row - listTop + (this.modal.scroll || 0);
        if (
          ev.row >= listTop &&
          ev.row < box.top + box.height - 1 &&
          ev.col >= listLeft &&
          ev.col < listRight &&
          i >= 0 &&
          i < this.filteredExamples().length
        ) {
          this.modal.index = i;
          this.confirmExample();
        }
      }
    }
  }

  confirmExample() {
    const list = this.filteredExamples();
    const name = list[this.modal.index];
    if (!name) return;
    const file = path.join(this.examplesDir, name);
    try {
      const code = fs.readFileSync(file, "utf8");
      this.path = file;
      this.buffer = new Buffer(code);
      this.scrollY = 0;
      this.scrollX = 0;
      this.modal = null;
      this.initRuntime();
      this.flash("Loaded " + name, 2000);
    } catch (e) {
      this.flash("Failed to load: " + e.message, 3000);
    }
    this.dirty = true;
  }

  modalBox() {
    const w = Math.min(80, this.cols - 8);
    const h = Math.min(this.rows - 6, 22);
    const left = Math.max(2, Math.floor((this.cols - w) / 2));
    const top = Math.max(2, Math.floor((this.rows - h) / 2));
    return {top, left, width: w, height: h};
  }

  drawExamplesModal() {
    const box = this.modalBox();
    drawBox(this.grid, box, " Examples · " + this.filteredExamples().length + " ", COLORS);
    const queryLine = box.top + 2;
    this.grid.writeStyled(
      queryLine,
      box.left + 2,
      fg(COLORS.dimText) + "filter: " + reset + this.modal.query + fg(COLORS.dimText) + "▏" + reset,
      "",
    );
    const items = this.filteredExamples();
    const listTop = box.top + 4;
    const listH = box.height - 5;
    // Keep selected in view.
    let scroll = this.modal.scroll || 0;
    if (this.modal.index < scroll) scroll = this.modal.index;
    if (this.modal.index >= scroll + listH) scroll = this.modal.index - listH + 1;
    this.modal.scroll = scroll;
    for (let i = 0; i < listH; i++) {
      const idx = scroll + i;
      if (idx >= items.length) break;
      const name = items[idx];
      const display = formatExampleName(name);
      const selected = idx === this.modal.index;
      const style = selected ? bg(COLORS.selBg) + fg(255) + bold : fg(COLORS.fg);
      const arrow = selected ? fg(COLORS.hot) + "▸ " + reset : "  ";
      const line = arrow + style + " " + padToWidth(display, box.width - 6) + " " + reset;
      // Fill row bg first
      if (selected) this.grid.fillRect(listTop + i, box.left + 1, listTop + i + 1, box.left + box.width - 1, " ", bg(COLORS.selBg));
      this.grid.writeStyled(listTop + i, box.left + 2, line, "");
    }
    const help = fg(COLORS.dimText) + "↑/↓ select · type to filter · Enter to load · Esc to cancel" + reset;
    this.grid.writeStyled(box.top + box.height - 1, box.left + 2, help, "");
  }

  // ---- input prompt
  inputPrompt(title, initial, onSubmit) {
    this.modal = {type: "input", title, value: initial, onSubmit};
    this.dirty = true;
  }

  handleInputKey(ev) {
    if (ev.type === "key") {
      if (ev.name === "escape") {
        this.modal = null;
        this.dirty = true;
        return;
      }
      if (ev.name === "enter") {
        const v = this.modal.value;
        const cb = this.modal.onSubmit;
        this.modal = null;
        this.dirty = true;
        cb(v);
        return;
      }
      if (ev.name === "backspace") {
        this.modal.value = this.modal.value.slice(0, -1);
        this.dirty = true;
        return;
      }
    } else if (ev.type === "text") {
      this.modal.value += ev.text;
      this.dirty = true;
    }
  }

  drawInputModal() {
    const w = Math.min(70, this.cols - 8);
    const h = 7;
    const left = Math.max(2, Math.floor((this.cols - w) / 2));
    const top = Math.max(2, Math.floor((this.rows - h) / 2));
    const box = {top, left, width: w, height: h};
    drawBox(this.grid, box, " " + this.modal.title + " ", COLORS);
    this.grid.writeStyled(top + 2, left + 2, fg(COLORS.dimText) + "value: " + reset, "");
    this.grid.writeStyled(top + 3, left + 2, this.modal.value + fg(COLORS.hot) + "▏" + reset, "");
    this.grid.writeStyled(
      top + h - 1,
      left + 2,
      fg(COLORS.dimText) + "Enter to confirm · Esc to cancel" + reset,
      "",
    );
  }

  openFilePrompt() {
    this.inputPrompt("Open file", this.path || "", (p) => {
      if (!p) return;
      try {
        const code = fs.readFileSync(p, "utf8");
        this.path = path.resolve(p);
        this.buffer = new Buffer(code);
        this.scrollY = 0;
        this.scrollX = 0;
        this.initRuntime();
        this.flash("Opened " + p, 2000);
      } catch (e) {
        this.flash("Open failed: " + e.message, 3000);
      }
      this.dirty = true;
    });
  }

  savePrompt() {
    this.inputPrompt("Save to", this.path || "untitled.recho.js", (p) => {
      if (!p) return;
      try {
        fs.writeFileSync(p, this.buffer.text, "utf8");
        this.path = path.resolve(p);
        this.flash("Saved " + p, 2000);
      } catch (e) {
        this.flash("Save failed: " + e.message, 3000);
      }
      this.dirty = true;
    });
  }

  // ---- help
  openHelp() {
    this.modal = {type: "help"};
    this.dirty = true;
  }
  handleHelpKey(ev) {
    if (ev.type === "key" && (ev.name === "escape" || (ev.ctrl && ev.name === "k"))) {
      this.modal = null;
      this.dirty = true;
    } else if (ev.type === "mouse" && ev.kind === "press") {
      this.modal = null;
      this.dirty = true;
    }
  }
  drawHelpModal() {
    const w = Math.min(72, this.cols - 8);
    const h = Math.min(this.rows - 4, 22);
    const left = Math.max(2, Math.floor((this.cols - w) / 2));
    const top = Math.max(2, Math.floor((this.rows - h) / 2));
    const box = {top, left, width: w, height: h};
    drawBox(this.grid, box, " Recho · Quick help ", COLORS);
    const lines = [
      "",
      `  ${fg(COLORS.fn)}A reactive notebook in your terminal.${reset}`,
      "",
      `  Write JavaScript and call ${fg(COLORS.keyword)}echo${reset}(value).`,
      `  Outputs render as ${fg(COLORS.output)}//➜ comments${reset} above each cell.`,
      "",
      `  ${bold}Editing${reset}`,
      `    arrows / home / end / pageup / pagedown   move`,
      `    shift + movement                          select`,
      `    alt  + ←/→                                word jumps`,
      `    mouse click / drag / wheel                navigate`,
      "",
      `  ${bold}Notebook${reset}`,
      `    ^S  Run         ^X  Stop        ^R  Restart runtime`,
      `    ^E  Examples    ^O  Open file   ^W  Save`,
      `    ^L  Console     ^K  This help   ^Q  Quit`,
      "",
      `  ${fg(COLORS.dimText)}Click anywhere to dismiss.${reset}`,
    ];
    for (let i = 0; i < lines.length && i < h - 2; i++) {
      this.grid.writeStyled(top + 1 + i, left + 2, lines[i], "");
    }
  }

  // ---- console / messages log
  openConsole() {
    this.consoleSeen = this.console.length;
    this.modal = {type: "console", scroll: Math.max(0, this.console.length - 1)};
    this.dirty = true;
  }

  handleConsoleKey(ev) {
    if (ev.type === "key") {
      const {name, ctrl} = ev;
      if (name === "escape" || (ctrl && name === "l") || (ctrl && name === "g")) {
        this.modal = null;
        this.dirty = true;
        return;
      }
      if (name === "up") {
        this.modal.scroll = Math.max(0, this.modal.scroll - 1);
        this.dirty = true;
        return;
      }
      if (name === "down") {
        this.modal.scroll = Math.min(this.console.length - 1, this.modal.scroll + 1);
        this.dirty = true;
        return;
      }
      if (name === "pageup") {
        this.modal.scroll = Math.max(0, this.modal.scroll - 10);
        this.dirty = true;
        return;
      }
      if (name === "pagedown") {
        this.modal.scroll = Math.min(this.console.length - 1, this.modal.scroll + 10);
        this.dirty = true;
        return;
      }
      if (name === "home") {
        this.modal.scroll = 0;
        this.dirty = true;
        return;
      }
      if (name === "end") {
        this.modal.scroll = Math.max(0, this.console.length - 1);
        this.dirty = true;
        return;
      }
      if (name === "delete" || name === "backspace") {
        this.console = [];
        this.consoleSeen = 0;
        this.modal.scroll = 0;
        this.flash("Console cleared", 1200);
        this.dirty = true;
        return;
      }
    } else if (ev.type === "mouse") {
      if (ev.kind === "wheel-up") {
        this.modal.scroll = Math.max(0, this.modal.scroll - 3);
        this.dirty = true;
      } else if (ev.kind === "wheel-down") {
        this.modal.scroll = Math.min(this.console.length - 1, this.modal.scroll + 3);
        this.dirty = true;
      }
    }
  }

  drawConsoleModal() {
    const w = Math.min(96, this.cols - 6);
    const h = Math.min(this.rows - 4, 24);
    const left = Math.max(2, Math.floor((this.cols - w) / 2));
    const top = Math.max(2, Math.floor((this.rows - h) / 2));
    const box = {top, left, width: w, height: h};
    const errors = this.console.filter((m) => m.level === "error").length;
    const warns = this.console.filter((m) => m.level === "warn").length;
    const title = ` Console · ${this.console.length} entries · ${errors} errors · ${warns} warnings `;
    drawBox(this.grid, box, title, COLORS);
    if (this.console.length === 0) {
      this.grid.writeStyled(
        top + Math.floor(h / 2),
        left + 2,
        fg(COLORS.dimText) + "(empty — no notebook errors yet)" + reset,
        "",
      );
      this.grid.writeStyled(
        top + h - 1,
        left + 2,
        fg(COLORS.dimText) + "Esc / ^J to close" + reset,
        "",
      );
      return;
    }
    // Render messages as wrapped blocks: each entry's first line on its
    // anchor row, continuation lines indented two columns.
    const innerW = w - 4;
    const lines = [];
    for (let i = 0; i < this.console.length; i++) {
      const m = this.console[i];
      const tag =
        m.level === "error"
          ? fg(COLORS.error) + bold + "✗" + reset
          : m.level === "warn"
            ? fg(COLORS.hot) + "!" + reset
            : fg(COLORS.marker) + "•" + reset;
      const ts = new Date(m.ts).toTimeString().slice(0, 8);
      const counter = m.count > 1 ? ` ${fg(COLORS.hot)}×${m.count}${reset}` : "";
      const head = `${tag} ${fg(COLORS.dimText)}${ts}${reset}${counter}  `;
      const headLen = visibleLength(head);
      // Plain-text wrap (don't try to keep ANSI inside the message body).
      const body = m.text;
      const bodyLines = body.split("\n");
      let first = true;
      for (const bl of bodyLines) {
        // word-wrap each source line
        let buf = bl;
        while (buf.length > 0) {
          const slice = buf.slice(0, innerW - (first ? headLen : 2));
          buf = buf.slice(slice.length);
          const prefix = first ? head : "  ";
          const styled = first ? slice : fg(COLORS.dimText) + slice + reset;
          lines.push({entryIndex: i, level: m.level, text: prefix + styled});
          first = false;
        }
        if (bodyLines.length > 1 && bl !== bodyLines[bodyLines.length - 1]) {
          // also indented continuation
        }
      }
    }
    // Ensure scroll keeps the requested entry visible at the bottom.
    const listH = h - 3;
    let firstLine = 0;
    // Find the line index for `this.modal.scroll` entry.
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].entryIndex >= this.modal.scroll) {
        firstLine = Math.max(0, i - listH + 1);
        break;
      }
    }
    if (firstLine + listH > lines.length) firstLine = Math.max(0, lines.length - listH);
    for (let row = 0; row < listH; row++) {
      const li = firstLine + row;
      if (li >= lines.length) break;
      this.grid.writeStyled(top + 1 + row, left + 2, lines[li].text, "");
    }
    const help =
      fg(COLORS.dimText) +
      "↑/↓ scroll · Home/End jump · ⌫ clear · Esc / ^L close" +
      reset;
    this.grid.writeStyled(top + h - 1, left + 2, help, "");
  }

  // ---- confirm
  drawConfirmModal() {}
  handleConfirmKey() {}
}

function cloneGrid(g) {
  const c = new scr.Grid(g.rows, g.cols);
  for (let i = 0; i < g.cells.length; i++) {
    c.cells[i].ch = g.cells[i].ch;
    c.cells[i].style = g.cells[i].style;
  }
  return c;
}

function drawBox(grid, box, title, COLORS) {
  const {top, left, width, height} = box;
  const right = left + width - 1;
  const bottom = top + height - 1;
  const border = fg(COLORS.borderHi);
  const inside = bg(233);
  // Fill background
  grid.fillRect(top, left, top + height, left + width, " ", inside);
  // Borders
  for (let c = left + 1; c < right; c++) {
    grid.setCell(top, c, "─", border + inside);
    grid.setCell(bottom, c, "─", border + inside);
  }
  for (let r = top + 1; r < bottom; r++) {
    grid.setCell(r, left, "│", border + inside);
    grid.setCell(r, right, "│", border + inside);
  }
  grid.setCell(top, left, "╭", border + inside);
  grid.setCell(top, right, "╮", border + inside);
  grid.setCell(bottom, left, "╰", border + inside);
  grid.setCell(bottom, right, "╯", border + inside);
  // Title
  if (title) {
    const t = " " + title + " ";
    const tcol = left + 2;
    grid.writeStyled(top, tcol, bg(233) + fg(COLORS.title) + bold + t + reset, "");
  }
}

function formatExampleName(name) {
  return name.replace(/\.recho\.js$/, "").replace(/-/g, " ");
}
