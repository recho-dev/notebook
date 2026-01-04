import {Runtime} from "@/lib/runtime/index.ts";
import assert from "assert";
import {it} from "vitest";
import {valueof} from "../utils.ts";

it("module.variable(…, {shadow}) can define a shadow input", async () => {
  const runtime = new Runtime();
  const module = runtime.module();

  module.define("val", [], 1000);
  const a = module.variable(true, {shadow: {val: 100}}).define("a", ["val"], (val: unknown) => val);

  assert.deepStrictEqual(await valueof(a), {value: 100});
});

it("module.variable(…, {shadow}) can define shadow inputs that differ between variables", async () => {
  const runtime = new Runtime();
  const module = runtime.module();

  module.define("val", [], 1000);
  const a = module.variable(true, {shadow: {val: 100}}).define("a", ["val"], (val: unknown) => val);
  const b = module.variable(true, {shadow: {val: 200}}).define("b", ["val"], (val: unknown) => val);
  assert.deepStrictEqual(await valueof(a), {value: 100});
  assert.deepStrictEqual(await valueof(b), {value: 200});
});

it("module.variable(…, {shadow}) variables that are downstream will also use the shadow input", async () => {
  const runtime = new Runtime();
  const module = runtime.module();

  module.define("val", [], 1000);
  const a = module.variable(true, {shadow: {val: 100}}).define("a", ["val"], (val: unknown) => val);
  const b = module.variable(true, {shadow: {val: 200}}).define("b", ["val"], (val: unknown) => val);
  const c = module.variable(true).define("c", ["a", "b"], (a: unknown, b: unknown) => `${a}, ${b}`);

  assert.deepStrictEqual(await valueof(a), {value: 100});
  assert.deepStrictEqual(await valueof(b), {value: 200});
  assert.deepStrictEqual(await valueof(c), {value: "100, 200"});
});

it("module.variable(…, {shadow}) variables a->b->c that shadow the same inputs will each use their own shadows", async () => {
  const runtime = new Runtime();
  const main = runtime.module();

  const a = main.variable(true, {shadow: {val: 100}}).define("a", ["val"], (val: unknown) => val);
  const b = main
    .variable(true, {shadow: {val: 200}})
    .define("b", ["val", "a"], (val: unknown, a: unknown) => `${val}, ${a}`);
  const c = main
    .variable(true, {shadow: {val: 300}})
    .define("c", ["val", "b", "a"], (val: unknown, b: unknown, a: unknown) => `${val}, (${b}), ${a}`);

  assert.deepStrictEqual(await valueof(a), {value: 100});
  assert.deepStrictEqual(await valueof(b), {value: "200, 100"});
  assert.deepStrictEqual(await valueof(c), {value: "300, (200, 100), 100"});
});

it("module.variable(…, {shadow}) can shadow a non-existent variable", async () => {
  const runtime = new Runtime();
  const main = runtime.module();

  const a = main.variable(true, {shadow: {val: 100}}).define("a", ["val"], (val: unknown) => val);

  assert.deepStrictEqual(await valueof(a), {value: 100});
});
