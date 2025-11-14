import {generate} from "short-uuid";
import {predicates, objects} from "friendly-words";

const LEGACY_FILE_NAME = "obs-files";

const FILE_NAME = "recho-files";

const DEFAULT_RUNTIME = "javascript@0.1.0";

function generateProjectName() {
  const adj = predicates[~~(Math.random() * predicates.length)];
  const obj = objects[~~(Math.random() * objects.length)];
  return `${adj}-${obj}.js`;
}

const DEFAULT_CONTENT = `
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

export function createNotebook() {
  return {
    id: generate(),
    title: generateProjectName(),
    created: null,
    updated: null,
    content: DEFAULT_CONTENT.trimStart(),
    autoRun: true,
    runtime: DEFAULT_RUNTIME,
  };
}

function saveNotebooks(notebooks) {
  localStorage.setItem(FILE_NAME, JSON.stringify(notebooks));
}

function renameLegacyNotebooks() {
  const legacyNotebooks = localStorage.getItem(LEGACY_FILE_NAME);
  if (!legacyNotebooks) return;
  saveNotebooks(JSON.parse(legacyNotebooks));
  localStorage.removeItem(LEGACY_FILE_NAME);
}

export function getNotebooks() {
  renameLegacyNotebooks();
  const files = localStorage.getItem(FILE_NAME);
  if (!files) return [];
  const notebooks = JSON.parse(files).sort((a, b) => new Date(b.updated) - new Date(a.updated));
  // Remove fallback runtime when we have breaking changes.
  return notebooks.map((notebook) => {
    const newNotebook = {...notebook, runtime: DEFAULT_RUNTIME};
    // Add fallback created timestamp.
    if (!newNotebook.created) newNotebook.created = new Date().toISOString();
    return newNotebook;
  });
}

export function clearNotebooksFromLocalStorage() {
  localStorage.removeItem(FILE_NAME);
}

export function getNotebookById(id) {
  const notebooks = getNotebooks();
  return notebooks.find((f) => f.id === id);
}

export function deleteNotebook(id) {
  if (confirm("Are you sure you want to delete this notebook?")) {
    const notebooks = getNotebooks();
    const newNotebooks = notebooks.filter((f) => f.id !== id);
    saveNotebooks(newNotebooks);
  }
}

export function addNotebook(notebook) {
  const notebooks = getNotebooks();
  const time = new Date().toISOString();
  const newNotebook = {...notebook, created: time, updated: time};
  saveNotebooks([...notebooks, newNotebook]);
}

export function saveNotebook(notebook) {
  const notebooks = getNotebooks();
  const updatedNotebook = {...notebook, updated: new Date().toISOString()};
  // Prevent creating a new notebook if the created timestamp is not set.
  if (!updatedNotebook.created) {
    updatedNotebook.created = new Date().toISOString();
  }
  const newNotebooks = notebooks.map((f) => (f.id === notebook.id ? updatedNotebook : f));
  saveNotebooks(newNotebooks);
}

export function generateDuplicateName(originalName) {
  // Handle names with extension like "[NAME].js" -> "[NAME] copy.js"
  const lastDotIndex = originalName.lastIndexOf(".");
  if (lastDotIndex > 0) {
    const name = originalName.substring(0, lastDotIndex);
    const extension = originalName.substring(lastDotIndex);
    return `${name} copy${extension}`;
  }
  // Handle names without extension like "NAME" -> "NAME copy"
  return `${originalName} copy`;
}

export function duplicateNotebook(sourceNotebook) {
  const newNotebook = createNotebook();
  const duplicatedTitle = generateDuplicateName(sourceNotebook.title);
  return {
    ...newNotebook,
    title: duplicatedTitle,
    content: sourceNotebook.content,
    autoRun: sourceNotebook.autoRun,
  };
}
