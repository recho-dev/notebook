import {describe, expect, it} from "vitest";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {
  classifyExample,
  requireSpecifiers,
  suitableForTui,
  hasTuiFlag,
  listTuiExamples,
  packageIsInstalled,
} from "../terminal/examples.ts";

const installed = new Set(["d3-array", "d3-random", "lodash", "three", "compromise"]);
const isInstalled = (name) => installed.has(name);

describe("suitableForTui", () => {
  it("reads the @tui header flag", () => {
    expect(suitableForTui("/**\n * @title X\n * @tui false\n */\n")).toBe(false);
    expect(suitableForTui("/**\n * @title X\n * @tui true\n */\n")).toBe(true);
  });

  it("treats a missing flag as suitable", () => {
    expect(suitableForTui("/**\n * @title X\n */\necho(1);\n")).toBe(true);
    expect(hasTuiFlag("/**\n * @title X\n */\n")).toBe(false);
  });
});

describe("requireSpecifiers", () => {
  it("collects literals across quote styles and calls", () => {
    const source = `
      const d3 = recho.require("d3-array", 'd3-random');
      const {Vector3} = await recho.require(\`three@0.160.0/build/three.min.js\`);
    `;
    expect(requireSpecifiers(source)).toEqual(["d3-array", "d3-random", "three@0.160.0/build/three.min.js"]);
  });
});

describe("classifyExample", () => {
  it("accepts installed packages, including pinned CDN-style specifiers", () => {
    expect(classifyExample(`const d3 = recho.require("d3-array", "d3-random");`, isInstalled)).toBeNull();
    expect(classifyExample(`recho.require("three@0.160.0/build/three.min.js")`, isInstalled)).toBeNull();
  });

  it("flags URL specifiers", () => {
    expect(classifyExample(`recho.require("https://unpkg.com/p5@1.2.0/lib/p5.js")`, isInstalled)).toBe(
      "loads a library from a URL",
    );
  });

  it("flags packages that are not installed", () => {
    expect(classifyExample(`recho.require("ml5")`, isInstalled)).toBe("needs ml5, which isn't installed");
  });

  it("flags browser globals", () => {
    expect(classifyExample(`const c = document.createElement("canvas");`, isInstalled)).toBe("uses browser APIs");
    expect(classifyExample(`const img = new Image();`, isInstalled)).toBe("uses browser APIs");
  });

  it("leaves plain notebooks alone", () => {
    expect(classifyExample(`echo(1 + 1);`, isInstalled)).toBeNull();
  });
});

describe("bundled examples", () => {
  const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "app", "examples");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".recho.js"));
  const read = (f) => fs.readFileSync(path.join(dir, f), "utf8");

  it("all carry an explicit @tui flag", () => {
    expect(files.filter((f) => !hasTuiFlag(read(f)))).toEqual([]);
  });

  it("flag their terminal suitability honestly", () => {
    for (const f of files) {
      const source = read(f);
      const reason = classifyExample(source, packageIsInstalled);
      // Suitable examples must have nothing the terminal can't load; opted-out
      // ones must have a concrete reason.
      if (suitableForTui(source)) expect(reason, f).toBeNull();
      else expect(reason, f).not.toBeNull();
    }
  });

  it("hide exactly the browser-only ones from the picker", () => {
    const hidden = files.filter((f) => !listTuiExamples(dir, files).includes(f));
    expect(hidden.sort()).toEqual(["ml5-handpose.recho.js", "pokemon.recho.js"]);
  });
});
