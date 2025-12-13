import {it, expect, describe} from "vitest";
import {findAffectedBlockRange} from "../../lib/blocks.js";

describe("findAffectedBlockRange", () => {
  function generateBlocks(blockCount: number) {
    const blocks = [];
    let currentPos = Math.floor(Math.random() * 5);

    for (let i = 0; i < blockCount; i++) {
      const width = Math.floor(Math.random() * 5) + 1;
      const gap = Math.floor(Math.random() * 5) + 1;
      blocks.push({from: currentPos, to: currentPos + width});
      currentPos += width + gap;
    }

    const maxPos = blocks.length > 0 ? blocks[blocks.length - 1]!.to : 0;

    return {blocks, maxPos};
  }

  describe("error cases", () => {
    it("should throw when from > to", () => {
      const blocks = [{from: 5, to: 10}];
      expect(() => findAffectedBlockRange(blocks, 10, 5)).toThrow("`from` must be less than or equal to `to`");
    });

    it("should throw when from < 0", () => {
      const blocks = [{from: 5, to: 10}];
      expect(() => findAffectedBlockRange(blocks, -1, 5)).toThrow("`from` must be greater than or equal to 0");
    });
  });

  describe("insertion cases (from === to)", () => {
    it("should return [index, index+1) when insertion point is inside a block", () => {
      const blocks = [
        {from: 5, to: 10},
        {from: 15, to: 20},
      ];

      // Insert at position 7 (inside first block)
      expect(findAffectedBlockRange(blocks, 7, 7)).toEqual([0, 1]);

      // Insert at position 17 (inside second block)
      expect(findAffectedBlockRange(blocks, 17, 17)).toEqual([1, 2]);
    });

    it("should return a range contains two blocks when insertion point is between two blocks", () => {
      const blocks = [
        {from: 5, to: 10},
        {from: 15, to: 20},
      ];

      // Insert at position 12 (between blocks)
      expect(findAffectedBlockRange(blocks, 12, 12)).toStrictEqual([0, 2]);

      // Insert at position 10 (right after first block)
      expect(findAffectedBlockRange(blocks, 10, 10)).toStrictEqual([0, 2]);

      // Insert at position 10 (right before first block)
      expect(findAffectedBlockRange(blocks, 14, 14)).toStrictEqual([0, 2]);
    });

    it("should return [null, 1] when insertion point is before all blocks", () => {
      const blocks = [{from: 5, to: 10}];
      expect(findAffectedBlockRange(blocks, 0, 0)).toStrictEqual([null, 1]);
      expect(findAffectedBlockRange(blocks, 3, 3)).toStrictEqual([null, 1]);
    });

    it("should return [N - 1, null] when insertion point is after all blocks", () => {
      const blocks = [
        {from: 5, to: 10},
        {from: 12, to: 15},
      ];
      const N = blocks.length;
      expect(findAffectedBlockRange(blocks, 15, 15)).toStrictEqual([1, null]);
      expect(findAffectedBlockRange(blocks, 16, 16)).toStrictEqual([1, null]);
    });

    it("should return [null, null] for empty blocks array", () => {
      const blocks: {from: number; to: number}[] = [];
      expect(findAffectedBlockRange(blocks, 5, 5)).toStrictEqual([null, null]);
    });

    it("should return two adjacent blocks when insertion point is between them", () => {
      const blocks = [
        {from: 2, to: 4},
        {from: 6, to: 11},
        {from: 16, to: 19},
        {from: 24, to: 25},
        {from: 27, to: 30},
      ];
      expect(findAffectedBlockRange(blocks, 4, 4)).toStrictEqual([0, 2]);
    });
  });

  describe("deletion cases (from < to)", () => {
    it("should handle range inside a single block", () => {
      const blocks = [
        {from: 5, to: 10},
        {from: 15, to: 20},
        {from: 25, to: 30},
      ];

      // Delete [6, 8) inside first block. We should only re-parse the block.
      expect(findAffectedBlockRange(blocks, 6, 8)).toEqual([0, 1]);

      // Delete [16, 19) inside second block. We should only re-parse the block.
      expect(findAffectedBlockRange(blocks, 16, 19)).toEqual([1, 2]);
    });

    it("should handle range spanning multiple blocks", () => {
      const blocks = [
        {from: 5, to: 10},
        {from: 15, to: 20},
        {from: 25, to: 30},
      ];

      // Delete [6, 18) spanning first two blocks
      expect(findAffectedBlockRange(blocks, 6, 18)).toEqual([0, 2]);

      // Delete [16, 28) spanning second and third blocks
      expect(findAffectedBlockRange(blocks, 16, 28)).toEqual([1, 3]);

      // Delete [6, 28) spanning all three blocks
      expect(findAffectedBlockRange(blocks, 6, 28)).toEqual([0, 3]);
    });

    it("should handle range from gap to inside block", () => {
      const blocks = [
        {from: 5, to: 10},
        {from: 15, to: 20},
      ];

      // Delete [12, 18) from gap into second block. The first block also needs
      // to be re-parsed.
      expect(findAffectedBlockRange(blocks, 12, 18)).toEqual([0, 2]);
    });

    it("should handle range from inside block to gap", () => {
      const blocks = [
        {from: 5, to: 10},
        {from: 15, to: 20},
      ];

      // Delete [7, 12) from first block into gap. The second block also needs
      // to be re-parsed because it might be affected by deletion. For example,
      // deleting the `//` part of a comment.
      expect(findAffectedBlockRange(blocks, 7, 12)).toEqual([0, 2]);
    });

    it("should handle range spanning gap between blocks", () => {
      const blocks = [
        {from: 5, to: 10},
        {from: 15, to: 20},
      ];

      // Delete [10, 15) exactly the gap. The deletion of the gap might affect
      // its surrounding blocks.
      expect(findAffectedBlockRange(blocks, 10, 15)).toEqual([0, 2]);
    });

    it("should return an empty range when range is entirely in a gap", () => {
      const blocks = [
        {from: 5, to: 10},
        {from: 20, to: 25},
      ];

      // Delete [12, 18) entirely in gap of 0 and 1. The deletion of the gap
      // might affect its surrounding blocks.
      expect(findAffectedBlockRange(blocks, 12, 18)).toStrictEqual([0, 2]);
    });

    it("should return null when range is before all blocks", () => {
      const blocks = [{from: 10, to: 15}];

      // The returned range means "from the beginning of the document to the
      // `to` of the first block".
      expect(findAffectedBlockRange(blocks, 0, 5)).toStrictEqual([null, 1]);
    });

    it("should return null when range is after all blocks", () => {
      const blocks = [{from: 5, to: 10}];

      // Similar to the previous test, but now the range is after all blocks.
      // The returned range means "from the beginning of the last block to the
      // end of the document".
      expect(findAffectedBlockRange(blocks, 15, 20)).toStrictEqual([0, null]);
    });

    it("should handle range starting at block boundary", () => {
      const blocks = [
        {from: 5, to: 10},
        {from: 15, to: 20},
      ];

      // Delete [5, 8) starting at block start. Only the first block is affected.
      expect(findAffectedBlockRange(blocks, 5, 8)).toEqual([0, 1]);

      // Delete [10, 18) starting at block end. The deletion happens within a
      // gap. Thus, the second block is also affected.
      expect(findAffectedBlockRange(blocks, 10, 18)).toEqual([0, 2]);
    });

    it("should handle range ending at block boundary", () => {
      const blocks = [
        {from: 5, to: 10},
        {from: 15, to: 20},
      ];

      // Delete [7, 10) ending at block end
      expect(findAffectedBlockRange(blocks, 7, 10)).toStrictEqual([0, 1]);

      // Delete [12, 15) ending at block start
      expect(findAffectedBlockRange(blocks, 12, 15)).toStrictEqual([0, 2]);
    });
  });

  function overlaps(m: {from: number; to: number}, n: {from: number; to: number}): boolean {
    return m.from <= n.to && n.from < m.to;
  }

  type Location =
    | {type: "contained"; index: number}
    | {
        type: "between";
        /**
         * Note that `previous` ranges from 0 to `blocks.length - 2`. Thus,
         * using `previous + 2` is safe.
         */
        previous: number;
      }
    | {type: "afterAll"}
    | {type: "beforeAll"};

  function locateNaive(blocks: {from: number; to: number}[], pos: number): Location {
    let location: Location | null = null;
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i]!;
      if (block.from <= pos && pos < block.to) {
        location = {type: "contained", index: i};
      }
    }
    if (location === null) {
      if (pos < blocks[0]!.from) {
        location = {type: "beforeAll"};
      } else {
        for (let i = 1; i < blocks.length; i++) {
          const previous = blocks[i - 1]!;
          const next = blocks[i]!;
          if (previous.to <= pos && pos < next.from) {
            location = {type: "between", previous: i - 1};
          }
        }
        if (location === null) {
          location = {type: "afterAll"};
        }
      }
    }
    return location;
  }

  describe("comprehensive random tests", () => {
    it("should verify invariants for all valid ranges", () => {
      for (let trial = 0; trial < 10; trial++) {
        const {blocks, maxPos} = generateBlocks(2 * trial);

        if (blocks.length === 0) continue;

        // Test all valid ranges [from, to) where from <= to
        for (let from = 0; from <= maxPos + 1; from++) {
          for (let to = from; to <= maxPos + 1; to++) {
            let fromLocation: Location = locateNaive(blocks, from);
            let expected: [number | null, number | null];
            if (from === to) {
              switch (fromLocation.type) {
                case "contained":
                  // Include the block it is contained in.
                  expected = [fromLocation.index, fromLocation.index + 1];
                  break;
                case "between":
                  // Include the adjacent blocks.
                  expected = [fromLocation.previous, fromLocation.previous + 2];
                  break;
                case "beforeAll":
                  // Extend to the beginning of the document (represented by
                  // `null`) and include the first element.
                  expected = [null, 1];
                  break;
                case "afterAll":
                  // Extend to the end of the document (represented by `null`)
                  // and include the last element.
                  expected = [blocks.length - 1, null];
                  break;
              }
            } else {
              let toLocation: Location = locateNaive(blocks, to - 1);
              let fromIndex: number | null;
              switch (fromLocation.type) {
                case "contained":
                  // Just include the block it is contained in.
                  fromIndex = fromLocation.index;
                  break;
                case "between":
                  // To include the previous block.
                  fromIndex = fromLocation.previous;
                  break;
                case "afterAll":
                  // To include the last element.
                  fromIndex = blocks.length - 1;
                  break;
                case "beforeAll":
                  // Extend to the beginning of the document (represented by `null`).
                  fromIndex = null;
                  break;
              }
              let toIndex: number | null;
              switch (toLocation.type) {
                case "contained":
                  // To include the block it is contained in. `+1` because the
                  // `to` is exclusive.
                  toIndex = toLocation.index + 1;
                  break;
                case "between":
                  // To include the block it is contained in. `+2` because the
                  // `to` is exclusive and it is the previous block's index.
                  toIndex = toLocation.previous + 2;
                  break;
                case "afterAll":
                  // Extend to the end of the document (represented by `null`).
                  toIndex = null;
                  break;
                case "beforeAll":
                  // Include the first block. `1` because the `to` is exclusive.
                  toIndex = 1;
                  break;
              }
              expected = [fromIndex, toIndex];
            }

            const result = findAffectedBlockRange(blocks, from, to);

            expect(
              result,
              `Expected affected block range to be [${expected[0]}, ${expected[1]}): (blocks = ${JSON.stringify(blocks)}, from = ${from}, to = ${to})`,
            ).toStrictEqual(expected);
          }
        }
      }
    });

    it("should handle edge cases with adjacent blocks", () => {
      const blocks = [
        {from: 0, to: 5},
        {from: 5, to: 10},
        {from: 10, to: 15},
      ];

      // Range exactly covering one block
      expect(findAffectedBlockRange(blocks, 0, 5)).toEqual([0, 1]);
      expect(findAffectedBlockRange(blocks, 5, 10)).toEqual([1, 2]);

      // Range covering multiple adjacent blocks
      expect(findAffectedBlockRange(blocks, 0, 10)).toEqual([0, 2]);
      expect(findAffectedBlockRange(blocks, 5, 15)).toEqual([1, 3]);
      expect(findAffectedBlockRange(blocks, 0, 15)).toEqual([0, 3]);

      // Single point at boundary
      expect(findAffectedBlockRange(blocks, 5, 5)).toEqual([1, 2]);
      expect(findAffectedBlockRange(blocks, 10, 10)).toEqual([2, 3]);
    });

    it("should handle single block edge cases", () => {
      const blocks = [{from: 10, to: 20}];

      // Range inside block
      expect(findAffectedBlockRange(blocks, 12, 15)).toEqual([0, 1]);

      // Range covering entire block
      expect(findAffectedBlockRange(blocks, 10, 20)).toEqual([0, 1]);

      // Range overlapping start
      expect(findAffectedBlockRange(blocks, 5, 15)).toEqual([null, 1]);

      // Range overlapping end
      expect(findAffectedBlockRange(blocks, 15, 25)).toEqual([0, null]);

      // Range covering block and beyond
      expect(findAffectedBlockRange(blocks, 5, 25)).toEqual([null, null]);

      // Range before block
      expect(findAffectedBlockRange(blocks, 0, 5)).toStrictEqual([null, 1]);

      // Range after block
      expect(findAffectedBlockRange(blocks, 25, 30)).toStrictEqual([0, null]);

      // Range touching start boundary
      expect(findAffectedBlockRange(blocks, 5, 10)).toStrictEqual([null, 1]);

      // Range touching end boundary
      expect(findAffectedBlockRange(blocks, 20, 25)).toStrictEqual([0, null]);
    });
  });
});
