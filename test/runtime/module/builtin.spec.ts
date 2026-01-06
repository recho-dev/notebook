// Originally developed by Observable, Inc.
// Adapted and modified by Recho from @observablehq/runtime v6.0.0
// Copyright 2018-2024 Observable, Inc.
// Copyright 2025-2026 Recho
// ISC License

import {Runtime} from "@/lib/runtime/index.ts";
import assert from "assert";
import {it} from "vitest";
import {valueof} from "../utils.ts";

it("module.builtin(name, value) defines a module-specific builtin variable", async () => {
  const runtime = new Runtime();
  const module = runtime.module();
  module.builtin("foo", 42);
  const bar = module.variable(true).define("bar", ["foo"], (foo: number) => foo + 1);
  await new Promise(setImmediate);
  assert.deepStrictEqual(await valueof(bar), {value: 43});
});

it("module.builtin(name, value) can be overridden by a normal variable", async () => {
  const runtime = new Runtime();
  const module = runtime.module();
  module.builtin("foo", 0);
  const foo = module.variable(true).define("foo", [], () => 42);
  const bar = module.variable(true).define("bar", ["foo"], (foo: number) => foo + 1);
  await new Promise(setImmediate);
  assert.deepStrictEqual(await valueof(foo), {value: 42});
  assert.deepStrictEqual(await valueof(bar), {value: 43});
});
