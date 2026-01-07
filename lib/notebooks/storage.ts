import Value from "typebox/value";
import {NotebooksSchema, type Notebook, type Snapshot} from "./schema.ts";
import {createSnapshot, DEFAULT_CONTENT, RECHO_FILES_KEY, saveSnapshot, snapshotKey} from "./utils.ts";
import {isDirtyAtom} from "./atom.ts";
import type {Dispatch, SetStateAction} from "react";
import {useAtom} from "jotai";

export function loadSnapshotsFromStorage(ids: string[]): Snapshot[] {
  const snapshots: Snapshot[] = [];
  for (let i = 0, n = ids.length; i < n; i++) {
    const raw = localStorage.getItem(snapshotKey(ids[i]));
    if (!raw) continue;
    try {
      const snapshot = JSON.parse(raw);
      snapshots.push(snapshot);
    } catch {
      continue;
    }
  }
  // Keep the latest snapshot at the first position and sort the rest.
  const latestSnapshot = snapshots.shift();
  snapshots.sort((a, b) => b.created - a.created);
  if (latestSnapshot) snapshots.unshift(latestSnapshot);
  return snapshots;
}

export function loadNotebooksFromStorage(): Notebook[] {
  const rawString = localStorage.getItem(RECHO_FILES_KEY);
  if (!rawString) return [];
  try {
    const rawObject = JSON.parse(rawString);
    // Parse the notebook first.
    const rawNotebooks = Value.Decode(NotebooksSchema, rawObject);
    const notebooks: Notebook[] = [];
    for (let i = 0, n = rawNotebooks.length; i < n; i++) {
      let snapshots: Snapshot[];
      // Examine the four cases documented above in the schema definition.
      const current = rawNotebooks[i];
      if (typeof current.content === "string") {
        const snapshot = createSnapshot(current.content);
        saveSnapshot(snapshot);
        if (current.snapshots === undefined) {
          snapshots = [snapshot];
        } else {
          snapshots = [snapshot, ...loadSnapshotsFromStorage(current.snapshots)];
        }
      } else {
        // This loads the snapshots that are present in the localStorage.
        const restSnapshots = current.snapshots === undefined ? [] : loadSnapshotsFromStorage(current.snapshots);
        if (restSnapshots.length > 0) {
          snapshots = restSnapshots;
        } else {
          const snapshot = createSnapshot(DEFAULT_CONTENT);
          saveSnapshot(snapshot);
          snapshots = [snapshot];
        }
      }
      // Keep all other properties and use the new snapshots array.
      notebooks.push({
        id: current.id,
        title: current.title,
        created: current.created,
        updated: current.updated,
        snapshots,
        autoRun: current.autoRun,
        runtime: current.runtime,
      });
    }
    return notebooks;
  } catch {
    // TODO: Recover as many as possible notebooks from the localStorage.
    return [];
  }
}

export function saveNotebooksToStorage(notebooks: Notebook[], previousNotebooks: Notebook[]): void {
  if (notebooks === previousNotebooks) return;

  const snapshotsSet = new Map<Snapshot, boolean>();
  // Collect all snapshots from the previous notebooks.
  for (let i = 0, n = previousNotebooks.length; i < n; i++) {
    const notebook = previousNotebooks[i];
    for (let j = 0, m = notebook.snapshots.length; j < m; j++) {
      // false means to call `removeItem`, true means to call `setItem`.
      snapshotsSet.set(notebook.snapshots[j], false);
    }
  }

  // Fast serialization by manually constructing the JSON string.
  let buffer = "[";
  for (let i = 0, n = notebooks.length; i < n; i++) {
    if (buffer.length > 1) buffer += ",";
    const notebook = notebooks[i];
    // These fields are known to be safe without escaping.
    buffer += `{"id":"${notebook.id}","title":${JSON.stringify(notebook.title)},"created":${notebook.created},"updated":${notebook.updated},"autoRun":${notebook.autoRun},"runtime":"${notebook.runtime}"`;
    buffer += `,"snapshots":[`;
    for (let j = 0, m = notebook.snapshots.length; j < m; j++) {
      const snapshot = notebook.snapshots[j];
      if (j > 0) buffer += ",";
      buffer += `"${snapshot.id}"`;
      // Mark the sanpshot to be saved or removed.
      if (snapshotsSet.has(snapshot)) {
        snapshotsSet.delete(snapshot);
      } else {
        snapshotsSet.set(snapshot, true);
      }
    }
    buffer += "]}";
  }
  buffer += "]";
  // Save to localStorage.
  localStorage.setItem(RECHO_FILES_KEY, buffer);

  // Update the snapshots in the localStorage.
  for (const [snapshot, action] of snapshotsSet.entries()) {
    if (action) {
      localStorage.setItem(snapshotKey(snapshot.id), JSON.stringify(snapshot));
    } else {
      localStorage.removeItem(snapshotKey(snapshot.id));
    }
  }
}

export function useIsDirty(): [boolean, Dispatch<SetStateAction<boolean>>] {
  return useAtom(isDirtyAtom);
}
