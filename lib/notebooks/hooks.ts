"use client";

import {useAtom, useAtomValue} from "jotai";
import {useCallback, useEffect, useMemo, useRef, useState, type Dispatch} from "react";
import {isDirtyAtom, notebooksAtom} from "./atom.ts";
import {updateNotebook} from "./operations.ts";
import type {Notebook, Snapshot} from "./schema.ts";
import {createNotebook, createSnapshot, DEFAULT_CONTENT} from "./utils.ts";
import {generate} from "short-uuid";

export type UseNotebookResult = {
  /**
   * The current notebook. It is `null` only if the notebook is not found.
   */
  notebook: Readonly<Notebook> | null;

  /**
   * Whether the notebook is a draft.
   */
  isDraft: boolean;

  /**
   * Whether the buffer has been modified since the last saved.
   */
  isDirty: boolean;

  /**
   * The initial content of the notebook. It is only changed when the notebook
   * is created or loaded from the storage.
   *
   * Please initialize the editor using this content.
   */
  initialContent: string;

  /**
   * Save the notebook to the persistent storage. If the notebook is a draft,
   * it will be added to the storage.
   */
  saveNotebook: () => void;

  /**
   * Update the content of the notebook. If the notebook is a draft, it only
   * updates the draft but does not save it to the storage.
   *
   * @param content The new content of the notebook.
   */
  updateContent: (content: string) => void;

  /**
   * Update the title of the notebook. If the notebook is a draft, it only
   * updates the draft but does not save it to the storage.
   *
   * @param title The new title of the notebook.
   */
  updateTitle: (title: string) => void;

  /**
   * Create a new snapshot for the notebook.
   *
   * The function does nothing when the notebook is a draft because drafts do
   * not have snapshots.
   *
   * If the notebook is not saved, this function first saves the notebook before
   * creating a new snapshot.
   *
   * @param name The name of the snapshot.
   */
  createSnapshot: (name: string | null) => Snapshot;

  /**
   * Forcibly set the content of the notebook to the given content. It also
   * creates a new snapshot if the content is dirty.
   *
   * @param content The content to restore.
   */
  restoreContent: (content: string) => void;
};

export function useLatestNotebooks(limit?: number): Notebook[] {
  const notebooks = useAtomValue(notebooksAtom);
  return useMemo(
    () => (typeof limit === "number" && Number.isInteger(limit) && limit > 0 ? notebooks.slice(0, limit) : notebooks),
    [notebooks, limit],
  );
}

export function useNotebooks(): [Notebook[], Dispatch<Notebook[]>] {
  const [notebooks, setNotebooks] = useAtom(notebooksAtom);
  return [notebooks, setNotebooks];
}

export function useNotebookTitle(id: string): [string, Dispatch<string>] {
  const [notebooks, setNotebooks] = useAtom(notebooksAtom);
  const notebook = notebooks.find((n) => n.id === id);
  return useMemo(() => {
    return [
      notebook?.title ?? "",
      (title: string) => {
        setNotebooks((oldNotebooks) => updateNotebook(oldNotebooks, id, {title}));
      },
    ];
  }, [id, notebook, setNotebooks]);
}

const notFoundResult: UseNotebookResult = Object.freeze({
  notebook: null,
  isDraft: false,
  isDirty: false,
  initialContent: "",
  saveNotebook: () => {},
  updateContent: () => {},
  updateTitle: () => {},
  createSnapshot: () => {
    throw new Error("`createSnapshot` is not available when the notebook is not found.");
  },
  restoreContent: () => {},
});

/**
 * The hook that fetches a notebook by its ID. The returned notebook is a stable
 * reference to the notebook and has only the latest snapshot.
 *
 * If the ID is not provided, the hook will return a draft notebook.
 *
 * @param id the notebook ID indicated in the URL
 */
export function useNotebook(id: string | undefined): UseNotebookResult {
  const [notebooks, setNotebooks] = useAtom(notebooksAtom);

  // The ID of the notebook that we are actually editing.
  // - If the URL contains an ID, this is set to the ID.
  // - If the URL does not contain an ID, this is set to `undefined`, which
  //   means that we are editing a draft notebook.
  // - When the draft notebook is saved, this is set to the ID of the notebook.
  // - When the user creates a new notebook, this is set to `undefined` again.
  const [actualId, setActualId] = useState<string | undefined>(id);

  // The notebook found by the ID.
  const foundNotebook = typeof actualId === "string" ? notebooks.find((n) => n.id === actualId) : undefined;

  // The draft notebook state.
  const [draftNotebook, setDraftNotebook] = useState<Notebook>(createNotebook);

  const lastSavedTimestamp = (foundNotebook?.snapshots[0] ?? draftNotebook).created;

  // Keep the content of the latest snapshot in a reference to avoid re-renders.
  const contentRef = useRef<string>(foundNotebook?.snapshots[0].content ?? DEFAULT_CONTENT);
  // Initialize the last edit timestamp to the last saved timestamp.
  const lastEditTimestampRef = useRef<number>(lastSavedTimestamp);

  const [isDirty, setIsDirty] = useAtom(isDirtyAtom);

  const [initialContent, setInitialContent] = useState<string>(foundNotebook?.snapshots[0].content ?? DEFAULT_CONTENT);

  const updateContent = useCallback(
    (content: string) => {
      contentRef.current = content;
      lastEditTimestampRef.current = Date.now();
      setIsDirty(true);
    },
    [setIsDirty],
  );

  // When we receive the `renew-notebook` event, we need to create a new draft.
  useEffect(() => {
    const onRenewNotebook = (e: Event) => {
      e.stopPropagation();
      setIsDirty(false);
      setActualId(undefined);
      setDraftNotebook(createNotebook());
    };
    window.addEventListener("renew-notebook", onRenewNotebook);
    return () => window.removeEventListener("renew-notebook", onRenewNotebook);
  }, [setIsDirty]);

  return useMemo(() => {
    if (foundNotebook === undefined) {
      if (typeof actualId === "string") {
        return notFoundResult;
      } else {
        return {
          notebook: draftNotebook,
          isDraft: true,
          isDirty,
          initialContent,
          saveNotebook: () => {
            const snapshots = [createSnapshot(contentRef.current)];
            setNotebooks((oldNotebooks) => [{...draftNotebook, snapshots}, ...oldNotebooks]);
            setDraftNotebook(createNotebook());
            setActualId(draftNotebook.id);
            setIsDirty(false);
          },
          updateContent,
          updateTitle: (title: string) => {
            setDraftNotebook({...draftNotebook, title});
          },
          createSnapshot: () => {
            throw new Error("`createSnapshot` is not supported for an unsaved notebook.");
          },
          restoreContent: () => {
            console.warn("`restoreContent` is not supported for an unsaved notebook.");
          },
        };
      }
    } else {
      const [head, ...tail] = foundNotebook.snapshots;
      return {
        notebook: foundNotebook,
        isDraft: false,
        isDirty,
        initialContent,
        saveNotebook: () => {
          setNotebooks((oldNotebooks) => {
            return oldNotebooks.map((n) => {
              if (n.id === foundNotebook.id) {
                const snapshot: Snapshot = {
                  ...head,
                  content: contentRef.current,
                  created: lastEditTimestampRef.current,
                };
                return {...n, snapshots: [snapshot, ...tail]};
              } else {
                return n;
              }
            });
          });
          setIsDirty(false);
        },
        updateContent,
        updateTitle: (title: string) => {
          setNotebooks((oldNotebooks) => {
            return oldNotebooks.map((n) => {
              if (n.id === foundNotebook.id) {
                return {...n, title};
              } else {
                return n;
              }
            });
          });
        },
        createSnapshot: (name: string | null): Snapshot => {
          const snapshots = [...tail];
          const snapshot = createSnapshot(contentRef.current, name, lastEditTimestampRef.current);
          // Prepend the new snapshot to the array.
          snapshots.unshift(snapshot);
          // Then, prepend a copy of the snapshot because the first snapshot is
          // the latest version.
          snapshots.unshift({...snapshot, id: generate()});
          // Update the notebook in the storage.
          setNotebooks((oldNotebooks) => updateNotebook(oldNotebooks, foundNotebook.id, {snapshots}));
          setIsDirty(false);
          // Lastly, there is no need to call `setInitialContent` because the
          // content is already the latest snapshot.
          return snapshot;
        },
        restoreContent: (content) => {
          const snapshots = [...tail];
          if (isDirty) {
            snapshots.unshift(createSnapshot(contentRef.current, "Unsaved changes", lastEditTimestampRef.current));
          }
          snapshots.unshift(createSnapshot(content));
          setInitialContent(content);
          setNotebooks((oldNotebooks) => updateNotebook(oldNotebooks, foundNotebook.id, {snapshots}));
        },
      };
    }
  }, [actualId, isDirty, setIsDirty, draftNotebook, foundNotebook, setNotebooks, initialContent, updateContent]);
}

export type UseSnapshotsResult = {
  snapshots: Readonly<Snapshot>[];
  addSnapshot: (snapshot: Snapshot) => void;
  deleteSnapshot: (snapshotId: string) => void;
};

/**
 * The hook fetches the history snapshots of a notebook.
 *
 * @param id The notebook ID
 *
 * @returns The history snapshots of the notebook.
 */
export function useSnapshots(id: string): UseSnapshotsResult {
  const [notebooks, setNotebooks] = useAtom(notebooksAtom);
  return useMemo(() => {
    const notebook = notebooks.find((n) => n.id === id);
    if (notebook === undefined) {
      return {
        snapshots: [],
        addSnapshot: () => {},
        deleteSnapshot: () => {},
      };
    } else {
      return {
        snapshots: notebook.snapshots,
        addSnapshot: (snapshot: Snapshot) => {
          setNotebooks(notebooks.map((n) => (n.id === id ? {...n, snapshots: [snapshot, ...n.snapshots]} : n)));
        },
        deleteSnapshot: (snapshotId: string) => {
          setNotebooks(
            notebooks.map((n) => (n.id === id ? {...n, snapshots: n.snapshots.filter((s) => s.id !== snapshotId)} : n)),
          );
        },
      };
    }
  }, [id, notebooks, setNotebooks]);
}
