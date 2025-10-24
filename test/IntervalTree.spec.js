import {it, expect, describe, beforeEach} from "vitest";
import {IntervalTree} from "../lib/IntervalTree.ts";

describe("IntervalTree", () => {
  let tree;

  beforeEach(() => {
    tree = new IntervalTree();
  });

  describe("static from method", () => {
    it("should create tree from array of objects with mapper", () => {
      const events = [
        {name: "Event A", start: 10, end: 20},
        {name: "Event B", start: 15, end: 25},
        {name: "Event C", start: 30, end: 40},
      ];

      const tree = IntervalTree.from(events, (event) => ({
        interval: {low: event.start, high: event.end},
        data: event.name,
      }));

      expect(tree.length).toBe(3);
      expect(tree.isBalanced()).toBe(true);

      const results = tree.search({low: 18, high: 22});
      expect(results.length).toBe(2);
      expect(results.map((r) => r.data).sort()).toEqual(["Event A", "Event B"]);
    });

    it("should create tree from array of numbers", () => {
      const numbers = [1, 2, 3, 4, 5];

      const tree = IntervalTree.from(numbers, (num) => ({
        interval: {low: num, high: num + 10},
        data: num * 2,
      }));

      expect(tree.length).toBe(5);
      // Intervals: [1,11], [2,12], [3,13], [4,14], [5,15]
      // Searching [12, 13] overlaps with [2,12], [3,13], [4,14], [5,15]
      const results = tree.search({low: 12, high: 13});
      expect(results.map((r) => r.data).sort((a, b) => a - b)).toEqual([4, 6, 8, 10]);
    });

    it("should create empty tree from empty array", () => {
      const tree = IntervalTree.from([], (item) => ({
        interval: {low: 0, high: 0},
        data: item,
      }));

      expect(tree.isEmpty()).toBe(true);
      expect(tree.length).toBe(0);
    });

    it("should handle complex data types", () => {
      const tasks = [
        {id: 1, timeRange: [0, 100], priority: "high"},
        {id: 2, timeRange: [50, 150], priority: "medium"},
        {id: 3, timeRange: [120, 200], priority: "low"},
      ];

      const tree = IntervalTree.from(tasks, (task) => ({
        interval: {low: task.timeRange[0], high: task.timeRange[1]},
        data: {id: task.id, priority: task.priority},
      }));

      expect(tree.length).toBe(3);

      // Intervals: [0,100], [50,150], [120,200]
      // Searching [75, 125] overlaps with all three
      const results = tree.search({low: 75, high: 125});
      expect(results.length).toBe(3);
      expect(results.find((r) => r.data.id === 1)).toBeDefined();
      expect(results.find((r) => r.data.id === 2)).toBeDefined();
      expect(results.find((r) => r.data.id === 3)).toBeDefined();
    });
  });

  describe("basic operations", () => {
    it("should create an empty tree", () => {
      expect(tree.isEmpty()).toBe(true);
      expect(tree.length).toBe(0);
    });

    it("should insert intervals", () => {
      tree.insert({low: 15, high: 20}, "data1");
      expect(tree.isEmpty()).toBe(false);
      expect(tree.length).toBe(1);

      tree.insert({low: 10, high: 30}, "data2");
      expect(tree.length).toBe(2);
    });

    it("should reject invalid intervals", () => {
      expect(() => tree.insert({low: 20, high: 10}, "data")).toThrow(
        "Invalid interval: low must be less than or equal to high",
      );
    });

    it("should allow single-point intervals", () => {
      tree.insert({low: 5, high: 5}, "point");
      expect(tree.length).toBe(1);
    });

    it("should delete intervals", () => {
      tree.insert({low: 15, high: 20}, "data1");
      tree.insert({low: 10, high: 30}, "data2");
      tree.insert({low: 17, high: 19}, "data3");

      const deleted = tree.delete({low: 10, high: 30});
      expect(deleted).toBe(true);
      expect(tree.length).toBe(2);

      const notDeleted = tree.delete({low: 100, high: 200});
      expect(notDeleted).toBe(false);
      expect(tree.length).toBe(2);
    });

    it("should clear the tree", () => {
      tree.insert({low: 15, high: 20}, "data1");
      tree.insert({low: 10, high: 30}, "data2");
      tree.clear();
      expect(tree.isEmpty()).toBe(true);
      expect(tree.length).toBe(0);
    });
  });

  describe("contains method", () => {
    beforeEach(() => {
      tree.insert({low: 15, high: 20}, "interval1");
      tree.insert({low: 10, high: 30}, "interval2");
      tree.insert({low: 17, high: 19}, "interval3");
      tree.insert({low: 5, high: 20}, "interval4");
      tree.insert({low: 12, high: 15}, "interval5");
      tree.insert({low: 30, high: 40}, "interval6");
    });

    it("should find an interval containing a point", () => {
      const result = tree.contains(18);
      expect(result).not.toBeNull();
      expect(result.interval.low).toBeLessThanOrEqual(18);
      expect(result.interval.high).toBeGreaterThanOrEqual(18);
    });

    it("should return null when no interval contains the point", () => {
      const result = tree.contains(45);
      expect(result).toBeNull();
    });

    it("should find interval at lower boundary", () => {
      const result = tree.contains(15);
      expect(result).not.toBeNull();
      expect(result.interval.low).toBeLessThanOrEqual(15);
      expect(result.interval.high).toBeGreaterThanOrEqual(15);
    });

    it("should find interval at upper boundary", () => {
      const result = tree.contains(40);
      expect(result).not.toBeNull();
      expect(result.data).toBe("interval6");
    });

    it("should find single-point interval", () => {
      tree.clear();
      tree.insert({low: 25, high: 25}, "point");
      const result = tree.contains(25);
      expect(result).not.toBeNull();
      expect(result.data).toBe("point");
    });

    it("should return null for point just outside intervals", () => {
      tree.clear();
      tree.insert({low: 10, high: 20}, "range");
      expect(tree.contains(9)).toBeNull();
      expect(tree.contains(21)).toBeNull();
    });

    it("should work with negative numbers", () => {
      tree.clear();
      tree.insert({low: -100, high: -50}, "negative");
      tree.insert({low: -10, high: 10}, "crosses-zero");

      const result1 = tree.contains(-75);
      expect(result1).not.toBeNull();
      expect(result1.data).toBe("negative");

      const result2 = tree.contains(0);
      expect(result2).not.toBeNull();
      expect(result2.data).toBe("crosses-zero");
    });

    it("should handle overlapping intervals efficiently", () => {
      tree.clear();
      // Insert multiple overlapping intervals
      tree.insert({low: 0, high: 100}, "large");
      tree.insert({low: 40, high: 60}, "medium");
      tree.insert({low: 48, high: 52}, "small");

      // Should find at least one
      const result = tree.contains(50);
      expect(result).not.toBeNull();
      expect(result.interval.low).toBeLessThanOrEqual(50);
      expect(result.interval.high).toBeGreaterThanOrEqual(50);
    });
  });

  describe("overlap detection", () => {
    beforeEach(() => {
      tree.insert({low: 15, high: 20}, "interval1");
      tree.insert({low: 10, high: 30}, "interval2");
      tree.insert({low: 17, high: 19}, "interval3");
      tree.insert({low: 5, high: 20}, "interval4");
      tree.insert({low: 12, high: 15}, "interval5");
      tree.insert({low: 30, high: 40}, "interval6");
    });

    it("should find all overlapping intervals", () => {
      const results = tree.search({low: 14, high: 16});
      expect(results.length).toBe(4);

      const dataValues = results.map((r) => r.data).sort();
      expect(dataValues).toEqual(["interval1", "interval2", "interval4", "interval5"]);
    });

    it("should find single overlapping interval", () => {
      const result = tree.findAny({low: 35, high: 37});
      expect(result).not.toBeNull();
      expect(result.data).toBe("interval6");
    });

    it("should return empty array when no overlaps exist", () => {
      const results = tree.search({low: 41, high: 50});
      expect(results.length).toBe(0);
    });

    it("should return null when no single overlap exists", () => {
      const result = tree.findAny({low: 41, high: 50});
      expect(result).toBeNull();
    });

    it("should detect overlap with single-point intervals", () => {
      tree.clear();
      tree.insert({low: 10, high: 10}, "point");
      tree.insert({low: 5, high: 15}, "range");

      const results = tree.search({low: 10, high: 10});
      expect(results.length).toBe(2);
    });

    it("should detect edge overlaps", () => {
      tree.clear();
      tree.insert({low: 10, high: 20}, "edge1");

      // Overlaps at left edge
      const leftEdge = tree.search({low: 5, high: 10});
      expect(leftEdge.length).toBe(1);

      // Overlaps at right edge
      const rightEdge = tree.search({low: 20, high: 25});
      expect(rightEdge.length).toBe(1);

      // No overlap just outside
      const noOverlap = tree.search({low: 21, high: 25});
      expect(noOverlap.length).toBe(0);
    });
  });

  describe("tree structure", () => {
    it("should maintain balance after insertions", () => {
      // Insert intervals in sorted order (worst case for unbalanced tree)
      for (let i = 0; i < 100; i++) {
        tree.insert({low: i, high: i + 5}, `data${i}`);
      }
      expect(tree.isBalanced()).toBe(true);
      expect(tree.length).toBe(100);
    });

    it("should maintain balance after deletions", () => {
      const intervals = [];
      for (let i = 0; i < 50; i++) {
        const interval = {low: i, high: i + 5};
        intervals.push(interval);
        tree.insert(interval, `data${i}`);
      }

      // Delete every other interval
      for (let i = 0; i < 50; i += 2) {
        tree.delete(intervals[i]);
      }

      expect(tree.isBalanced()).toBe(true);
      expect(tree.length).toBe(25);
    });
  });

  describe("toArray", () => {
    it("should return all intervals in sorted order", () => {
      tree.insert({low: 15, high: 20}, "data1");
      tree.insert({low: 10, high: 30}, "data2");
      tree.insert({low: 17, high: 19}, "data3");
      tree.insert({low: 5, high: 8}, "data4");

      const array = tree.toArray();
      expect(array.length).toBe(4);

      // Check that intervals are sorted by low value
      for (let i = 0; i < array.length - 1; i++) {
        expect(array[i].interval.low).toBeLessThanOrEqual(array[i + 1].interval.low);
      }
    });

    it("should return empty array for empty tree", () => {
      const array = tree.toArray();
      expect(array).toEqual([]);
    });
  });

  describe("complex scenarios", () => {
    it("should handle many overlapping intervals", () => {
      // Create many overlapping intervals centered around [50, 60]
      for (let i = 0; i < 20; i++) {
        tree.insert({low: 45 + i, high: 55 + i}, `overlap${i}`);
      }

      const results = tree.search({low: 50, high: 60});
      expect(results.length).toBeGreaterThan(10);
    });

    it("should handle intervals with large ranges", () => {
      tree.insert({low: 0, high: 1000000}, "large");
      tree.insert({low: 500, high: 600}, "small");

      const results = tree.search({low: 550, high: 560});
      expect(results.length).toBe(2);
    });

    it("should handle negative intervals", () => {
      tree.insert({low: -100, high: -50}, "negative1");
      tree.insert({low: -75, high: -25}, "negative2");
      tree.insert({low: -10, high: 10}, "crosses-zero");

      const results = tree.search({low: -60, high: -40});
      expect(results.length).toBe(2);

      const crossResults = tree.search({low: -5, high: 5});
      expect(crossResults.length).toBe(1);
      expect(crossResults[0].data).toBe("crosses-zero");
    });

    it("should work with different data types", () => {
      const tree2 = new IntervalTree();

      tree2.insert({low: 1, high: 5}, {name: "Alice", age: 30});
      tree2.insert({low: 3, high: 7}, {name: "Bob", age: 25});

      const results = tree2.search({low: 4, high: 6});
      expect(results.length).toBe(2);
      expect(results.find((r) => r.data.name === "Alice")).toBeDefined();
      expect(results.find((r) => r.data.name === "Bob")).toBeDefined();
    });
  });

  describe("stress test", () => {
    it("should handle large number of random intervals efficiently", () => {
      const intervals = [];

      // Insert 1000 random intervals
      for (let i = 0; i < 1000; i++) {
        const low = Math.floor(Math.random() * 10000);
        const high = low + Math.floor(Math.random() * 100) + 1;
        const interval = {low, high};
        intervals.push(interval);
        tree.insert(interval, `data${i}`);
      }

      expect(tree.length).toBe(1000);
      expect(tree.isBalanced()).toBe(true);

      // Perform random searches
      for (let i = 0; i < 100; i++) {
        const searchLow = Math.floor(Math.random() * 10000);
        const searchHigh = searchLow + Math.floor(Math.random() * 100) + 1;
        const results = tree.search({low: searchLow, high: searchHigh});

        // Verify all results actually overlap
        for (const result of results) {
          const overlaps = result.interval.low <= searchHigh && searchLow <= result.interval.high;
          expect(overlaps).toBe(true);
        }
      }
    });
  });
});
