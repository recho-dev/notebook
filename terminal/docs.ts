import fs from "node:fs";
import path from "node:path";
import {docsNavConfig} from "../app/docs/nav.config.js";

type DocsNavPage = {type: "page"; slug: string};
type DocsNavGroup = {type: "group"; title: string; slug?: string; items: DocsNavPage[]};
type DocsNavItem = DocsNavPage | DocsNavGroup;

export type HelpDoc = {
  slug: string;
  title: string;
  content: string;
  lines: string[];
};

export type HelpEntry = {
  kind: "group" | "page";
  title: string;
  slug: string | null;
  depth: number;
  selectable: boolean;
};

export type HelpDocs = {
  entries: HelpEntry[];
  docsBySlug: Map<string, HelpDoc>;
};

type Meta = {title?: string};

function parseJSMeta(content: string): Meta {
  const match = content.match(/^\/\*\*([\s\S]*?)\*\//);
  if (!match) return {};
  const meta: Meta = {};
  for (const line of (match[1] ?? "").split("\n")) {
    const m = line.match(/@(\w+)\s+(.*)/);
    if (m?.[1] === "title") meta.title = (m[2] ?? "").trim();
  }
  return meta;
}

function removeJSMeta(content: string): string {
  return content.replace(/^\/\*\*([\s\S]*?)\*\//, "").trimStart();
}

function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function addDocEntry(entries: HelpEntry[], docsBySlug: Map<string, HelpDoc>, slug: string, depth: number) {
  const doc = docsBySlug.get(slug);
  if (!doc) return false;
  entries.push({kind: "page", title: doc.title, slug, depth, selectable: true});
  return true;
}

export function loadHelpDocs(docsDir: string): HelpDocs {
  const docsBySlug = new Map<string, HelpDoc>();
  const files = fs
    .readdirSync(docsDir)
    .filter((file) => file.endsWith(".recho.js"))
    .sort();

  for (const file of files) {
    const slug = file.replace(/\.recho\.js$/, "");
    const raw = fs.readFileSync(path.join(docsDir, file), "utf8");
    const meta = parseJSMeta(raw);
    const content = removeJSMeta(raw);
    docsBySlug.set(slug, {
      slug,
      title: meta.title || titleFromSlug(slug),
      content,
      lines: content.split("\n"),
    });
  }

  const entries: HelpEntry[] = [];
  const included = new Set<string>();

  for (const item of docsNavConfig as DocsNavItem[]) {
    if (item.type === "page") {
      if (addDocEntry(entries, docsBySlug, item.slug, 0)) included.add(item.slug);
      continue;
    }

    const groupDoc = item.slug ? docsBySlug.get(item.slug) : null;
    entries.push({
      kind: "group",
      title: item.title,
      slug: groupDoc ? item.slug || null : null,
      depth: 0,
      selectable: Boolean(groupDoc),
    });
    if (groupDoc && item.slug) included.add(item.slug);
    for (const child of item.items) {
      if (addDocEntry(entries, docsBySlug, child.slug, 1)) included.add(child.slug);
    }
  }

  for (const slug of [...docsBySlug.keys()].sort()) {
    if (included.has(slug)) continue;
    addDocEntry(entries, docsBySlug, slug, 0);
  }

  return {entries, docsBySlug};
}
