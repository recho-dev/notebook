import fs from "fs";
import path from "path";
import {findFirstOutputRange} from "./shared.js";

function parseJSMeta(content) {
  const match = content.match(/^\/\*\*([\s\S]*?)\*\//);
  if (!match) return null;
  const block = match[1];
  const meta = {};
  for (const line of block.split("\n")) {
    const m = line.match(/@(\w+)\s+(.*)/);
    if (m) meta[m[1]] = m[2].trim();
  }
  return meta;
}

export function removeJSMeta(content) {
  return content.replace(/^\/\*\*([\s\S]*?)\*\//, "").trimStart();
}

export function getAllJSDocs() {
  const dir = path.join(process.cwd(), "app/docs/");
  const files = fs.readdirSync(dir);
  return files
    .filter((file) => file.endsWith(".recho.js"))
    .map((file) => {
      const content = fs.readFileSync(path.join(dir, file), "utf8");
      const meta = parseJSMeta(content);
      return {...meta, content, slug: file.replace(".recho.js", "")};
    });
}

export function getAllJSExamples() {
  const dir = path.join(process.cwd(), "app/examples");
  const files = fs.readdirSync(dir);
  return files
    .filter((file) => file.endsWith(".recho.js"))
    .map((file) => {
      const content = fs.readFileSync(path.join(dir, file), "utf8");
      const meta = parseJSMeta(content);
      const {startLine, endLine} = findFirstOutputRange(content);
      if (!meta) {
        throw new Error(`No meta found in ${file}`);
      }
      return {
        ...meta,
        content,
        slug: file.replace(".recho.js", ""),
        outputStartLine: meta.thumbnail_start ?? startLine,
        outputEndLine: endLine,
      };
    });
}
