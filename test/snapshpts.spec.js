import {it, expect, describe} from "vitest";
import {EditorState} from "@codemirror/state";
import * as tests from "./js/index-tests.js";
import {createRuntime} from "../runtime/index.js";

describe("snapshots", () => {
  for (const [name, code] of Object.entries(tests)) {
    it(name, async () => {
      let state = EditorState.create({doc: code});
      const oldError = console.error;
      // Suppress errors caused by the runtime. We only need to test the snapshots.
      console.error = () => {};
      try {
        const runtime = createRuntime(state.doc.toString());
        runtime.onChanges((specs) => (state = state.update(specs).state));
        runtime.run();
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {}
      console.error = oldError;
      await expect(state.doc.toString()).toMatchFileSnapshot(`./output/${name}.js`);
    });
  }
});
