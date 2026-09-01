import {describe, expect, it} from "vitest";
import {parseInput} from "../terminal/screen.ts";

describe("terminal input parsing", () => {
  it("parses complete sequences with an empty rest", () => {
    const {events, rest} = parseInput("\x1b[A\x1b[B");
    expect(rest).toBe("");
    expect(events.map((e) => e.name)).toEqual(["up", "down"]);
  });

  it("holds a chunk that ends right after ESC", () => {
    const {events, rest} = parseInput("hi\x1b");
    expect(events).toEqual([{type: "text", text: "hi"}]);
    expect(rest).toBe("\x1b");
  });

  it("holds a partial CSI sequence", () => {
    const {events, rest} = parseInput("\x1b[1;5");
    expect(events).toEqual([]);
    expect(rest).toBe("\x1b[1;5");
  });

  it("holds a partial SGR mouse sequence", () => {
    const {events, rest} = parseInput("\x1b[<0;12;3");
    expect(events).toEqual([]);
    expect(rest).toBe("\x1b[<0;12;3");
  });

  it("holds a partial SS3 sequence", () => {
    const {events, rest} = parseInput("\x1bO");
    expect(events).toEqual([]);
    expect(rest).toBe("\x1bO");
  });

  it("completes a sequence split across two chunks", () => {
    const first = parseInput("\x1b[<0;12;3");
    const second = parseInput(first.rest + "M");
    expect(second.rest).toBe("");
    expect(second.events).toEqual([
      {type: "mouse", kind: "press", button: 0, row: 2, col: 11, shift: false, meta: false, ctrl: false},
    ]);
  });

  it("flushes a trailing lone ESC as an escape key", () => {
    const {events, rest} = parseInput("\x1b", {flush: true});
    expect(rest).toBe("");
    expect(events).toEqual([{type: "key", name: "escape", ch: "", ctrl: false, alt: false, shift: false}]);
  });

  it("drops a truncated sequence on flush instead of leaking text", () => {
    const {events, rest} = parseInput("\x1b[1;5", {flush: true});
    expect(rest).toBe("");
    expect(events).toEqual([]);
  });
});
