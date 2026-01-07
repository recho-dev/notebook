import {generate} from "short-uuid";
import type {Notebook, Snapshot} from "./schema.ts";
import {objects, predicates} from "friendly-words";

export const DEFAULT_CONTENT = `
/* 
** Welcome to                                                                         
**  ___        _          _  _     _       _              _   
** | _ \\___ __| |_  ___  | \\| |___| |_ ___| |__  ___  ___| |__
** |   / -_) _| ' \\/ _ \\ | .\` / _ \\  _/ -_) '_ \\/ _ \\/ _ \\ / /
** |_|_\\___\\__|_||_\\___/ |_|\\_\\___/\\__\\___|_.__/\\___/\\___/_\\_\\
**
** A reactive editor for algorithms and ASCII art. 
*/

// 1. You can call echo(value) to echo output inline as comments, which allows
// you to better understand the code by "seeing" every manipulation in-situ.

const text = echo("dog");

const chars = echo(text.split(""));

echo(chars.slice().reverse().join(""));

// 2. You can also call recho.interval(ms) to create data-driven animations,
// which can help you find the minimalism of ASCII art is fascinating!

const x = recho.interval(100);

echo("🚗💨".padStart(40 - (x % 40)));

// 3. Inputs are also supported, which can help you create interactive
// notebooks. Click the buttons to see what happens!

const x1 = recho.number(10, {min: 0, max: 40, step: 1});

//➜ "(๑•̀ㅂ•́)و✧"
echo("~".repeat(x1) + "(๑•̀ㅂ•́)و✧");

// Refer to the links (cmd/ctrl + click) to learn more about Recho Notebook:
// - Docs: https://recho.dev/notebook/docs
// - Examples: https://recho.dev/notebook/examples
// - Github: https://github.com/recho-dev/notebook
`;

export const LEGACY_RECHO_FILES_KEY = "obs-files";

export const RECHO_FILES_KEY = "recho-files";

const DEFAULT_RUNTIME = "javascript@0.1.0";

export function snapshotKey(id: string): string {
  return `content_${id}`;
}

export function createSnapshot(content: string, name: string | null = null, created: number = Date.now()): Snapshot {
  return {id: generate(), name, content, created};
}

export function saveSnapshot(snapshot: Snapshot): void {
  localStorage.setItem(snapshotKey(snapshot.id), JSON.stringify(snapshot));
}

function generateNotebookTitle() {
  const adj = predicates[~~(Math.random() * predicates.length)];
  const obj = objects[~~(Math.random() * objects.length)];
  return `${adj}-${obj}.js`;
}

export function createNotebook(): Notebook {
  const snapshot = createSnapshot(DEFAULT_CONTENT);
  return {
    id: generate(),
    title: generateNotebookTitle(),
    created: snapshot.created,
    updated: snapshot.created,
    autoRun: true,
    runtime: DEFAULT_RUNTIME,
    snapshots: [snapshot],
  };
}
