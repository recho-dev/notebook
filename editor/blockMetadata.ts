import {StateField, StateEffect, Transaction} from "@codemirror/state";
import {syntaxTree} from "@codemirror/language";
import {OUTPUT_MARK, ERROR_MARK} from "../runtime/constant.js";
import {EditorState} from "@codemirror/state";
import {mergeOverlappingBlocks} from "./deduplication.js";

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
function detectBlockWithinRange(state: EditorState, from: number, to: number): BlockMetadata[] {
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
        if (
          node.name.includes("Statement") ||
          node.name.includes("Declaration") ||
          node.name === "ExportDeclaration" ||
          node.name === "ImportDeclaration" ||
          node.name === "Block"
        ) {
          // Note: The range here is right-exclusive.
          console.log(`Found "${node.name}" spans from ${node.from} to ${node.to}`);
          statementRanges.push({from: node.from, to: node.to});

          let outputRange: Range | null = null;
          let currentNode = node.node.prevSibling;

          console.log(`Previous node: ${currentNode}`);
          while (currentNode?.name === "LineComment") {
            const line = state.doc.lineAt(currentNode.from);
            if (line.from === currentNode.from && line.to === currentNode.to) {
              const codePoint = line.text.codePointAt(2);
              if (codePoint === OUTPUT_MARK_CODE_POINT || codePoint === ERROR_MARK_CODE_POINT) {
                outputRange =
                  outputRange === null ? {from: line.from, to: line.to} : {from: line.from, to: outputRange.to};
              }
            }
            currentNode = currentNode.prevSibling;
          }
          console.log(`Output Range:`, outputRange);
          if (outputRange !== null) {
            outputRanges.set(node.from, outputRange);
          }
        }
        // Detect output/error comment lines (top-level line comments)
        else if (node.name === "LineComment") {
          // Get the line containing the comment.
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
      }
    },
  });

  // Build block metadata from statements
  for (const range of statementRanges) {
    blocks.push(BlockMetadata(outputRanges.get(range.from) ?? null, range));
  }

  return blocks;
}

/**
 * Update block metadata according to the given transaction.
 *
 * @param blocks the current blocks
 * @param tr the editor transaction
 */
function updateBlocks(blocks: BlockMetadata[], tr: Transaction): void {
  // If the transaction does not change the document, then we return early.
  if (!tr.docChanged) return;

  const userEvent = tr.annotation(Transaction.userEvent);
  if (userEvent) {
    console.group(`updateBlocks (${userEvent})`);
  } else {
    console.groupCollapsed(`updateBlocks`);
  }

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

    console.groupCollapsed(`findNearestBlock(${pos}, ${side})`);

    try {
      loop: while (left < right) {
        console.log(`Search range [${left}, ${right})`);
        const middle = (left + right) >>> 1;
        const pivot = blocks[middle]!;

        const from = pivot.output?.from ?? pivot.source.from;
        const to = pivot.source.to;
        console.log(`Pivot: ${middle} (from = ${from}, to = ${to})`);

        done: {
          if (pos < from) {
            console.log(`Should go left as ${pos} < ${from}`);
            // Go left and search range [left, middle + 1)
            if (middle === left) {
              // We cannot move left anymore.
              break done;
            } else {
              right = middle;
              continue loop;
            }
          } else if (to < pos) {
            console.log(`Should go right as ${to} < ${pos}`);
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

        // After the binary search, the `left` represents the index of the first
        // block that is before the given position.
        console.log(`Final range: [${left}, ${right})`);
        console.log(`Final pivot: ${middle} (from = ${from}, to = ${to})`);
        if (side < 0) {
          // If we are looking for the block before `pos`, then just return it.
          return left;
        } else {
          // Otherwise, return the block after `pos`, if it exists.
          return left + 1 < blocks.length ? left + 1 : null;
        }
      }

      return null;
    } finally {
      console.groupEnd();
    }
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

    if (leftmost === null || rightmost === null) {
      // No blocks are affected by this change. But we might have to introduce
      // new blocks within the new range.
      const newBlocks = detectBlockWithinRange(tr.state, newFrom, newTo);
      newBlocks.forEach((block) => affectedBlocks.add(block));

      // However, in some cases, the newly introduced blocks might overlap with
      // existing blocks. Here I illustrate with an example.
      // - First, we type `let x`, and it will add a block for `let x`.
      // - Then, we continue typing ` `. The space is not a part of `let x`
      //   because `let x` is a complete block.
      // - Next, we type `=`. The input triggers `detectBlockWithinRange`, which
      //   recognizes `let x =` as a new block.
      // In this example, if we just add `let x =` to the `blocks` array, there
      // would be two overlapping blocks `let x` and `let x =`.

      if (rightmost === null) {
        blocks.push(...newBlocks);
      } else {
        blocks.unshift(...newBlocks);
      }

      console.groupEnd();
      continue;
    }

    // This should never happen.
    if (leftmost > rightmost) {
      throw new RangeError(`Invalid block range: ${leftmost}-${rightmost}`);
    }

    // Step 2: Rebuild affected blocks.

    if (leftmost === rightmost) {
      // The change affects only one block and the `pos` must be in the block.
      // This means that the user is editing the block.
      //
      // We special case this scenario since we can possibly reuse the existing
      // block attributes if the changed content is still a single block.
      const block = blocks[leftmost]!;

      const newBlockFrom = tr.changes.mapPos(block.from, -1);
      const newBlockTo = tr.changes.mapPos(block.to, 1);

      console.log(`Only one block is affected. Rebuilting from ${block.from} to ${block.to}...`);
      const rebuiltBlocks = detectBlockWithinRange(tr.state, newBlockFrom, newBlockTo);

      console.log(`Rebuilt blocks:`, structuredClone(rebuiltBlocks));

      // If only one block is rebuilt, we can reuse the existing attributes.
      if (rebuiltBlocks.length === 1) {
        const newBlock = rebuiltBlocks[0]!;
        newBlock.attributes = block.attributes;
        affectedBlocks.add(newBlock);
        blocks[leftmost] = newBlock;
      }
      // Otherwise, we have to insert the rebuilt blocks.
      else {
        blocks.splice(leftmost, 1, ...rebuiltBlocks);
      }
      rebuiltBlocks.forEach((block) => affectedBlocks.add(block));
    } else {
      console.log(`Multiple blocks from ${leftmost} to ${rightmost} are affected`);

      // Otherwise, multiple blocks are affected.
      const rebuiltBlocks = detectBlockWithinRange(tr.state, newFrom, newTo);

      const leftmostBlock = blocks[leftmost]!;
      const rightmostBlock = blocks[rightmost]!;

      console.log(`touchesLeftmost: ${oldFrom < leftmostBlock.to}`);
      console.log(`touchesRightmost: ${rightmostBlock.from < oldTo}`);

      rebuiltBlocks.forEach((block) => affectedBlocks.add(block));

      // If the range touches the rightmost block, then we need to delete one more block.
      const deleteCount = rightmost - leftmost + (rightmostBlock.from <= oldTo ? 1 : 0);
      console.log(`deleteCount: ${deleteCount}`);

      // If the range does not touch the leftmost block, we need to delete one
      // less block and adjust the `start` parameter.
      if (oldFrom <= leftmostBlock.to) {
        blocks.splice(leftmost, deleteCount, ...rebuiltBlocks);
      } else {
        blocks.splice(leftmost + 1, deleteCount - 1, ...rebuiltBlocks);
      }
    }

    console.groupEnd();
  }

  // Step 3: Map the unaffected blocks to new positions;
  for (let i = 0, n = blocks.length; i < n; i++) {
    const block = blocks[i]!;
    // Skip affected blocks as they have been updated.
    if (affectedBlocks.has(block)) continue;

    console.log(`Processing unaffected block at ${i}`);

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

  console.log("Updated blocks:", structuredClone(blocks));

  // Lastly, we will merge blocks. We have elaborated on why there might exist
  // overlapping blocks. Here, we employs a segment tree.

  mergeOverlappingBlocks(blocks);

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
