import {describe, expect, it, vi, beforeEach, afterEach} from "vitest";
import {EditorState, Transaction, type ChangeSpec, type EditorStateConfig} from "@codemirror/state";
import {javascript} from "@codemirror/lang-javascript";
import {ensureSyntaxTree} from "@codemirror/language";
import {updateBlocks} from "../../editor/blocks/update.js";
import {detectBlocksWithinRange} from "../../lib/blocks/detect.js";
import {type BlockMetadata} from "../../editor/blocks/BlockMetadata.js";

const DOC = [
  `const a = 2;`,
  `const b = a ** 2;`,
  ``,
  `echo(add(a, b));`,
  ``,
  `function add(a, b) {`,
  `  return a + b;`,
  `}`,
].join("\n");

const DOC_WITH_OUTPUT = [
  `const a = 2;`,
  `const b = a ** 2;`,
  ``,
  `//➜ 6`,
  `echo(add(a, b));`,
  ``,
  `function add(a, b) {`,
  `  return a + b;`,
  `}`,
].join("\n");

function createState(doc: string): EditorState {
  const config: EditorStateConfig = {doc, extensions: [javascript()]};
  return EditorState.create(config);
}

/** Fully parse the state's document and detect all blocks in it. */
function detectAll(state: EditorState): BlockMetadata[] {
  const tree = ensureSyntaxTree(state, state.doc.length, 1e9);
  if (!tree) throw new Error("failed to parse the document");
  return detectBlocksWithinRange(tree, state.doc, 0, state.doc.length);
}

/** Simulate a user edit, with the syntax tree fully re-parsed afterwards. */
function edit(state: EditorState, changes: ChangeSpec, userEvent = "input.type"): Transaction {
  const tr = state.update({
    changes,
    annotations: Transaction.userEvent.of(userEvent),
  });
  ensureSyntaxTree(tr.state, tr.state.doc.length, 1e9);
  return tr;
}

/** Simulate typing `text` at `pos`, with the syntax tree fully re-parsed. */
function type(state: EditorState, pos: number, text: string): Transaction {
  return edit(state, {from: pos, to: pos, insert: text});
}

function expectSortedAndDisjoint(blocks: BlockMetadata[]) {
  for (let i = 1; i < blocks.length; i++) {
    expect(blocks[i]!.from).toBeGreaterThanOrEqual(blocks[i - 1]!.to);
  }
}

describe("updateBlocks", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Silence the debug logging and watch for invariant violations.
    vi.spyOn(console, "group").mockImplementation(() => {});
    vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
    vi.spyOn(console, "groupEnd").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps identity and attributes when typing inside a block", () => {
    const state = createState(DOC);
    const blocks = detectAll(state);
    expect(blocks.length).toBe(4);
    blocks[0]!.attributes = {compact: true};

    // Type an identifier character inside the first statement.
    const tr = type(state, 7, "x");
    const updated = updateBlocks(blocks, tr);

    expect(updated.length).toBe(4);
    expectSortedAndDisjoint(updated);
    // The edited block keeps its id and attributes...
    expect(updated[0]!.id).toBe(blocks[0]!.id);
    expect(updated[0]!.attributes).toEqual({compact: true});
    // ...and the untouched blocks survive as mapped instances.
    for (let i = 1; i < 4; i++) {
      expect(updated[i]!.id).toBe(blocks[i]!.id);
    }
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("supersedes downstream blocks when a statement swallows them", () => {
    const state = createState(DOC);
    const blocks = detectAll(state);
    expect(blocks.length).toBe(4);

    // An unterminated template literal inside the first statement makes it
    // swallow the rest of the document.
    const tr = type(state, 10, "`");
    const updated = updateBlocks(blocks, tr);

    // All old blocks collapse into the single detected mega block; none of
    // them may linger inside it.
    expect(updated.length).toBe(1);
    expect(updated[0]!.source.from).toBe(0);
    expect(updated[0]!.source.to).toBe(tr.state.doc.length);
    // The mega block inherits the identity of the old block it overlaps most
    // (the function declaration, the largest of the four).
    expect(updated[0]!.id).toBe(blocks[3]!.id);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("recovers all blocks when the swallow is undone", () => {
    const state = createState(DOC);
    const blocks = detectAll(state);

    const tr1 = type(state, 10, "`");
    const swallowed = updateBlocks(blocks, tr1);
    expect(swallowed.length).toBe(1);

    // Type the closing backtick after the `2`, turning the value into the
    // well-formed template literal `2`.
    const tr2 = type(tr1.state, 12, "`");
    const recovered = updateBlocks(swallowed, tr2);

    expect(recovered.length).toBe(4);
    expectSortedAndDisjoint(recovered);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("preserves both neighbors when typing in the gap between blocks", () => {
    const state = createState(DOC);
    const blocks = detectAll(state);

    // Insert a space at the start of the empty line between the second
    // statement and the echo call.
    const gap = state.doc.line(3).from;
    const tr = type(state, gap, " ");
    const updated = updateBlocks(blocks, tr);

    expect(updated.length).toBe(4);
    expectSortedAndDisjoint(updated);
    for (let i = 0; i < 4; i++) {
      expect(updated[i]!.id).toBe(blocks[i]!.id);
    }
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("keeps attributes on the surviving half of a split", () => {
    const state = createState(DOC);
    const blocks = detectAll(state);
    blocks[1]!.attributes = {typeface: "monospace"};

    // Split `const b = a ** 2;` by terminating it early: `const b = a; ** 2;`.
    const pos = state.doc.line(2).from + 11; // right after `const b = a`
    const tr = type(state, pos, ";");
    const updated = updateBlocks(blocks, tr);

    expectSortedAndDisjoint(updated);
    // The half that overlaps the old block the most keeps its identity.
    const inheritor = updated.find((block) => block.id === blocks[1]!.id);
    expect(inheritor).toBeDefined();
    expect(inheritor!.attributes).toEqual({typeface: "monospace"});
  });

  it("supersedes blocks swallowed by an unterminated block comment", () => {
    const state = createState(DOC);
    const blocks = detectAll(state);

    // `/*` at the end of the first statement swallows the rest of the
    // document — but into a comment, which produces no detected block.
    const tr = type(state, 12, "/*");
    const updated = updateBlocks(blocks, tr);

    // Only the first statement is still a block; the stale downstream blocks
    // must not linger inside the comment.
    const groundTruth = detectAll(tr.state);
    expect(updated.map((b) => ({...b.source}))).toEqual(groundTruth.map((b) => ({...b.source})));
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("merges two blocks when an operator joins them", () => {
    const state = createState(DOC);
    const blocks = detectAll(state);

    // `const b = a ** 2;` and `echo(add(a, b));` — remove the semicolon of
    // the former and put `+` in the gap so the two expressions fuse.
    const semi = state.doc.line(2).to - 1;
    const tr = edit(state, [
      {from: semi, to: semi + 1, insert: ""},
      {from: state.doc.line(3).from, to: state.doc.line(3).from, insert: "+"},
    ]);
    const updated = updateBlocks(blocks, tr);

    expectSortedAndDisjoint(updated);
    const groundTruth = detectAll(tr.state);
    expect(updated.map((b) => ({...b.source}))).toEqual(groundTruth.map((b) => ({...b.source})));
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("removes a block when its statement is deleted", () => {
    const state = createState(DOC);
    const blocks = detectAll(state);

    // Delete the whole second line including its newline.
    const line = state.doc.line(2);
    const tr = edit(state, {from: line.from, to: line.to + 1, insert: ""}, "delete.selection");
    const updated = updateBlocks(blocks, tr);

    expect(updated.length).toBe(3);
    expectSortedAndDisjoint(updated);
    expect(updated.map((b) => b.id)).toEqual([blocks[0]!.id, blocks[2]!.id, blocks[3]!.id]);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("handles a deletion spanning multiple blocks", () => {
    const state = createState(DOC);
    const blocks = detectAll(state);

    // Delete from inside the first statement to inside the echo call.
    const tr = edit(state, {from: 5, to: state.doc.line(4).from + 8, insert: ""}, "delete.selection");
    const updated = updateBlocks(blocks, tr);

    expectSortedAndDisjoint(updated);
    const groundTruth = detectAll(tr.state);
    expect(updated.map((b) => ({...b.source}))).toEqual(groundTruth.map((b) => ({...b.source})));
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("clears all blocks when the document is emptied", () => {
    const state = createState(DOC);
    const blocks = detectAll(state);

    const tr = edit(state, {from: 0, to: state.doc.length, insert: ""}, "delete.selection");
    const updated = updateBlocks(blocks, tr);

    expect(updated).toEqual([]);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("detects blocks typed into an empty document", () => {
    const state = createState("");
    const tr = type(state, 0, "const x = 1;");
    const updated = updateBlocks([], tr);

    expect(updated.length).toBe(1);
    expect(updated[0]!.source).toEqual({from: 0, to: 12});
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("creates fresh blocks for statements pasted into a gap", () => {
    const state = createState(DOC);
    const blocks = detectAll(state);

    // Paste two statements into the blank line between blocks 2 and 3.
    const gap = state.doc.line(3).from;
    const tr = edit(state, {from: gap, to: gap, insert: "let p = 1;\nlet q = 2;\n"}, "input.paste");
    const updated = updateBlocks(blocks, tr);

    expect(updated.length).toBe(6);
    expectSortedAndDisjoint(updated);
    const groundTruth = detectAll(tr.state);
    expect(updated.map((b) => ({...b.source}))).toEqual(groundTruth.map((b) => ({...b.source})));
    // All four original blocks keep their ids.
    for (const old of blocks) {
      expect(updated.some((b) => b.id === old.id)).toBe(true);
    }
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("applies a multi-cursor transaction with two separate insertions", () => {
    const state = createState(DOC);
    const blocks = detectAll(state);

    // Insert an identifier character inside block 1 and inside block 4.
    const tr = edit(state, [
      {from: 7, to: 7, insert: "x"},
      {from: state.doc.line(7).from + 12, to: state.doc.line(7).from + 12, insert: "y"},
    ]);
    const updated = updateBlocks(blocks, tr);

    expect(updated.length).toBe(4);
    expectSortedAndDisjoint(updated);
    const groundTruth = detectAll(tr.state);
    expect(updated.map((b) => ({...b.source}))).toEqual(groundTruth.map((b) => ({...b.source})));
    // Both edited blocks keep their ids.
    for (let i = 0; i < 4; i++) {
      expect(updated[i]!.id).toBe(blocks[i]!.id);
    }
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("clears the error flag when the source changes, but keeps it on untouched blocks", () => {
    const state = createState(DOC);
    const blocks = detectAll(state);
    blocks[0]!.error = true;
    blocks[3]!.error = true;

    const tr = type(state, 7, "x"); // edit inside block 1 only
    const updated = updateBlocks(blocks, tr);

    expect(updated[0]!.error).toBe(false);
    expect(updated[3]!.error).toBe(true);
  });

  it("keeps the original block's identity on copyLineUp", () => {
    const state = createState(DOC);
    const blocks = detectAll(state);
    blocks[0]!.attributes = {compact: true};

    // copyLineUp inserts the line's text above it: the copy occupies the old
    // position and the original shifts down.
    const line = state.doc.line(1);
    const tr = edit(state, {from: line.from, to: line.from, insert: line.text + "\n"}, "input.copyline");
    const updated = updateBlocks(blocks, tr);

    expect(updated.length).toBe(5);
    expectSortedAndDisjoint(updated);
    const groundTruth = detectAll(tr.state);
    expect(updated.map((b) => ({...b.source}))).toEqual(groundTruth.map((b) => ({...b.source})));
    // The original (now on line 2) keeps its id and attributes; the copy
    // (line 1) is a fresh block.
    expect(updated[1]!.id).toBe(blocks[0]!.id);
    expect(updated[1]!.attributes).toEqual({compact: true});
    expect(updated[0]!.id).not.toBe(blocks[0]!.id);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("keeps the original block's identity on copyLineDown", () => {
    const state = createState(DOC);
    const blocks = detectAll(state);

    // copyLineDown inserts a newline plus the line's text at the line end.
    const line = state.doc.line(1);
    const tr = edit(state, {from: line.to, to: line.to, insert: "\n" + line.text}, "input.copyline");
    const updated = updateBlocks(blocks, tr);

    expect(updated.length).toBe(5);
    expectSortedAndDisjoint(updated);
    // The original (still on line 1) keeps its id; the copy is fresh.
    expect(updated[0]!.id).toBe(blocks[0]!.id);
    expect(updated[1]!.id).not.toBe(blocks[0]!.id);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("keeps a block's output range attached while typing in its source", () => {
    const state = createState(DOC_WITH_OUTPUT);
    const blocks = detectAll(state);
    const echoBlock = blocks[2]!;
    expect(echoBlock.output).not.toBeNull();

    // Type inside the echo call (the block's source region).
    const tr = type(state, state.doc.line(5).from + 9, "1");
    const updated = updateBlocks(blocks, tr);

    expect(updated.length).toBe(4);
    expect(updated[2]!.id).toBe(echoBlock.id);
    expect(updated[2]!.output).toEqual(echoBlock.output);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("detaches the output range when its mark is destroyed", () => {
    const state = createState(DOC_WITH_OUTPUT);
    const blocks = detectAll(state);

    // Break the `//➜ 6` mark by typing inside the `//`.
    const tr = type(state, state.doc.line(4).from + 1, "x");
    const updated = updateBlocks(blocks, tr);

    expectSortedAndDisjoint(updated);
    const groundTruth = detectAll(tr.state);
    expect(updated.map((b) => ({...b.source}))).toEqual(groundTruth.map((b) => ({...b.source})));
    expect(updated.map((b) => ({...b.output}))).toEqual(groundTruth.map((b) => ({...b.output})));
    expect(errorSpy).not.toHaveBeenCalled();
  });
});

describe("updateBlocks fuzzing", () => {
  beforeEach(() => {
    vi.spyOn(console, "group").mockImplementation(() => {});
    vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
    vi.spyOn(console, "groupEnd").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function mulberry32(seed: number) {
    return () => {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const ALPHABET = `abz01 ;,.+-*/(){}[]"'\`=\n`;

  function fuzz(seed: number, steps: number) {
    const rand = mulberry32(seed);
    let state = createState(DOC_WITH_OUTPUT);
    let blocks = detectAll(state);

    for (let step = 0; step < steps; step++) {
      const docLength = state.doc.length;
      let changes: ChangeSpec;
      let description: string;

      if (rand() < 0.65 || docLength < 8) {
        // Insert 1–2 random characters at a random position.
        const pos = Math.floor(rand() * (docLength + 1));
        let text = ALPHABET[Math.floor(rand() * ALPHABET.length)]!;
        if (rand() < 0.3) text += ALPHABET[Math.floor(rand() * ALPHABET.length)]!;
        changes = {from: pos, to: pos, insert: text};
        description = `insert ${JSON.stringify(text)} at ${pos}`;
      } else {
        // Delete 1–4 characters at a random position.
        const from = Math.floor(rand() * docLength);
        const to = Math.min(docLength, from + 1 + Math.floor(rand() * 4));
        changes = {from, to, insert: ""};
        description = `delete ${from}-${to}`;
      }

      const tr = edit(state, changes);
      blocks = updateBlocks(blocks, tr);
      state = tr.state;

      const groundTruth = detectAll(state);
      const context = `seed ${seed}, step ${step}: ${description}, doc: ${JSON.stringify(state.doc.toString())}`;
      expect(
        blocks.map((b) => ({...b.source})),
        context,
      ).toEqual(groundTruth.map((b) => ({...b.source})));
      expect(
        blocks.map((b) => b.output && {...b.output}),
        context,
      ).toEqual(groundTruth.map((b) => b.output && {...b.output}));
    }
  }

  it("matches a full re-detect after every random edit (seed 1)", () => fuzz(1, 150));
  it("matches a full re-detect after every random edit (seed 2)", () => fuzz(2, 150));
  it("matches a full re-detect after every random edit (seed 3)", () => fuzz(3, 150));
  it("matches a full re-detect after every random edit (seed 4)", () => fuzz(4, 150));
});
