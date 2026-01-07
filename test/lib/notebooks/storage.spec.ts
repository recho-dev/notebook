import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";
import {generate} from "short-uuid";
import {loadNotebooksFromStorage, saveNotebooksToStorage} from "../../../lib/notebooks/storage.ts";
import {createSnapshot, DEFAULT_CONTENT, RECHO_FILES_KEY, snapshotKey} from "../../../lib/notebooks/utils.ts";
import type {Notebook, Snapshot} from "../../../lib/notebooks/schema.ts";

const generatedIds = ["gen-1", "gen-2", "gen-3", "gen-4", "gen-5", "gen-6", "gen-7", "gen-8", "gen-9", "gen-10"];
let idIndex = 0;

vi.mock("short-uuid", () => ({
  generate: vi.fn(() => generatedIds[idIndex++] ?? `gen-${idIndex + 1}`),
}));

function persistSnapshot(snapshot: Snapshot) {
  localStorage.setItem(snapshotKey(snapshot.id), JSON.stringify(snapshot));
}

function makeSnapshot(content: string, name: string | null = null, created?: number): Snapshot {
  const snapshot = createSnapshot(content, name);
  if (created !== undefined) snapshot.created = created;
  persistSnapshot(snapshot);
  return snapshot;
}

beforeEach(() => {
  idIndex = 0;
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("loadNotebooksFromStorage", () => {
  it("creates a snapshot when only content is present", () => {
    const notebookId = generate();
    const raw = [
      {
        id: notebookId,
        title: "Only Content",
        created: 1,
        updated: 2,
        content: "hello world",
        autoRun: false,
        runtime: "js",
      },
    ];
    localStorage.setItem(RECHO_FILES_KEY, JSON.stringify(raw));

    const [notebook] = loadNotebooksFromStorage();

    expect(notebook.title).toBe("Only Content");
    expect(notebook.snapshots).toHaveLength(1);
    const [snapshot] = notebook.snapshots;
    expect(snapshot.content).toBe("hello world");
    expect(JSON.parse(localStorage.getItem(snapshotKey(snapshot.id))!)).toMatchObject({
      id: snapshot.id,
      content: "hello world",
    });
  });

  it("loads snapshots when only snapshot ids are present and keeps ordering rules", () => {
    const latest = makeSnapshot("latest content", null, 500);
    const olderA = makeSnapshot("older a", null, 100);
    const olderB = makeSnapshot("older b", "older b", 300);
    const notebookId = generate();

    const raw = [
      {
        id: notebookId,
        title: "Snapshots Only",
        created: 10,
        updated: 11,
        snapshots: [latest.id, olderA.id, olderB.id],
        autoRun: true,
        runtime: "py",
      },
    ];
    localStorage.setItem(RECHO_FILES_KEY, JSON.stringify(raw));

    const [notebook] = loadNotebooksFromStorage();

    expect(notebook.snapshots.map((s) => s.id)).toEqual([latest.id, olderB.id, olderA.id]);
    expect(notebook.snapshots[1]?.name).toBe("older b");
  });

  it("prepends a new snapshot when both content and snapshots are present", () => {
    const existing = makeSnapshot("old", null, 123);
    const notebookId = generate();

    const raw = [
      {
        id: notebookId,
        title: "Mixed",
        created: 20,
        updated: 21,
        content: "new content",
        snapshots: [existing.id],
        autoRun: false,
        runtime: "js",
      },
    ];
    localStorage.setItem(RECHO_FILES_KEY, JSON.stringify(raw));

    const [notebook] = loadNotebooksFromStorage();

    expect(notebook.snapshots).toHaveLength(2);
    expect(notebook.snapshots[0]?.content).toBe("new content");
    expect(notebook.snapshots[1]?.id).toBe(existing.id);
    expect(JSON.parse(localStorage.getItem(snapshotKey(notebook.snapshots[0]!.id))!)).toMatchObject({
      content: "new content",
    });
  });

  it("initializes a default snapshot when neither content nor snapshots are present", () => {
    const notebookId = generate();
    const raw = [
      {
        id: notebookId,
        title: "Empty",
        created: 30,
        updated: 31,
        autoRun: true,
        runtime: "js",
      },
    ];
    localStorage.setItem(RECHO_FILES_KEY, JSON.stringify(raw));

    const [notebook] = loadNotebooksFromStorage();

    expect(notebook.snapshots).toHaveLength(1);
    expect(notebook.snapshots[0]?.content).toBe(DEFAULT_CONTENT);
  });
});

describe("saveNotebooksToStorage", () => {
  it("serializes notebooks to JSON and saves snapshot contents", () => {
    const notebooks: Notebook[] = [
      {
        id: generate(),
        title: "Save 1",
        created: 1,
        updated: 2,
        autoRun: false,
        runtime: "js",
        snapshots: [makeSnapshot("content-1", "first", 1), makeSnapshot("content-2", null, 2)],
      },
      {
        id: generate(),
        title: "Save 2",
        created: 3,
        updated: 4,
        autoRun: true,
        runtime: "py",
        snapshots: [makeSnapshot("content-3", null, 3)],
      },
      {
        id: generate(),
        title: "Save 3",
        created: 3,
        updated: 7,
        autoRun: true,
        runtime: "py",
        snapshots: [makeSnapshot("content-3", null, 3)],
      },
    ];

    saveNotebooksToStorage(notebooks, []);

    const storedRaw = localStorage.getItem(RECHO_FILES_KEY);
    expect(storedRaw).not.toBeNull();

    const parsed = JSON.parse(storedRaw!);
    const notebooksWithSnapshotIds = notebooks.map(({snapshots, ...rest}) => ({
      ...rest,
      snapshots: snapshots.map((s) => s.id),
    }));
    expect(parsed).toEqual(notebooksWithSnapshotIds);

    const snapshots = notebooks.flatMap((n) => n.snapshots);

    for (const snapshot of snapshots) {
      expect(JSON.parse(localStorage.getItem(snapshotKey(snapshot.id))!)).toMatchObject({
        content: snapshot.content,
      });
    }
  });
});
