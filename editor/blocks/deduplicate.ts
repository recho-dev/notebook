import type {BlockMetadata} from "./BlockMetadata.ts";

export function deduplicateNaive(blocks: BlockMetadata[]): BlockMetadata[] {
  const newBlocks: BlockMetadata[] = [];
  let last: BlockMetadata | null = null;

  for (let i = 0, n = blocks.length; i < n; i++) {
    const block = blocks[i]!;
    if (last === null || last.to <= block.from) {
      newBlocks.push((last = block));
    } else if (last.from === block.from && last.to === block.to) {
      // The block is a duplicate of the last block, so we skip it.
      continue;
    } else if (last.source.from === block.source.from && last.source.to === block.source.to) {
      // The block is a duplicate of the last block, but doesn't have an output.
      // We can also skip it.
      continue;
    } else {
      console.error("Found a weird overlap.");
      console.log("newBlocks", newBlocks.slice());
      console.log("i", i);
      console.log("last", last);
      console.log("block", block);
    }
  }

  return newBlocks;
}
