import {BlockMetadata} from "./BlockMetadata.js";

export interface Interval {
  from: number;
  to: number;
}

type Block = BlockMetadata;

interface IntervalWithIndex extends Interval {
  index: number;
}

interface MergeGroup {
  indices: number[];
  from: number;
  to: number;
}

/**
 * Detects overlapping blocks and returns groups of indices that should be merged.
 *
 * @param blocks Array of blocks to check for overlaps
 * @returns Array of merge groups, where each group contains indices of overlapping blocks
 */
export function detectOverlappingBlocks(blocks: Block[]): MergeGroup[] {
  if (blocks.length === 0) return [];

  // Create a sorted array of block intervals with their indices
  const intervals: IntervalWithIndex[] = blocks.map((block, index) => ({
    from: block.from,
    to: block.to,
    index,
  }));

  // Sort by start position, then by end position
  intervals.sort((a, b) => {
    if (a.from !== b.from) return a.from - b.from;
    return a.to - b.to;
  });

  // Track which blocks overlap
  const overlappingIndices = new Set<number>();

  // Simple sweep line algorithm to detect overlaps
  for (let i = 0; i < intervals.length - 1; i++) {
    const current = intervals[i]!;
    const next = intervals[i + 1]!;

    // If next block starts before or at the end of current block, they overlap
    if (next.from < current.to) {
      overlappingIndices.add(current.index);
      overlappingIndices.add(next.index);
    }
  }

  if (overlappingIndices.size === 0) {
    return [];
  }

  // Group consecutive overlapping blocks
  const sortedOverlapping = Array.from(overlappingIndices).sort((a, b) => a - b);
  const mergeGroups: MergeGroup[] = [];
  let currentGroup: number[] = [];

  for (const idx of sortedOverlapping) {
    if (currentGroup.length === 0) {
      currentGroup.push(idx);
    } else {
      const lastIdx = currentGroup[currentGroup.length - 1]!;
      const lastBlock = blocks[lastIdx]!;
      const currentBlock = blocks[idx]!;

      // Check if blocks overlap
      if (currentBlock.from <= lastBlock.to) {
        currentGroup.push(idx);
      } else {
        // Finalize current group
        const groupFrom = Math.min(...currentGroup.map((i) => blocks[i]!.from));
        const groupTo = Math.max(...currentGroup.map((i) => blocks[i]!.to));
        mergeGroups.push({indices: currentGroup, from: groupFrom, to: groupTo});
        currentGroup = [idx];
      }
    }
  }

  // Don't forget the last group
  if (currentGroup.length > 0) {
    const groupFrom = Math.min(...currentGroup.map((i) => blocks[i]!.from));
    const groupTo = Math.max(...currentGroup.map((i) => blocks[i]!.to));
    mergeGroups.push({indices: currentGroup, from: groupFrom, to: groupTo});
  }

  return mergeGroups;
}

/**
 * Merges overlapping blocks in place.
 *
 * @param blocks Array of blocks to merge (will be modified in place)
 */
export function mergeOverlappingBlocks(blocks: Block[]): void {
  const mergeGroups = detectOverlappingBlocks(blocks);

  console.log("Merge groups:", mergeGroups);
  mergeGroups.forEach((group) => {
    group.indices.forEach((index) => {
      const block = blocks[index]!;
      console.log(block);
    });
  });

  if (mergeGroups.length === 0) return;

  console.log(`Found ${mergeGroups.length} groups of overlapping blocks to merge`);

  // Process groups in reverse order to avoid index shifting issues when removing
  for (const group of mergeGroups.reverse()) {
    if (group.indices.length < 2) continue;

    console.log(`Merging blocks at indices ${group.indices.join(", ")} into range ${group.from}-${group.to}`);

    // Find the block with the most complete information (prefer blocks with output)
    let primaryIdx = group.indices[0]!;
    let primaryBlock = blocks[primaryIdx]!;

    for (const idx of group.indices) {
      const block = blocks[idx]!;
      if (block.output && !primaryBlock.output) {
        primaryIdx = idx;
        primaryBlock = block;
      }
    }

    // Update the primary block's range to encompass all merged blocks
    if (primaryBlock.output) {
      const outputFrom = Math.min(
        primaryBlock.output.from,
        ...group.indices.map((idx) => blocks[idx]!.output?.from ?? Infinity),
      );
      const outputTo = Math.max(
        primaryBlock.output.to,
        ...group.indices.map((idx) => blocks[idx]!.output?.to ?? -Infinity),
      );
      primaryBlock.output = {from: outputFrom, to: outputTo};
    }

    primaryBlock.source = {from: group.from, to: group.to};

    // Keep the primary block at the first index, remove all others
    const firstIdx = group.indices[0]!;
    blocks[firstIdx] = primaryBlock;

    // Remove other blocks (iterate backwards to avoid index shifting)
    for (let i = group.indices.length - 1; i > 0; i--) {
      blocks.splice(group.indices[i]!, 1);
    }
  }
}
