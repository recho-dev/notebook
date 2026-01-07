import type {Notebook} from "./schema.ts";

export function setNotebook(notebooks: Notebook[], id: string, notebook: Notebook): Notebook[] {
  return notebooks.map((n) => (n.id === id ? notebook : n));
}

export function updateNotebook(notebooks: Notebook[], id: string, fields: Partial<Notebook>): Notebook[] {
  return notebooks.map((n) => (n.id === id ? {...n, ...fields} : n));
}
