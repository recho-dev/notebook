import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {afterEach, describe, expect, it} from "vitest";
import {App} from "../terminal/app.ts";

const tmpDirs = [];

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "recho-terminal-"));
  tmpDirs.push(dir);
  return dir;
}

function makeApp(initialPath = null, initialCode = "echo(1);") {
  const app = new App({initialPath, initialCode, examplesDir: null});
  app.initRuntime = () => {};
  return app;
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) fs.rmSync(dir, {recursive: true, force: true});
});

describe("terminal file actions", () => {
  it("creates a new empty buffer", () => {
    const app = makeApp("/tmp/old.recho.js", "echo(1);");

    app.newFile();

    expect(app.path).toBe(null);
    expect(app.buffer.text).toBe("");
    expect(app.scrollY).toBe(0);
    expect(app.scrollX).toBe(0);
  });

  it("renames the current file and keeps the current buffer contents", () => {
    const dir = makeTmpDir();
    const oldPath = path.join(dir, "old.recho.js");
    const newPath = path.join(dir, "new.recho.js");
    fs.writeFileSync(oldPath, "echo('old');", "utf8");
    const app = makeApp(oldPath, "echo('edited');");

    app.renamePrompt();
    app.activeModal.onSubmit(newPath);

    expect(fs.existsSync(oldPath)).toBe(false);
    expect(fs.readFileSync(newPath, "utf8")).toBe("echo('edited');");
    expect(app.path).toBe(newPath);
  });
});
