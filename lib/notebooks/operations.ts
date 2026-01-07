import type {Notebook} from "./schema.ts";

export function setNotebook(notebooks: Notebook[], id: string, notebook: Notebook): Notebook[] {
  return notebooks.map((n) => (n.id === id ? notebook : n));
}

export function updateNotebook(notebooks: Notebook[], id: string, fields: Partial<Notebook>): Notebook[] {
  return notebooks.map((n) => (n.id === id ? {...n, ...fields} : n));
}

export function updateItem<T extends {id: string}>(items: T[], id: string, update: Partial<T> | ((item: T) => Partial<T>)): T[] {
  return items.map((item) => (item.id === id ? {...item, ...(typeof update === "function" ? update(item) : update)} : item));
}

export function removeItem<T extends {id: string}>(items: T[], id: string): T[] {
  return items.filter((item) => item.id === id);
}
