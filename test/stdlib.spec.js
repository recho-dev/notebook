import {it, expect} from "vitest";
import * as stdlib from "../runtime/stdlib.js";

it("should export expected functions from stdlib", () => {
  expect(stdlib.require).toBeDefined();
  expect(stdlib.now).toBeDefined();
  expect(stdlib.interval).toBeDefined();
  expect(stdlib.toggle).toBeDefined();
  expect(stdlib.number).toBeDefined();
  expect(stdlib.radio).toBeDefined();
});
