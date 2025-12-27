import {it, expect, describe} from "vitest";
import {MaxHeap} from "../../lib/containers/heap.js";

describe("MaxHeap", () => {
  describe("basic operations", () => {
    it("should insert and extract values in max order", () => {
      const heap = new MaxHeap<number>((x) => x);

      heap.insert(5);
      heap.insert(3);
      heap.insert(8);
      heap.insert(1);
      heap.insert(10);

      expect(heap.size).toBe(5);
      expect(heap.extractMax()).toBe(10);
      expect(heap.extractMax()).toBe(8);
      expect(heap.extractMax()).toBe(5);
      expect(heap.extractMax()).toBe(3);
      expect(heap.extractMax()).toBe(1);
      expect(heap.isEmpty).toBe(true);
    });

    it("should peek without removing", () => {
      const heap = new MaxHeap<number>((x) => x);

      heap.insert(5);
      heap.insert(10);
      heap.insert(3);

      expect(heap.peek).toBe(10);
      expect(heap.peekWeight()).toBe(10);
      expect(heap.size).toBe(3);

      expect(heap.extractMax()).toBe(10);
      expect(heap.peek).toBe(5);
      expect(heap.size).toBe(2);
    });

    it("should handle empty heap", () => {
      const heap = new MaxHeap<number>((x) => x);

      expect(heap.isEmpty).toBe(true);
      expect(heap.size).toBe(0);
      expect(heap.peek).toBeUndefined();
      expect(heap.peekWeight()).toBeUndefined();
      expect(heap.extractMax()).toBeUndefined();
    });

    it("should check if value exists", () => {
      const heap = new MaxHeap<number>((x) => x);

      heap.insert(5);
      heap.insert(10);

      expect(heap.has(5)).toBe(true);
      expect(heap.has(10)).toBe(true);
      expect(heap.has(3)).toBe(false);

      heap.extractMax();
      expect(heap.has(10)).toBe(false);
      expect(heap.has(5)).toBe(true);
    });

    it("should clear the heap", () => {
      const heap = new MaxHeap<number>((x) => x);

      heap.insert(5);
      heap.insert(10);
      heap.insert(3);

      expect(heap.size).toBe(3);

      heap.clear();

      expect(heap.isEmpty).toBe(true);
      expect(heap.size).toBe(0);
      expect(heap.has(5)).toBe(false);
    });
  });

  describe("update existing values", () => {
    it("should update value with increased weight and percolate up", () => {
      const weights = new Map<string, number>([
        ["a", 5],
        ["b", 10],
        ["c", 3],
      ]);

      const heap = new MaxHeap<string>((x) => weights.get(x)!);

      heap.insert("a");
      heap.insert("b");
      heap.insert("c");

      expect(heap.peek).toBe("b");

      // Update "a" to have weight 15
      weights.set("a", 15);
      heap.insert("a");

      expect(heap.peek).toBe("a");
      expect(heap.peekWeight()).toBe(15);
    });

    it("should update value with decreased weight and percolate down", () => {
      const weights = new Map<string, number>([
        ["a", 5],
        ["b", 10],
        ["c", 3],
      ]);

      const heap = new MaxHeap<string>((x) => weights.get(x)!);

      heap.insert("a");
      heap.insert("b");
      heap.insert("c");

      expect(heap.peek).toBe("b");

      // Update "b" to have weight 1
      weights.set("b", 1);
      heap.insert("b");

      expect(heap.peek).toBe("a");
      expect(heap.peekWeight()).toBe(5);

      heap.extractMax();
      expect(heap.peek).toBe("c");
      expect(heap.peekWeight()).toBe(3);
    });

    it("should not change heap when weight stays the same", () => {
      const weights = new Map<string, number>([
        ["a", 5],
        ["b", 10],
      ]);

      const heap = new MaxHeap<string>((x) => weights.get(x)!);

      heap.insert("a");
      heap.insert("b");

      expect(heap.size).toBe(2);
      expect(heap.peek).toBe("b");

      // Re-insert "b" with same weight
      heap.insert("b");

      expect(heap.size).toBe(2);
      expect(heap.peek).toBe("b");
    });

    it("should handle multiple updates on same value", () => {
      const weights = new Map<string, number>([["a", 5]]);

      const heap = new MaxHeap<string>((x) => weights.get(x)!);

      heap.insert("a");
      expect(heap.peekWeight()).toBe(5);

      weights.set("a", 10);
      heap.insert("a");
      expect(heap.peekWeight()).toBe(10);

      weights.set("a", 3);
      heap.insert("a");
      expect(heap.peekWeight()).toBe(3);

      weights.set("a", 7);
      heap.insert("a");
      expect(heap.peekWeight()).toBe(7);

      expect(heap.size).toBe(1);
    });
  });

  describe("custom comparator", () => {
    it("should use custom comparator for min heap behavior", () => {
      // Reverse comparator for min heap
      const heap = new MaxHeap<number>(
        (x) => x,
        (a, b) => b - a,
      );

      heap.insert(5);
      heap.insert(3);
      heap.insert(8);
      heap.insert(1);

      expect(heap.extractMax()).toBe(1);
      expect(heap.extractMax()).toBe(3);
      expect(heap.extractMax()).toBe(5);
      expect(heap.extractMax()).toBe(8);
    });

    it("should work with objects and custom key function", () => {
      interface Task {
        name: string;
        priority: number;
      }

      const heap = new MaxHeap<Task>((task) => task.priority);

      heap.insert({name: "Low", priority: 1});
      heap.insert({name: "High", priority: 10});
      heap.insert({name: "Medium", priority: 5});

      expect(heap.extractMax()?.name).toBe("High");
      expect(heap.extractMax()?.name).toBe("Medium");
      expect(heap.extractMax()?.name).toBe("Low");
    });
  });

  describe("edge cases", () => {
    it("should handle single element", () => {
      const heap = new MaxHeap<number>((x) => x);

      heap.insert(42);
      expect(heap.size).toBe(1);
      expect(heap.peek).toBe(42);
      expect(heap.extractMax()).toBe(42);
      expect(heap.isEmpty).toBe(true);
    });

    it("should handle duplicate weights", () => {
      const heap = new MaxHeap<number>((x) => Math.floor(x / 10));

      heap.insert(15);
      heap.insert(12);
      heap.insert(18);

      // All have weight 1
      expect(heap.size).toBe(3);
      expect(heap.extractMax()).toBe(15); // First inserted with weight 1
    });

    it("should handle large number of elements", () => {
      const heap = new MaxHeap<number>((x) => x);
      const values = Array.from({length: 100}, (_, i) => i);

      // Insert in random order
      const shuffled = [...values].sort(() => Math.random() - 0.5);
      shuffled.forEach((v) => heap.insert(v));

      expect(heap.size).toBe(100);

      // Extract all and verify descending order
      const extracted = [];
      while (!heap.isEmpty) {
        extracted.push(heap.extractMax()!);
      }

      expect(extracted).toEqual(values.reverse());
    });

    it("should maintain heap property after multiple operations", () => {
      const weights = new Map<string, number>();
      const heap = new MaxHeap<string>((x) => weights.get(x)!);

      // Insert values
      weights.set("a", 5);
      weights.set("b", 10);
      weights.set("c", 3);
      weights.set("d", 7);

      heap.insert("a");
      heap.insert("b");
      heap.insert("c");
      heap.insert("d");

      // Update some values
      weights.set("c", 15);
      heap.insert("c");

      weights.set("b", 2);
      heap.insert("b");

      // Extract and verify order
      expect(heap.extractMax()).toBe("c"); // 15
      expect(heap.extractMax()).toBe("d"); // 7
      expect(heap.extractMax()).toBe("a"); // 5
      expect(heap.extractMax()).toBe("b"); // 2
    });
  });
});
