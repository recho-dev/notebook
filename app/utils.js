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
    if (m) {
      const key = m[1];
      const value = m[2].trim();
      // Parse @label as comma-separated values
      if (key === "label") {
        meta[key] = value
          .split(",")
          .map((l) => l.trim())
          .filter((l) => l.length > 0);
      } else {
        meta[key] = value;
      }
    }
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
      const slug = file.replace(".recho.js", "");
      if (!meta) {
        throw new Error(`No meta found in ${file}`);
      }
      return {
        ...meta,
        content,
        slug,
        outputStartLine: meta.thumbnail_start ?? startLine,
        outputEndLine: endLine,
        snap: meta.snap ?? null,
      };
    });
}
