#!/usr/bin/env node
// Terminal Recho — entry point.
//
// Usage:
//   recho [file.recho.js]
//
// The runtime imports a couple of TypeScript modules. Node 24 supports
// transparent .ts loading for type-strip-friendly files; the project's
// .ts files have been adjusted to fit, so we don't need a flag.

import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {App} from "./app.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const examplesDir = path.join(repoRoot, "app", "examples");

const DEFAULT_CODE = `// Welcome to Recho · the reactive notebook for your terminal.
// Edit code below and press ^S to run. Output appears as //➜ comments.

const greet = (name) => echo(\`Hello, \${name}!\`);

greet("world");

// A small loop — each \`echo\` lands inline above its expression.
for (let i = 1; i <= 5; i++) {
  echo("*".repeat(i));
}

// Press ^E to browse examples (sorting, mazes, ASCII art, …)
`;

function main() {
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
        console.error("Cannot read", initialPath + ":", e.message);
        process.exit(1);
      }
      break;
    }
  }

  if (!process.stdout.isTTY) {
    console.error("recho: stdout is not a TTY (need an interactive terminal).");
    process.exit(1);
  }

  const app = new App({initialPath, initialCode, examplesDir});
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
      "  ^E  examples   ^O  open file     ^W  save",
      "  ^K  help       ^Q  quit",
      "",
    ].join("\n"),
  );
}

main();
