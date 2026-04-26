import {describe, expect, it} from "vitest";
import {App} from "../terminal/app.js";

function makeApp(lineCount = 30) {
  const initialCode = Array.from({length: lineCount}, (_, i) => `echo(${i});`).join("\n");
  const app = new App({initialPath: null, initialCode, examplesDir: null});
  app.cols = 20;
  app.rows = 10;
  return app;
}

describe("terminal scrollbar", () => {
  it("reserves the rightmost column from the editor box", () => {
    const app = makeApp();
    expect(app.scrollbarCol()).toBe(19);
    expect(app.editorBox().right).toBe(19);
  });

  it("maps thumb rows to scroll progress", () => {
    const app = makeApp(20);
    const state = app.scrollbarState();

    expect(state.trackTop).toBe(2);
    expect(state.trackHeight).toBe(6);
    expect(state.thumbHeight).toBe(1);
    expect(state.maxScroll).toBe(14);

    app.scrollToScrollbarRow(state.trackBottom - state.thumbHeight);
    expect(app.scrollY).toBe(14);
  });

  it("drags the scrollbar thumb with the mouse", () => {
    const app = makeApp(20);
    const state = app.scrollbarState();

    app.handleMouse({type: "mouse", kind: "press", button: 0, row: state.thumbTop, col: app.scrollbarCol()});
    app.handleMouse({type: "mouse", kind: "drag", button: 0, row: state.trackBottom - 1, col: app.scrollbarCol()});
    app.handleMouse({type: "mouse", kind: "release", button: 0, row: state.trackBottom - 1, col: app.scrollbarCol()});

    expect(app.scrollY).toBe(state.maxScroll);
    expect(app.scrollbarDragging).toBe(false);
  });
});
