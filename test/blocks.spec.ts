import {it, expect, describe} from "vitest";
import {findAdjacentBlocks} from "../lib/blocks.js";

describe("findAdjacentBlocks", () => {
  describe("with sorted non-continuous ranges", () => {
    it("should handle comprehensive test with all possible positions", () => {
      // Generate sorted but non-continuous ranges
      // For example: [2, 5), [7, 10), [15, 18), [20, 23)
      const blocks = [
        {from: 2, to: 5},
        {from: 7, to: 10},
        {from: 15, to: 18},
        {from: 20, to: 23},
      ];

      const maxPos = blocks[blocks.length - 1]!.to;

      // Test every position from 0 to maxPos + 1
      for (let pos = 0; pos <= maxPos + 1; pos++) {
        const result = findAdjacentBlocks(blocks, pos);

        // Determine expected result
        let expectedResult;

        // Check if pos is inside any block
        const blockIndex = blocks.findIndex((block) => pos >= block.from && pos < block.to);

        if (blockIndex !== -1) {
          // pos is inside a block
          expectedResult = blockIndex;
        } else {
          // pos is not inside any block, find adjacent blocks
          let beforeBlock = null;
          let afterBlock = null;

          for (let i = 0; i < blocks.length; i++) {
            if (blocks[i]!.to <= pos) {
              beforeBlock = i;
            }
          }
          for (let i = blocks.length - 1; i >= 0; i--) {
            if (blocks[i]!.from > pos) {
              afterBlock = i;
            }
          }

          if (beforeBlock === null) {
            if (afterBlock === null) {
              expectedResult = null;
            } else {
              expectedResult = [afterBlock - 1, afterBlock];
            }
          } else if (afterBlock === null) {
            expectedResult = [beforeBlock, beforeBlock + 1];
          } else {
            expectedResult = [beforeBlock, afterBlock];
          }
        }

        expect(result).toEqual(expectedResult);
      }
    });

    it("should handle position 0 before first block [2, 5)", () => {
      const blocks = [{from: 2, to: 5}];
      expect(findAdjacentBlocks(blocks, 0)).toEqual([-1, 0]);
    });

    it("should handle position 1 before first block [2, 5)", () => {
      const blocks = [{from: 2, to: 5}];
      expect(findAdjacentBlocks(blocks, 1)).toEqual([-1, 0]);
    });

    it("should handle position 2 at start of block [2, 5)", () => {
      const blocks = [{from: 2, to: 5}];
      expect(findAdjacentBlocks(blocks, 2)).toBe(0);
    });

    it("should handle position 3 inside block [2, 5)", () => {
      const blocks = [{from: 2, to: 5}];
      expect(findAdjacentBlocks(blocks, 3)).toBe(0);
    });

    it("should handle position 4 at end-1 of block [2, 5)", () => {
      const blocks = [{from: 2, to: 5}];
      expect(findAdjacentBlocks(blocks, 4)).toBe(0);
    });

    it("should handle position 5 after block [2, 5)", () => {
      const blocks = [{from: 2, to: 5}];
      expect(findAdjacentBlocks(blocks, 5)).toEqual([0, 1]);
    });

    it("should handle position 6 after block [2, 5)", () => {
      const blocks = [{from: 2, to: 5}];
      expect(findAdjacentBlocks(blocks, 6)).toEqual([0, 1]);
    });

    it("should handle gap between two blocks", () => {
      const blocks = [
        {from: 2, to: 5},
        {from: 7, to: 10},
      ];
      expect(findAdjacentBlocks(blocks, 5)).toEqual([0, 1]);
      expect(findAdjacentBlocks(blocks, 6)).toEqual([0, 1]);
    });

    it("should handle position inside second block", () => {
      const blocks = [
        {from: 2, to: 5},
        {from: 7, to: 10},
      ];
      expect(findAdjacentBlocks(blocks, 7)).toBe(1);
      expect(findAdjacentBlocks(blocks, 8)).toBe(1);
      expect(findAdjacentBlocks(blocks, 9)).toBe(1);
    });

    it("should handle position after all blocks", () => {
      const blocks = [
        {from: 2, to: 5},
        {from: 7, to: 10},
      ];
      expect(findAdjacentBlocks(blocks, 10)).toEqual([1, 2]);
      expect(findAdjacentBlocks(blocks, 100)).toEqual([1, 2]);
    });

    it("should handle multiple blocks with various positions", () => {
      const blocks = [
        {from: 5, to: 10},
        {from: 15, to: 20},
        {from: 25, to: 30},
      ];

      // Before all blocks
      expect(findAdjacentBlocks(blocks, 0)).toEqual([-1, 0]);
      expect(findAdjacentBlocks(blocks, 4)).toEqual([-1, 0]);

      // Inside first block
      expect(findAdjacentBlocks(blocks, 5)).toBe(0);
      expect(findAdjacentBlocks(blocks, 7)).toBe(0);
      expect(findAdjacentBlocks(blocks, 9)).toBe(0);

      // Between first and second block
      expect(findAdjacentBlocks(blocks, 10)).toEqual([0, 1]);
      expect(findAdjacentBlocks(blocks, 12)).toEqual([0, 1]);
      expect(findAdjacentBlocks(blocks, 14)).toEqual([0, 1]);

      // Inside second block
      expect(findAdjacentBlocks(blocks, 15)).toBe(1);
      expect(findAdjacentBlocks(blocks, 17)).toBe(1);
      expect(findAdjacentBlocks(blocks, 19)).toBe(1);

      // Between second and third block
      expect(findAdjacentBlocks(blocks, 20)).toEqual([1, 2]);
      expect(findAdjacentBlocks(blocks, 22)).toEqual([1, 2]);
      expect(findAdjacentBlocks(blocks, 24)).toEqual([1, 2]);

      // Inside third block
      expect(findAdjacentBlocks(blocks, 25)).toBe(2);
      expect(findAdjacentBlocks(blocks, 27)).toBe(2);
      expect(findAdjacentBlocks(blocks, 29)).toBe(2);

      // After all blocks
      expect(findAdjacentBlocks(blocks, 30)).toEqual([2, 3]);
      expect(findAdjacentBlocks(blocks, 50)).toEqual([2, 3]);
    });
  });

  describe("edge cases", () => {
    it("should handle empty blocks array", () => {
      const blocks: [] = [];
      expect(findAdjacentBlocks(blocks, 0)).toEqual(null);
      expect(findAdjacentBlocks(blocks, 5)).toEqual(null);
      expect(findAdjacentBlocks(blocks, 100)).toEqual(null);
    });

    it("should handle single block", () => {
      const blocks = [{from: 10, to: 20}];

      expect(findAdjacentBlocks(blocks, 0)).toEqual([-1, 0]);
      expect(findAdjacentBlocks(blocks, 9)).toEqual([-1, 0]);
      expect(findAdjacentBlocks(blocks, 10)).toBe(0);
      expect(findAdjacentBlocks(blocks, 15)).toBe(0);
      expect(findAdjacentBlocks(blocks, 19)).toBe(0);
      expect(findAdjacentBlocks(blocks, 20)).toEqual([0, 1]);
      expect(findAdjacentBlocks(blocks, 25)).toEqual([0, 1]);
    });

    it("should handle adjacent blocks (no gap)", () => {
      const blocks = [
        {from: 0, to: 5},
        {from: 5, to: 10},
      ];

      expect(findAdjacentBlocks(blocks, 4)).toBe(0);
      expect(findAdjacentBlocks(blocks, 5)).toBe(1);
      expect(findAdjacentBlocks(blocks, 6)).toBe(1);
    });

    it("should handle blocks starting at 0", () => {
      const blocks = [
        {from: 0, to: 3},
        {from: 5, to: 8},
      ];

      expect(findAdjacentBlocks(blocks, 0)).toBe(0);
      expect(findAdjacentBlocks(blocks, 1)).toBe(0);
      expect(findAdjacentBlocks(blocks, 2)).toBe(0);
      expect(findAdjacentBlocks(blocks, 3)).toEqual([0, 1]);
      expect(findAdjacentBlocks(blocks, 4)).toEqual([0, 1]);
      expect(findAdjacentBlocks(blocks, 5)).toBe(1);
    });

    it("should handle single-width blocks", () => {
      const blocks = [
        {from: 0, to: 1},
        {from: 3, to: 4},
        {from: 6, to: 7},
      ];

      expect(findAdjacentBlocks(blocks, 0)).toBe(0);
      expect(findAdjacentBlocks(blocks, 1)).toEqual([0, 1]);
      expect(findAdjacentBlocks(blocks, 2)).toEqual([0, 1]);
      expect(findAdjacentBlocks(blocks, 3)).toBe(1);
      expect(findAdjacentBlocks(blocks, 4)).toEqual([1, 2]);
      expect(findAdjacentBlocks(blocks, 5)).toEqual([1, 2]);
      expect(findAdjacentBlocks(blocks, 6)).toBe(2);
      expect(findAdjacentBlocks(blocks, 7)).toEqual([2, 3]);
    });

    it("should handle large gaps between blocks", () => {
      const blocks = [
        {from: 0, to: 5},
        {from: 100, to: 105},
        {from: 1000, to: 1005},
      ];

      expect(findAdjacentBlocks(blocks, 50)).toEqual([0, 1]);
      expect(findAdjacentBlocks(blocks, 99)).toEqual([0, 1]);
      expect(findAdjacentBlocks(blocks, 100)).toBe(1);
      expect(findAdjacentBlocks(blocks, 500)).toEqual([1, 2]);
      expect(findAdjacentBlocks(blocks, 999)).toEqual([1, 2]);
      expect(findAdjacentBlocks(blocks, 1000)).toBe(2);
      expect(findAdjacentBlocks(blocks, 2000)).toEqual([2, 3]);
    });
  });

  function generateBlocks(blockCount: number) {
    const blocks = [];
    let currentPos = Math.floor(Math.random() * 5);

    for (let i = 0; i < blockCount; i++) {
      const width = Math.floor(Math.random() * 5) + 1;
      const gap = Math.floor(Math.random() * 5) + 1;
      blocks.push({from: currentPos, to: currentPos + width});
      currentPos += width + gap;
    }

    const maxPos = blocks[blocks.length - 1]!.to;

    return {blocks, maxPos};
  }

  describe("randomized comprehensive tests", () => {
    it("should handle random sorted non-continuous ranges", () => {
      for (let z = 0; z < 10; z++) {
        const {blocks, maxPos} = generateBlocks(2 ** z);

        // Test every position from 0 to maxPos + 1
        for (let pos = 0; pos <= maxPos + 1; pos++) {
          const result = findAdjacentBlocks(blocks, pos);

          // Verify the result is correct
          const blockIndex = blocks.findIndex((block) => pos >= block.from && pos < block.to);

          if (blockIndex !== -1) {
            expect(result).toBe(blockIndex);
          } else {
            expect(Array.isArray(result)).toBe(true);
            const [before, after] = result as [number, number];

            if (0 <= before && before < blocks.length) {
              expect(blocks[before]!.to).toBeLessThanOrEqual(pos);
            }
            if (0 <= after && after < blocks.length) {
              expect(blocks[after]!.from).toBeGreaterThan(pos);
            }
            expect(before + 1).toBe(after);
          }
        }
      }
    });
  });
});
