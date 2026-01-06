// Originally developed by Observable, Inc.
// Adapted and modified by Recho from @observablehq/runtime v6.0.0
// Copyright 2018-2024 Observable, Inc.
// Copyright 2025-2026 Recho
// ISC License

import {Runtime} from "@/lib/runtime/index.ts";
import assert from "assert";
import {describe, it} from "vitest";
import {sleep} from "../utils.ts";

describe("runtime.dispose", () => {
  it("invalidates all variables", async () => {
    const runtime = new Runtime();
    const main = runtime.module();
    const log: unknown[] = [];
    main.variable(true).define(["invalidation"], async (invalidation: Promise<unknown>) => {
      await invalidation;
      log.push("invalidation");
    });
    await sleep();
    runtime.dispose();
    await sleep();
    assert.deepStrictEqual(log, ["invalidation"]);
  });
  it("terminates generators", async () => {
    const runtime = new Runtime();
    const main = runtime.module();
    const log: unknown[] = [];
    main.variable(true).define([], function* () {
      try {
        while (true) yield;
      } finally {
        log.push("return");
      }
    });
    await sleep();
    runtime.dispose();
    await sleep();
    assert.deepStrictEqual(log, ["return"]);
  });
});
