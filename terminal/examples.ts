// Which bundled examples the terminal picker should offer. Each example's
// header block carries an explicit `@tui true|false` flag; the static checks
// below exist so a test can keep those flags honest.

import fs from "node:fs";
import path from "node:path";
import {createRequire} from "node:module";
import {parseSpecifier} from "../runtime/stdlib/specifier.js";

/** The header's `@tui` flag. Absent means suitable, so unlabeled notebooks still show. */
export function suitableForTui(source: string): boolean {
  const flag = source.match(/^\s*\*\s*@tui\s+(\S+)/m);
  return flag ? flag[1] !== "false" : true;
}

/** Whether the header carries an explicit `@tui` flag at all. */
export function hasTuiFlag(source: string): boolean {
  return /^\s*\*\s*@tui\s+\S+/m.test(source);
}

/** The example files in `dir` whose header doesn't opt out of the terminal. */
export function listTuiExamples(dir: string, files: string[]): string[] {
  return files.filter((file) => {
    try {
      return suitableForTui(fs.readFileSync(path.join(dir, file), "utf8"));
    } catch {
      return true;
    }
  });
}

/** The string literals passed to `recho.require(...)` calls in `source`. */
export function requireSpecifiers(source: string): string[] {
  const specs: string[] = [];
  for (const call of source.matchAll(/recho\.require\(([^)]*)\)/g)) {
    for (const literal of call[1]!.matchAll(/"([^"]+)"|'([^']+)'|`([^`]+)`/g)) {
      specs.push(literal[1] ?? literal[2] ?? literal[3]!);
    }
  }
  return specs;
}

/**
 * Why `source` can't run outside the browser, or null when nothing in it
 * says so. Mirrors what the runtime's `recho.require` will accept.
 */
export function classifyExample(source: string, isInstalled: (name: string) => boolean): string | null {
  for (const spec of requireSpecifiers(source)) {
    const {url, name} = parseSpecifier(spec);
    if (url) return "loads a library from a URL";
    if (name && !isInstalled(name)) return `needs ${name}, which isn't installed`;
  }
  if (/\b(document|window|navigator)\b|new Image\(/.test(source)) return "uses browser APIs";
  return null;
}

const localRequire = createRequire(import.meta.url);

/** Whether the runtime, which shares this package's node_modules, can import `name`. */
export function packageIsInstalled(name: string): boolean {
  try {
    if (typeof import.meta.resolve === "function") import.meta.resolve(name);
    else localRequire.resolve(name);
    return true;
  } catch {
    return false;
  }
}
