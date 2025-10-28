import {StateField, StateEffect, Transaction} from "@codemirror/state";
import {syntaxTree} from "@codemirror/language";
import {OUTPUT_MARK, ERROR_MARK} from "../runtime/constant.js";
import {EditorState} from "@codemirror/state";

const OUTPUT_MARK_CODE_POINT = OUTPUT_MARK.codePointAt(0);
const ERROR_MARK_CODE_POINT = ERROR_MARK.codePointAt(0);

type Range = {from: number; to: number};

export function BlockMetadata(output: Range | null, source: Range, attributes: Record<string, unknown> = {}) {
  return {
    output,
    source,
    get from() {
      return this.output?.from ?? this.source.from;
    },
    get to() {
      return this.source.to;
    },
    attributes,
    error: false,
  };
}

/**
 * Detect blocks in a given range by traversing the syntax tree.
 * Similar to how runtime/index.js uses acorn to parse blocks, but adapted for CodeMirror.
 */
function rebuiltBlocksWithinRange(state: EditorState, from: number, to: number): BlockMetadata[] {
  const blocks: BlockMetadata[] = [];

  // Collect all top-level statements and their preceding output/error comment lines
  const statementRanges: Range[] = [];
  const outputRanges = new Map<number, Range>(); // Map statement position to output range

  syntaxTree(state).iterate({
    from,
    to,
    enter: (node) => {
      // Detect top-level statements (direct children of Script)
      if (node.node.parent?.name === "Script") {
        // Check if this is a statement (not a comment)
        const isStatement =
          node.name.includes("Statement") ||
          node.name.includes("Declaration") ||
          node.name === "ExportDeclaration" ||
          node.name === "ImportDeclaration" ||
          node.name === "Block";

        if (isStatement) {
          statementRanges.push({from: node.from, to: node.to});
        }
      }

      // Detect output/error comment lines (top-level line comments)
      if (node.name === "LineComment" && node.node.parent?.name === "Script") {
        const line = state.doc.lineAt(node.from);
        // Check if the line comment covers the entire line
        if (line.from === node.from && line.to === node.to) {
          const codePoint = line.text.codePointAt(2);
          if (codePoint === OUTPUT_MARK_CODE_POINT || codePoint === ERROR_MARK_CODE_POINT) {
            // Find consecutive output/error lines
            let outputStart = line.from;
            let outputEnd = line.to;

            // Look backwards for more output/error lines
            let currentLineNum = line.number - 1;
            while (currentLineNum >= 1) {
              const prevLine = state.doc.line(currentLineNum);
              const prevCodePoint = prevLine.text.codePointAt(2);
              if (
                prevLine.text.startsWith("//") &&
                (prevCodePoint === OUTPUT_MARK_CODE_POINT || prevCodePoint === ERROR_MARK_CODE_POINT)
              ) {
                outputStart = prevLine.from;
                currentLineNum--;
              } else {
                break;
              }
            }

            // Look forwards for more output/error lines
            currentLineNum = line.number + 1;
            const totalLines = state.doc.lines;
            while (currentLineNum <= totalLines) {
              const nextLine = state.doc.line(currentLineNum);
              const nextCodePoint = nextLine.text.codePointAt(2);
              if (
                nextLine.text.startsWith("//") &&
                (nextCodePoint === OUTPUT_MARK_CODE_POINT || nextCodePoint === ERROR_MARK_CODE_POINT)
              ) {
                outputEnd = nextLine.to;
                currentLineNum++;
              } else {
                break;
              }
            }

            // Find the next statement after these output lines
            // The output belongs to the statement immediately following it
            let nextStatementLine = currentLineNum;
            if (nextStatementLine <= totalLines) {
              const nextStmtLine = state.doc.line(nextStatementLine);
              // Store this output range to be associated with the next statement
              outputRanges.set(nextStmtLine.from, {from: outputStart, to: outputEnd});
            }
          }
        }
      }
    },
  });

  // Build block metadata from statements
  for (const range of statementRanges) {
    blocks.push(BlockMetadata(outputRanges.get(range.from) ?? null, range));
  }

  return blocks;
}

function updateBlocks(blocks: BlockMetadata[], tr: Transaction): void {
  console.group("updateBlocks");

  console.log("Original blocks:", structuredClone(blocks));

  /**
   * Find the block that contains the given position. If such block does not
   * exist, return the nearest block that is right before or after the given
   * position. When no blocks are before and after the given position, return
   * `null`.
   * @param pos the position we want to find
   * @param side `-1` - lower bound, `1` - upper bound
   */
  function findNearestBlock(pos: number, side: -1 | 1): number | null {
    let left = 0;
    let right = blocks.length;

    console.log(`pos = ${pos}, side = ${side}`);

    loop: while (left < right) {
      console.log(`Search range [${left}, ${right})`);
      const middle = (left + right) >>> 1;
      const pivot = blocks[middle];

      const from = pivot.output?.from ?? pivot.source.from;
      const to = pivot.source.to;
      console.log(`Pivot: ${middle} (from = ${from}, to = ${to})`);

      done: {
        if (pos < from) {
          console.log("Should go left");
          // Go left and search range [left, middle + 1)
          if (middle === left) {
            // We cannot move left anymore.
            break done;
          } else {
            right = middle;
            continue loop;
          }
        } else if (to <= pos) {
          console.log("Should go right");
          // Go right and search range [middle, right)
          if (middle === left) {
            // We cannot move right anymore.
            break done;
          } else {
            left = middle;
            continue loop;
          }
        } else {
          return middle;
        }
      }
      if (side < 0) {
        return left;
      } else {
        return left === 0 ? null : left - 1;
      }
    }

    return null;
  }

  // Collect all ranges that need to be rescanned
  type ChangedRange = {oldFrom: number; oldTo: number; newFrom: number; newTo: number};
  const changedRanges: ChangedRange[] = [];
  tr.changes.iterChangedRanges((oldFrom, oldTo, newFrom, newTo) => {
    changedRanges.push({oldFrom, oldTo, newFrom, newTo});
  });

  if (changedRanges.length === 0) {
    console.log("No changes detected");
    console.groupEnd();
    return;
  }

  const affectedBlocks = new Set<BlockMetadata>();

  // Process changed ranges one by one, because ranges are disjoint.
  for (const {oldFrom, oldTo, newFrom, newTo} of changedRanges) {
    console.groupCollapsed(`Range ${oldFrom}-${oldTo} -> ${newFrom}-${newTo}`);

    // Step 1: Find the blocks that are affected by the change.

    const leftmost = findNearestBlock(oldFrom, -1);
    const rightmost = findNearestBlock(oldTo, 1);

    console.log(`Affected block range: ${leftmost}-${rightmost}`);

    if (leftmost === null || rightmost === null || leftmost > rightmost) {
      // No blocks are affected by this change, so we can skip it.
      console.groupEnd();
      continue;
    }

    // Step 2: Rebuild affected blocks.

    if (leftmost === rightmost) {
      // The change affects only one block. We special case this scenario since
      // we can possibly reuse the existing block attributes if the changed
      // content is still a single block.
      const block = blocks[leftmost];

      const newBlockFrom = tr.changes.mapPos(block.from, -1);
      const newBlockTo = tr.changes.mapPos(block.to, 1);

      console.log(`Only one block is affected. Rebuilting from ${block.from} to ${block.to}...`);
      const rebuiltBlocks = rebuiltBlocksWithinRange(tr.state, newBlockFrom, newBlockTo);

      console.log(`Rebuilt blocks:`, rebuiltBlocks);

      if (rebuiltBlocks.length === 1) {
        const newBlock = rebuiltBlocks[0];
        newBlock.attributes = block.attributes;
        affectedBlocks.add(newBlock);
        blocks[leftmost] = newBlock;
      } else {
        blocks.splice(leftmost, 1, ...rebuiltBlocks);
      }
      affectedBlocks.add(block);
    } else {
      // Multiple blocks are affected.
      const rebuiltBlocks = rebuiltBlocksWithinRange(tr.state, newFrom, newTo);
      rebuiltBlocks.forEach((block) => affectedBlocks.add(block));
      blocks.splice(leftmost, rightmost - leftmost + 1, ...rebuiltBlocks);
    }

    console.groupEnd();
  }

  // Step 3: Map the unaffected blocks to new positions;
  for (let i = 0, n = blocks.length; i < n; i++) {
    const block = blocks[i];
    // Skip affected blocks as they have been updated.
    if (affectedBlocks.has(block)) continue;

    // Map unaffected blocks to new positions
    block.output = block.output
      ? {
          from: tr.changes.mapPos(block.output.from, -1),
          to: tr.changes.mapPos(block.output.to, 1),
        }
      : null;
    block.source = {
      from: tr.changes.mapPos(block.source.from, -1),
      to: tr.changes.mapPos(block.source.to, 1),
    };
  }

  console.log("Updated blocks:", blocks);

  console.groupEnd();
}

export const blockMetadataEffect = StateEffect.define<BlockMetadata[]>();

export type BlockMetadata = {
  output: Range | null;
  source: Range;
  readonly from: number;
  readonly to: number;
  attributes: Record<string, unknown>;
  error: boolean;
};

export const blockMetadataField = StateField.define<BlockMetadata[]>({
  create() {
    return [];
  },
  update(blocks, tr) {
    // Find if the block attributes effect is present.
    let blocksFromEffect: BlockMetadata[] | null = null;
    for (const effect of tr.effects) {
      if (effect.is(blockMetadataEffect)) {
        blocksFromEffect = effect.value;
        break;
      }
    }

    if (blocksFromEffect === null) {
      // If the block attributes effect is not present, then this transaction
      // is made by the user, we need to update the block attributes accroding
      // to the latest syntax tree.
      updateBlocks(blocks, tr);
      return blocks;
    } else {
      // Otherwise, we need to update the block attributes according to the
      // metadata sent from the runtime. Most importantly, we need to translate
      // the position of each block after the changes has been made.
      console.group("Updating blocks from the effect");
      for (const block of blocksFromEffect) {
        if (block.output === null) {
          const from = tr.changes.mapPos(block.source.from, -1);
          const to = tr.changes.mapPos(block.source.from, 1);
          block.output = {from, to: to - 1};
        } else {
          const from = tr.changes.mapPos(block.output.from, -1);
          const to = tr.changes.mapPos(block.output.to, 1);
          block.output = {from, to: to - 1};
        }
        block.source = {
          from: tr.changes.mapPos(block.source.from, 1),
          to: tr.changes.mapPos(block.source.to, 1),
        };
        console.log(`output: ${block.output?.from} - ${block.output?.to}`);
        console.log(`source: ${block.source.from} - ${block.source.to}`);
      }
      console.groupEnd();
      return blocksFromEffect;
    }
  },
});

export const blockMetadataExtension = blockMetadataField.extension;
