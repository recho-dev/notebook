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
        meta[key] = value.split(",").map((l) => l.trim()).filter((l) => l.length > 0);
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

function ensureSnapImageInPublic(snapFile, slug) {
  if (!snapFile) return null;
  const publicExamplesDir = path.join(process.cwd(), "public", "examples");
  const publicSnapPath = path.join(publicExamplesDir, snapFile);
  if (!fs.existsSync(publicExamplesDir)) {
    fs.mkdirSync(publicExamplesDir, {recursive: true});
  }
  if (!fs.existsSync(publicSnapPath)) {
    const sourcePath = path.join(process.cwd(), "app", "examples", snapFile);
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, publicSnapPath);
    }
  }
  return snapFile;
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
      const snap = files.find((f) => f.startsWith(slug + ".snap"));
      const publicSnap = ensureSnapImageInPublic(snap, slug);
      if (!meta) {
        throw new Error(`No meta found in ${file}`);
      }
      return {
        ...meta,
        content,
        slug,
        outputStartLine: meta.thumbnail_start ?? startLine,
        outputEndLine: endLine,
        snap: publicSnap,
      };
    });
}
