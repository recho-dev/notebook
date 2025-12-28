import {Transaction} from "@codemirror/state";
import {blockRangeLength, findAffectedBlockRange, getOnlyOneBlock} from "../../lib/blocks.ts";
import {detectBlocksWithinRange} from "../../lib/blocks/detect.ts";
import {syntaxTree} from "@codemirror/language";
import {MaxHeap} from "../../lib/containers/heap.ts";
import {BlockMetadata} from "./BlockMetadata.ts";
import {deduplicateNaive} from "./deduplicate.ts";

/**
 * Update block metadata according to the given transaction.
 *
 * @param oldBlocks the current blocks
 * @param tr the editor transaction
 */
export function updateBlocks(oldBlocks: BlockMetadata[], tr: Transaction): BlockMetadata[] {
  // If the transaction does not change the document, then we return early.
  if (!tr.docChanged) return oldBlocks;

  const userEvent = tr.annotation(Transaction.userEvent);
  if (userEvent) {
    console.group(`updateBlocks (${userEvent})`);
  } else {
    console.groupCollapsed(`updateBlocks`);
  }

  const isCopyingLines = userEvent === "input.copyline";

  if (tr.changes.empty) {
    console.log("No changes detected");
    console.groupEnd();
    return oldBlocks;
  }

  /**
   * Keep track of all blocks that are affected by the change. They will not be
   * added to the array of new blocks.
   */
  const affectedBlocks = new Set<BlockMetadata>();

  const newlyCreatedBlocks = new MaxHeap<BlockMetadata>(
    (block) => block.from,
    (a, b) => b - a,
  );

  // Process changed ranges one by one, because ranges are disjoint.
  tr.changes.iterChanges((oldFrom, oldTo, newFrom, newTo, inserted) => {
    if (oldFrom === oldTo) {
      if (newFrom === oldFrom) {
        console.groupCollapsed(`Insert ${newTo - newFrom} characters at ${oldFrom}`);
      } else {
        console.groupCollapsed(`Insert ${newTo - newFrom} characters: ${oldFrom} -> ${newFrom}-${newTo}`);
      }
    } else {
      console.groupCollapsed(`Update: ${oldFrom}-${oldTo} -> ${newFrom}-${newTo}`);
    }

    let changeFrom = oldFrom;
    let changeTo = oldTo;
    if (isCopyingLines) {
      if (oldFrom === oldTo) {
        const index = oldFrom; // The insertion point, should be either at the beginning or the end of the line.
        const line = tr.startState.doc.lineAt(index);
        if (index === line.from) {
          changeFrom = changeTo = index + inserted.length;
        } else if (index === line.to) {
          // changeFrom = changeTo = index - inserted.length;
          changeFrom = changeTo = index;
        } else {
          console.error("This is weird as the insertion point is not at the beginning or the end of the line");
        }
      } else {
        console.error("This is weird as the cursor is not at the same position");
      }
    }

    // Step 1: Find the blocks that are affected by the change.

    const affectedBlockRange = findAffectedBlockRange(oldBlocks, changeFrom, changeTo);

    console.log(`Affected block range: ${affectedBlockRange[0]} to ${affectedBlockRange[1] ?? "the end"}`);

    // Add the affected blocks to the set.
    for (let i = affectedBlockRange[0] ?? 0, n = affectedBlockRange[1] ?? oldBlocks.length; i < n; i++) {
      affectedBlocks.add(oldBlocks[i]!);
    }

    // Check a corner case where the affected block range is empty but there are blocks.
    if (blockRangeLength(oldBlocks.length, affectedBlockRange) === 0 && oldBlocks.length > 0) {
      console.error("This should never happen");
    }

    // Now, we are going to compute the range which should be re-parsed.
    const reparseFrom = affectedBlockRange[0] === null ? 0 : oldBlocks[affectedBlockRange[0]]!.from;
    const reparseTo = affectedBlockRange[1] === null ? tr.state.doc.length : oldBlocks[affectedBlockRange[1] - 1]!.to;
    const newBlocks = detectBlocksWithinRange(syntaxTree(tr.state), tr.state.doc, reparseFrom, reparseTo);

    console.log("New blocks from reparsed range:", newBlocks);

    // If only one block is affected and only one new block is created, we can
    // simply inherit the attributes from the old block.
    const soleBlockIndex = getOnlyOneBlock(oldBlocks.length, affectedBlockRange);
    if (typeof soleBlockIndex === "number" && newBlocks.length === 1) {
      newBlocks[0]!.attributes = oldBlocks[soleBlockIndex]!.attributes;
    }

    // Add new blocks to the heap, which sorts blocks by their `from` position.
    for (let i = 0, n = newBlocks.length; i < n; i++) {
      newlyCreatedBlocks.insert(newBlocks[i]!);
    }

    console.groupEnd();
  });

  // Step 3: Combine the array of old blocks and the heap of new blocks.

  const newBlocks: BlockMetadata[] = [];

  console.group("Combining old blocks and new blocks");

  for (let i = 0, n = oldBlocks.length; i < n; i++) {
    const oldBlock = oldBlocks[i]!;

    // Skip affected blocks, as they have been updated.
    if (affectedBlocks.has(oldBlock)) {
      console.log("Skipping affected old block:", oldBlock);
      continue;
    }

    const newBlock = oldBlock.map(tr);

    // Peek the heap. Check the positional relationship between its foremost
    // block and the current old block.

    while (newlyCreatedBlocks.nonEmpty() && newlyCreatedBlocks.peek.from < newBlock.from) {
      newBlocks.push(newlyCreatedBlocks.peek);
      console.log("Pushing new block from heap:", newlyCreatedBlocks.peek);
      newlyCreatedBlocks.extractMax();
    }

    // At this point, the heap is either empty or the foremost block is after
    // the current old block's `from` position.

    newBlocks.push(newBlock);
    console.log("Pushing mapped old block:", newBlock);
  }

  console.groupEnd();

  // In the end, push any remaining blocks from the heap.
  while (newlyCreatedBlocks.nonEmpty()) {
    newBlocks.push(newlyCreatedBlocks.peek);
    newlyCreatedBlocks.extractMax();
  }

  console.log("New blocks:", newBlocks);

  const deduplicatedBlocks = deduplicateNaive(newBlocks);

  console.log("Deduplicated blocks:", deduplicatedBlocks);

  console.groupEnd();
  return deduplicatedBlocks;
}
