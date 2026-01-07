// Originally developed by Observable, Inc.
// Adapted and modified by Recho from @observablehq/runtime v6.0.0
// Copyright 2018-2024 Observable, Inc.
// Copyright 2025-2026 Recho
// ISC License

import {Runtime, type Module, type ModuleDefinition, type Variable} from "@/lib/runtime/index.ts";
import assert from "assert";
import {it} from "vitest";
import {valueof, promiseInspector, sleep} from "../utils.ts";
import type {ObserverInput} from "@/lib/runtime/variable.ts";

it("variable.import(name, module) imports a variable from another module", async () => {
  const runtime = new Runtime();
  const main = runtime.module();
  const module = runtime.module();
  module.define("foo", [], () => 42);
  main.import("foo", module);
  const bar = main.variable(true).define("bar", ["foo"], (foo: unknown) => `bar-${foo}`);
  assert.deepStrictEqual(await valueof(bar), {value: "bar-42"});
});

it("variable.import(name, alias, module) imports a variable from another module under an alias", async () => {
  const runtime = new Runtime();
  const main = runtime.module();
  const module = runtime.module();
  module.define("foo", [], () => 42);
  main.import("foo", "baz", module);
  const bar = main.variable(true).define("bar", ["baz"], (baz: unknown) => `bar-${baz}`);
  assert.deepStrictEqual(await valueof(bar), {value: "bar-42"});
});

it("variable.import(name, module) does not compute the imported variable unless referenced", async () => {
  const runtime = new Runtime();
  const main = runtime.module();
  const module = runtime.module();
  const foo = module.define("foo", [], () => assert.fail());
  main.import("foo", module);
  await Reflect.get(runtime, "_computing");
  assert.strictEqual(foo.reachable, false);
});

it("variable.import(name, module) can import a variable that depends on a mutable from another module", async () => {
  const runtime = new Runtime();
  const main = runtime.module();
  const module = runtime.module();
  module.define("mutable foo", [], () => 13);
  module.define("bar", ["mutable foo"], (foo: unknown) => foo);
  main.import("bar", module);
  const baz = main.variable(true).define("baz", ["bar"], (bar: unknown) => `baz-${bar}`);
  assert.deepStrictEqual(await valueof(baz), {value: "baz-13"});
});

it("variable.import() allows non-circular imported values from circular imports", async () => {
  const runtime = new Runtime();
  const a = runtime.module();
  const b = runtime.module();
  a.define("foo", [], () => "foo");
  b.define("bar", [], () => "bar");
  a.import("bar", b);
  b.import("foo", a);
  const afoobar = a.variable(true).define("foobar", ["foo", "bar"], (foo: unknown, bar: unknown) => "a" + foo + bar);
  const bfoobar = b.variable(true).define("foobar", ["foo", "bar"], (foo: unknown, bar: unknown) => "b" + foo + bar);
  assert.deepStrictEqual(await valueof(afoobar), {value: "afoobar"});
  assert.deepStrictEqual(await valueof(bfoobar), {value: "bfoobar"});
});

it("variable.import() fails when importing creates a circular reference", async () => {
  const runtime = new Runtime();
  const a = runtime.module();
  const b = runtime.module();
  a.import("bar", b);
  a.define("foo", ["bar"], (bar: unknown) => `foo${bar}`);
  b.import("foo", a);
  b.define("bar", ["foo"], (foo: unknown) => `${foo}bar`);
  const afoobar = a.variable(true).define("foobar", ["foo", "bar"], (foo: unknown, bar: unknown) => "a" + foo + bar);
  const bbarfoo = b.variable(true).define("barfoo", ["bar", "foo"], (bar: unknown, foo: unknown) => "b" + bar + foo);
  assert.deepStrictEqual(await valueof(afoobar), {error: "RuntimeError: circular definition"});
  assert.deepStrictEqual(await valueof(bbarfoo), {error: "RuntimeError: circular definition"});
});

it("variable.import() allows direct circular import-with if the resulting variables are not circular", async () => {
  const runtime = new Runtime();
  let a1: Variable, b1: Variable, a2: Variable, b2: Variable;

  // Module 1
  // a = 1
  // b
  // import {b} with {a} from "2"
  function define1() {
    const main = runtime.module();
    a1 = main.variable(true).define("a", () => 1);
    b1 = main.variable(true).define(["b"], (b: unknown) => b);
    const child1 = runtime.module(define2).derive(["a"], main);
    main.import("b", child1);
    return main;
  }

  // Module 2
  // b = 2
  // a
  // import {a} with {b} from "1"
  function define2() {
    const main = runtime.module();
    b2 = main.variable(true).define("b", () => 2);
    a2 = main.variable(true).define(["a"], (a: unknown) => a);
    const child1 = runtime.module(define1).derive(["b"], main);
    main.import("a", child1);
    return main;
  }

  define1();

  assert.deepStrictEqual(await valueof(a1!), {value: 1});
  assert.deepStrictEqual(await valueof(b1!), {value: 2});
  assert.deepStrictEqual(await valueof(a2!), {value: 1});
  assert.deepStrictEqual(await valueof(b2!), {value: 2});
});

it("variable.import() allows indirect circular import-with if the resulting variables are not circular", async () => {
  const runtime = new Runtime();
  let a: Variable, b: Variable, c: Variable, importA: Variable, importB: Variable, importC: Variable;

  // Module 1
  // a = 1
  // c
  // import {c} with {a} from "3"
  function define1() {
    const main = runtime.module();
    a = main.variable(true).define("a", () => 1);
    importC = main.variable(true).define(["c"], (c: unknown) => c);
    const child3 = runtime.module(define3).derive(["a"], main);
    main.import("c", child3);
    return main;
  }

  // Module 2
  // b = 2
  // a
  // import {a} with {b} from "1"
  function define2() {
    const main = runtime.module();
    b = main.variable(true).define("b", () => 2);
    importA = main.variable(true).define(["a"], (a: unknown) => a);
    const child1 = runtime.module(define1).derive(["b"], main);
    main.import("a", child1);
    return main;
  }

  // Module 3
  // c = 3
  // b
  // import {b} with {c} from "2"
  function define3() {
    const main = runtime.module();
    c = main.variable(true).define("c", () => 3);
    importB = main.variable(true).define(["b"], (b: unknown) => b);
    const child2 = runtime.module(define2).derive(["c"], main);
    main.import("b", child2);
    return main;
  }

  define1();

  assert.deepStrictEqual(await valueof(a!), {value: 1});
  assert.deepStrictEqual(await valueof(b!), {value: 2});
  assert.deepStrictEqual(await valueof(c!), {value: 3});
  assert.deepStrictEqual(await valueof(importA!), {value: 1});
  assert.deepStrictEqual(await valueof(importB!), {value: 2});
  assert.deepStrictEqual(await valueof(importC!), {value: 3});
});

it("variable.import() supports lazy imports", async () => {
  let resolve2: (value: ModuleDefinition) => void;
  const promise2 = new Promise<ModuleDefinition>((resolve) => (resolve2 = resolve));

  function define1(runtime: Runtime, observer: (name?: string) => ObserverInput) {
    const main = runtime.module();
    main.define("module 1", async () => runtime.module(await promise2));
    main.define("a", ["module 1", "@variable"], (_: unknown, v: unknown) =>
      (v as {import: (name: string, module: unknown) => unknown}).import("a", _),
    );
    main.variable(observer("imported a")).define("imported a", ["a"], (a: unknown) => a);
    return main;
  }

  function define2(runtime: Runtime, observer: (name?: string) => ObserverInput) {
    const main = runtime.module();
    main.variable(observer("a")).define("a", [], () => 1);
    return main;
  }

  const runtime = new Runtime();
  const inspectorA = promiseInspector();
  runtime.module(define1, (name?: string) => {
    if (name === "imported a") {
      return inspectorA;
    }
  });

  await sleep();
  resolve2!(define2);
  assert.deepStrictEqual(await inspectorA, 1);
});

it("variable.import() supports lazy transitive imports", async () => {
  let resolve2: (value: ModuleDefinition) => void;
  const promise2 = new Promise<ModuleDefinition>((resolve) => (resolve2 = resolve));
  let resolve3: (value: ModuleDefinition) => void;
  const promise3 = new Promise<ModuleDefinition>((resolve) => (resolve3 = resolve));

  function define1(runtime: Runtime, observer: (name?: string) => ObserverInput): Module {
    const main = runtime.module();
    main.define("module 1", async () => runtime.module(await promise2));
    main.define("b", ["module 1", "@variable"], (_: unknown, v: unknown) =>
      (v as {import: (name: string, module: unknown) => unknown}).import("b", _),
    );
    main.variable(observer("a")).define("a", ["b"], (b: unknown) => (b as number) + 1);
    return main;
  }

  function define2(runtime: Runtime, observer: (name?: string) => ObserverInput): Module {
    const main = runtime.module();
    main.define("module 1", async () => runtime.module(await promise3));
    main.define("c", ["module 1", "@variable"], (_: unknown, v: unknown) =>
      (v as {import: (name: string, module: unknown) => unknown}).import("c", _),
    );
    main.variable(observer("b")).define("b", ["c"], (c: unknown) => (c as number) + 1);
    return main;
  }

  function define3(runtime: Runtime, observer: (name?: string) => ObserverInput) {
    const main = runtime.module();
    main.variable(observer("c")).define("c", [], () => 1);
    return main;
  }

  const runtime = new Runtime();
  const inspectorA = promiseInspector();
  runtime.module(define1, (name?: string): ObserverInput => {
    if (name === "a") {
      return inspectorA;
    }
  });

  await sleep();
  resolve2!(define2);
  await sleep();
  resolve3!(define3);
  assert.deepStrictEqual(await inspectorA, 3);
});
