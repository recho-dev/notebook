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

export function createNotebook() {
  return {
    id: generate(),
    title: generateProjectName(),
    created: null,
    updated: null,
    content: `echo("Hello, world!");`,
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
  return notebooks.map((notebook) => ({...notebook, runtime: DEFAULT_RUNTIME}));
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
  const newNotebooks = notebooks.map((f) => (f.id === notebook.id ? updatedNotebook : f));
  saveNotebooks(newNotebooks);
}
