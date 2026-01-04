import {Runtime} from "@/lib/runtime/index.ts";
import assert from "assert";
import {it} from "vitest";
import {valueof} from "../utils.ts";

it("variable.delete allows a variable to be deleted", async () => {
  const runtime = new Runtime();
  const main = runtime.module();
  const foo = main.variable(true).define("foo", [], () => 1);
  const bar = main
    .variable(true)
    .define("bar", ["foo"], (foo: unknown) => new Promise((resolve) => setImmediate(() => resolve(foo))));
  assert.deepStrictEqual(await valueof(foo), {value: 1});
  assert.deepStrictEqual(await valueof(bar), {value: 1});
  foo.delete();
  assert.deepStrictEqual(await valueof(foo), {value: undefined});
  assert.deepStrictEqual(await valueof(bar), {error: "RuntimeError: foo is not defined"});
});
