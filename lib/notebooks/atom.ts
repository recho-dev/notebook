import {atom} from "jotai";
import {loadNotebooksFromStorage, saveNotebooksToStorage} from "./storage.ts";
import type {Notebook} from "./schema.ts";
import type {SetStateAction} from "react";

export const baseNotebooksAtom = atom<Notebook[]>(loadNotebooksFromStorage());

export const notebooksAtom = atom<Notebook[], [SetStateAction<Notebook[]>], void>(
  (get) => get(baseNotebooksAtom),
  (get, set, update) => {
    const oldValue = get(baseNotebooksAtom);
    const newValue = typeof update === "function" ? update(oldValue) : update;
    set(baseNotebooksAtom, newValue);
    saveNotebooksToStorage(newValue, oldValue);
  },
);
