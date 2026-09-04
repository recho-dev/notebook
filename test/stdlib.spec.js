import {afterEach, it, expect, vi} from "vitest";
import * as stdlib from "../runtime/stdlib/index.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

it("should export expected functions from stdlib", () => {
  expect(stdlib.require).toBeDefined();
  expect(stdlib.now).toBeDefined();
  expect(stdlib.interval).toBeDefined();
  expect(stdlib.toggle).toBeDefined();
  expect(stdlib.number).toBeDefined();
  expect(stdlib.radio).toBeDefined();
  expect(stdlib.state).toBeDefined();
});

it("should require npm modules without a document object", async () => {
  vi.stubGlobal("document", undefined);

  const d3 = await stdlib.require("d3-array", "d3-random");
  expect(d3.range(3)).toEqual([0, 1, 2]);
  expect(typeof d3.randomInt).toBe("function");

  const _ = await stdlib.require("lodash");
  expect(_.times(3, String)).toEqual(["0", "1", "2"]);
});
