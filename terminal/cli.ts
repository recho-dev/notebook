#!/usr/bin/env node
// Terminal Recho — entry point.
//
// Usage:
//   recho [file.recho.js]
//
// The runtime imports a couple of TypeScript modules. Node 24 supports
// transparent .ts loading for type-strip-friendly files; the project's
// .ts files have been adjusted to fit, so we don't need a flag. Installed
// as a package, the compiled copy in dist/ runs instead (`pnpm build:tui`).

import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {App} from "./app.ts";
import {setTheme} from "./highlight.ts";
import {detectTerminalTheme} from "./theme.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Examples and docs are read from the package root, which is one level up
// from terminal/ in the checkout but two up from dist/terminal/ — so locate
// it by its package.json instead of by depth.
const repoRoot = findPackageRoot(__dirname);
const examplesDir = path.join(repoRoot, "app", "examples");
const docsDir = path.join(repoRoot, "app", "docs");

function findPackageRoot(dir: string): string {
  for (let d = dir; ; d = path.dirname(d)) {
    if (fs.existsSync(path.join(d, "package.json"))) return d;
    if (path.dirname(d) === d) return path.resolve(dir, "..");
  }
}

const DEFAULT_CODE = `// Welcome to Recho · the reactive notebook for your terminal.
// Edit code below and press ^S to run. Output appears as //➜ comments.

const greet = (name) => echo(\`Hello, \${name}!\`);

greet("world");

// A small loop — each \`echo\` lands inline above its expression.
for (let i = 1; i <= 5; i++) {
  echo("*".repeat(i));
}

// Press ^E to browse examples (sorting, mazes, ASCII art, …)
// Press ^N for a new empty file, ^T to rename the current file.
`;

async function main() {
  const args = process.argv.slice(2);
  let initialPath = null;
  let initialCode = DEFAULT_CODE;

  for (const a of args) {
    if (a === "-h" || a === "--help") {
      printHelp();
      process.exit(0);
    }
    if (!a.startsWith("-")) {
      initialPath = path.resolve(a);
      try {
        initialCode = fs.readFileSync(initialPath, "utf8");
      } catch (e) {
        console.error("Cannot read", initialPath + ":", e instanceof Error ? e.message : String(e));
        process.exit(1);
      }
      break;
    }
  }

  if (!process.stdout.isTTY) {
    console.error("recho: stdout is not a TTY (need an interactive terminal).");
    process.exit(1);
  }

  // Match the terminal's background before the first paint (set RECHO_THEME
  // to light/dark to override the detection).
  setTheme(await detectTerminalTheme());

  const app = new App({initialPath, initialCode, examplesDir, docsDir});
  app.start();
}

function printHelp() {
  process.stdout.write(
    [
      "Recho Notebook — terminal edition",
      "",
      "Usage:",
      "  recho                  open with the welcome buffer",
      "  recho path/to/file.js  open an existing notebook source",
      "",
      "Inside the editor:",
      "  ^S  run        ^X  stop          ^R  restart runtime",
      "  ^E  examples   ^N  new file      ^O  open file",
      "  ^W  save       ^T  rename file   ^L  console",
      "  ^K  help       ^Q  quit",
      "",
      "Theme: auto-detected from the terminal background;",
      "set RECHO_THEME=light or RECHO_THEME=dark to override.",
      "",
    ].join("\n"),
  );
}

await main();
