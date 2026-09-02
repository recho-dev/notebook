import {describe, expect, it} from "vitest";
import {parseSpecifier} from "../runtime/stdlib/specifier.js";

describe("parseSpecifier", () => {
  it("reads a bare package name", () => {
    expect(parseSpecifier("d3-random")).toEqual({url: false, name: "d3-random", version: null, subpath: ""});
  });

  it("reads a scoped package name", () => {
    expect(parseSpecifier("@observablehq/plot")).toEqual({
      url: false,
      name: "@observablehq/plot",
      version: null,
      subpath: "",
    });
  });

  it("splits off a pinned version and a build path", () => {
    expect(parseSpecifier("three@0.160.0/build/three.min.js")).toEqual({
      url: false,
      name: "three",
      version: "0.160.0",
      subpath: "/build/three.min.js",
    });
  });

  it("handles a scoped package with a version and subpath", () => {
    expect(parseSpecifier("@scope/pkg@1.2.3/dist/index.js")).toEqual({
      url: false,
      name: "@scope/pkg",
      version: "1.2.3",
      subpath: "/dist/index.js",
    });
  });

  it("keeps an unversioned subpath", () => {
    expect(parseSpecifier("lodash/fp")).toEqual({url: false, name: "lodash", version: null, subpath: "/fp"});
  });

  it("flags http(s) URLs", () => {
    expect(parseSpecifier("https://unpkg.com/p5@1.2.0/lib/p5.js").url).toBe(true);
    expect(parseSpecifier("http://example.com/x.js").url).toBe(true);
  });

  it("does not treat node: builtins as URLs", () => {
    expect(parseSpecifier("node:fs")).toEqual({url: false, name: "node:fs", version: null, subpath: ""});
  });
});
