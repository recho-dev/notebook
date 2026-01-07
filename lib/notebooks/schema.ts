import Type from "typebox";

const TimestampSchema = Type.Union([Type.Number(), Type.Decode(Type.String(), (value) => new Date(value).getTime())]);

/**
 * A schema for loading data from localStorage.
 */
export const NotebookSchema = Type.Object({
  id: Type.String(),
  title: Type.String(),
  created: TimestampSchema,
  updated: TimestampSchema,

  // For backward compatibility with old notebooks, we make `snapshots` and
  // `content` optional.
  //
  // 1. If only `content` presents, we create a new snapshot with the content
  //    and add the snapshot id to `snapshots`.
  // 2. If only `snapshots` presents, we do nothing.
  // 3. If both `snapshots` and `content` presents, which should not happen,
  //    we add `content` to the first snapshot and name it "stale snapshot".
  // 4. If none of them present, we initialize `snapshots` with an array
  //    containing a single snapshot with default content.
  //
  // The first item of `snapshots` is the latest version.
  snapshots: Type.Optional(Type.Array(Type.String())),
  content: Type.Optional(Type.String()),

  autoRun: Type.Boolean(),
  runtime: Type.String(),
});

export const NotebooksSchema = Type.Array(NotebookSchema);

export const SnapshotSchema = Type.Object({
  id: Type.String(),
  name: Type.Union([Type.Null(), Type.String()]),
  content: Type.String(),
  created: Type.Number(),
});

export type Snapshot = Type.Static<typeof SnapshotSchema>;

/**
 * This is the high-level representation of a notebook. Under the hood, we store
 * snapshot content in a separate storage keyed by `content_${snapshotId}`.
 */
export type Notebook = {
  id: string;
  title: string;
  created: number;
  updated: number;
  snapshots: Snapshot[];
  autoRun: boolean;
  runtime: string;
};
