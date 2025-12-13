/**
 * Find the block where the given position is adjacent to. There are a few
 * possible cases.
 *
 * - If `pos` is inside a block, return the block directly.
 * - Otherwise, `pos` is not inside any block. We return the block before
 *   and the block after `pos`. If any one of them does not exist, return
 *   `null` instead.
 * @param blocks The array of blocks. The right boundary `to` is exclusive.
 * @param pos The position of the selection
 * @returns If `pos` is inside a block, return the block index. If `pos` is
 *   between two blocks, return the indices of the two blocks. Note that if
 *   `pos` is before the first block, return `[-1, 0]`. If `pos` is after
 *   the last block, return `[blocks.length - 1, blocks.length]`. Lastly, if
 *   `blocks` is empty, return `null`.
 */
export function findAdjacentBlocks(
  blocks: {from: number; to: number}[],
  pos: number,
): number | [number, number] | null {
  try {
    // console.groupCollapsed(`findAdjacentBlocks(${pos})`);

    // We maintain a binary search range [left, right). Note that the right
    // boundary is exclusive, i.e., the range is empty when `left === right`.
    let left = 0;
    let right = blocks.length;
    let DEBUG_hasEnteredLoop = false;

    // When the range is non-empty.
    loop: while (left < right) {
      DEBUG_hasEnteredLoop = true;

      const middle = (left + right) >>> 1;
      const pivot = blocks[middle]!;

      if (pos < pivot.from) {
        // We should move to the left sub-range [left, middle).
        if (left === middle) {
          return [middle - 1, middle];
        } else {
          right = middle;
          continue loop;
        }
      } else if (pivot.to <= pos) {
        // We should move to the right sub-range [middle, right).
        if (left === middle) {
          return [middle, middle + 1];
        } else {
          left = middle;
        }
      } else {
        // Good news: `pos` is inside `pivot`.
        return middle;
      }
    }

    // We can only reach here if we haven't enter the loop.
    // console.assert(!DEBUG_hasEnteredLoop, "Did not return in the loop.");

    return null;
  } finally {
    // console.groupEnd();
  }
}

export type BlockRange = [from: number | null, to: number | null];

export function blockRangeLength(blockCount: number, [from, to]: BlockRange): number {
  if (from === null) {
    if (to === null) {
      return blockCount;
    } else {
      return to;
    }
  } else {
    if (to === null) {
      return blockCount - from;
    } else {
      return to - from;
    }
  }
}

/**
 * If there is only one block in the range, return its index. Otherwise, return
 * `null`.
 *
 * @param blockCount the number of blocks
 * @param param1 the range of blocks
 * @returns the range of the block
 */
export function getOnlyOneBlock(blockCount: number, [from, to]: BlockRange): number | null {
  if (from === null) {
    if (to === null) {
      return null;
    } else {
      return to === 1 ? 0 : null;
    }
  } else {
    if (to === null) {
      return blockCount - from === 1 ? from : null;
    } else {
      return to - from === 1 ? from : null;
    }
  }
}

/**
 * Finds the range of affected blocks in an array of disjoint and sorted blocks.
 * The ranges of blocks whose indices within the returned range should be
 * overlapping with range [from, to). The indices of blocks whose ranges are
 * overlapping with range [from, to) should be returned.
 *
 * Note that the returned range does not represent the relationship between the
 * edited area and the blocks. An edit may affect nearby blocks even if those
 * blocks are not directly modified. For example, adding a plus `+` between two
 * function calls would merge the two blocks into a new expression.
 *
 * @param blocks The array of blocks. Blocks are disjoint and sorted.
 * @param from The starting index of the edited range.
 * @param to The ending index (exclusive) of the edited range.
 * @returns The range of affected blocks. The
 */
export function findAffectedBlockRange(
  blocks: {from: number; to: number}[],
  from: number,
  to: number,
): [from: number | null, to: number | null] {
  if (from > to) {
    throw new RangeError("`from` must be less than or equal to `to`");
  }

  if (from < 0) {
    throw new RangeError("`from` must be greater than or equal to 0");
  }

  const fromResult = findAdjacentBlocks(blocks, from);

  // In insertion transactions, `from` and `to` are identical because they do
  // not delete any characters from the document.
  if (from === to) {
    if (typeof fromResult === "number") {
      // This means that the insertion point is in a block, thus only the block
      // is affected. We return [index, index + 1).
      return [fromResult, fromResult + 1];
    } else if (fromResult === null) {
      // There is no block at all. We should re-parse the entire document.
      return [null, null];
    } else {
      // The insertion point is between blocks. We should include two blocks.
      const [blockIndexBefore, blockIndexAfter] = fromResult;
      return [
        // `null` means we should the caller should use the beginning of the document.
        blockIndexBefore === -1 ? null : blockIndexBefore,
        blockIndexAfter === blocks.length ? null : blockIndexAfter + 1,
      ];
    }
  }

  // Otherwise, the transaction deletes characters from the document.
  // Note that we use `to - 1` because we want to locate the last character.
  // Using `to` is wrong because it would locate the first character of the next block.
  const toResult = findAdjacentBlocks(blocks, to - 1);

  // This means that we are deleting from non-block region.
  if (fromResult === null || toResult === null) {
    // If there is no block at all, then both of them should be `null`.
    if (fromResult !== toResult) {
      throw new RangeError("`from` and `to` should be located to nowhere at the same time", {
        cause: {ranges: blocks.map((block) => ({from: block.from, to: block.to})), from, to},
      });
    }
    return [null, null];
  }

  if (typeof fromResult === "number") {
    if (typeof toResult === "number") {
      return [fromResult, toResult === blocks.length ? null : toResult + 1];
    } else {
      const blockIndexAfterTo = toResult[1];
      return [fromResult, blockIndexAfterTo === blocks.length ? null : blockIndexAfterTo + 1];
    }
  } else {
    const blockIndexBeforeFrom = fromResult[0];
    const rangeFrom = blockIndexBeforeFrom === -1 ? null : blockIndexBeforeFrom;
    if (typeof toResult === "number") {
      return [rangeFrom, toResult === blocks.length ? null : toResult + 1];
    } else {
      const blockIndexAfterTo = toResult[1];
      return [rangeFrom, blockIndexAfterTo === blocks.length ? null : blockIndexAfterTo + 1];
    }
  }
}
