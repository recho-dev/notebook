/**
 * Represents an interval with a low and high endpoint.
 */
export interface Interval {
  low: number;
  high: number;
}

/**
 * Represents an interval with associated data.
 */
export type IntervalEntry<T> = {
  interval: Interval;
  data: T;
};

/**
 * Represents a node in the interval tree.
 */
class IntervalTreeNode<T> {
  interval: Interval;
  data: T;
  max: number; // Maximum high value in subtree
  left: IntervalTreeNode<T> | null = null;
  right: IntervalTreeNode<T> | null = null;
  height: number = 1;

  constructor(interval: Interval, data: T) {
    this.interval = interval;
    this.data = data;
    this.max = interval.high;
  }
}

/**
 * A balanced interval tree implementation using AVL tree balancing.
 * Supports efficient insertion, deletion, and overlap queries.
 */
export class IntervalTree<T = void> {
  private root: IntervalTreeNode<T> | null = null;
  private size: number = 0;

  /**
   * Creates an IntervalTree from an array using a mapping function.
   * @param items - The array of items to map
   * @param mapper - Function that maps each item to an interval and data value
   * @returns A new IntervalTree containing all mapped intervals
   */
  static from<S, T>(items: S[], mapper: (item: S, index: number) => IntervalEntry<T> | null): IntervalTree<T> {
    const tree = new IntervalTree<T>();
    for (let i = 0, n = items.length; i < n; i++) {
      const item = items[i];
      const mapped = mapper(item, i);
      if (mapped) tree.insert(mapped.interval, mapped.data);
    }
    return tree;
  }

  /**
   * Returns the number of intervals in the tree.
   */
  get length(): number {
    return this.size;
  }

  /**
   * Returns true if the tree is empty.
   */
  isEmpty(): boolean {
    return this.root === null;
  }

  /**
   * Inserts an interval with associated data into the tree.
   */
  insert(interval: Interval, data: T): void {
    if (interval.low > interval.high) {
      throw new Error("Invalid interval: low must be less than or equal to high");
    }
    this.root = this.insertNode(this.root, interval, data);
    this.size++;
  }

  private insertNode(node: IntervalTreeNode<T> | null, interval: Interval, data: T): IntervalTreeNode<T> {
    // Standard BST insertion
    if (node === null) {
      return new IntervalTreeNode(interval, data);
    }

    if (interval.low < node.interval.low) {
      node.left = this.insertNode(node.left, interval, data);
    } else {
      node.right = this.insertNode(node.right, interval, data);
    }

    // Update height and max
    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    node.max = Math.max(node.interval.high, Math.max(this.getMax(node.left), this.getMax(node.right)));

    // Balance the tree
    return this.balance(node);
  }

  /**
   * Deletes an interval from the tree.
   * Returns true if the interval was found and deleted, false otherwise.
   */
  delete(interval: Interval): boolean {
    const initialSize = this.size;
    this.root = this.deleteNode(this.root, interval);
    return this.size < initialSize;
  }

  private deleteNode(node: IntervalTreeNode<T> | null, interval: Interval): IntervalTreeNode<T> | null {
    if (node === null) {
      return null;
    }

    if (interval.low < node.interval.low) {
      node.left = this.deleteNode(node.left, interval);
    } else if (interval.low > node.interval.low) {
      node.right = this.deleteNode(node.right, interval);
    } else if (interval.high === node.interval.high) {
      // Found the node to delete
      this.size--;

      // Node with only one child or no child
      if (node.left === null) {
        return node.right;
      } else if (node.right === null) {
        return node.left;
      }

      // Node with two children: get inorder successor
      const successor = this.findMin(node.right);
      node.interval = successor.interval;
      node.data = successor.data;
      node.right = this.deleteNode(node.right, successor.interval);
    } else {
      // Continue searching
      node.right = this.deleteNode(node.right, interval);
    }

    // Update height and max
    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    node.max = Math.max(node.interval.high, Math.max(this.getMax(node.left), this.getMax(node.right)));

    // Balance the tree
    return this.balance(node);
  }

  private findMin(node: IntervalTreeNode<T>): IntervalTreeNode<T> {
    while (node.left !== null) {
      node = node.left;
    }
    return node;
  }

  /**
   * Searches for all intervals that overlap with the given interval.
   */
  search(interval: Interval): Array<IntervalEntry<T>> {
    const results: Array<IntervalEntry<T>> = [];
    this.searchNode(this.root, interval, results);
    return results;
  }

  private searchNode(node: IntervalTreeNode<T> | null, interval: Interval, results: Array<IntervalEntry<T>>): void {
    if (node === null) {
      return;
    }

    // Check if intervals overlap
    if (this.doOverlap(node.interval, interval)) {
      results.push({interval: node.interval, data: node.data});
    }

    // If left child exists and its max >= interval.low, search left
    if (node.left !== null && node.left.max >= interval.low) {
      this.searchNode(node.left, interval, results);
    }

    // Search right subtree if it can contain overlapping intervals
    if (node.right !== null && node.interval.low <= interval.high) {
      this.searchNode(node.right, interval, results);
    }
  }

  /**
   * Finds any one interval that overlaps with the given interval.
   * Returns null if no overlapping interval is found.
   */
  findAny(interval: Interval): IntervalEntry<T> | null {
    return this.findAnyNode(this.root, interval);
  }

  private findAnyNode(node: IntervalTreeNode<T> | null, interval: Interval): IntervalEntry<T> | null {
    if (node === null) {
      return null;
    }

    // Check if current node overlaps
    if (this.doOverlap(node.interval, interval)) {
      return {interval: node.interval, data: node.data};
    }

    // If left child can contain overlapping interval, search left first
    if (node.left !== null && node.left.max >= interval.low) {
      return this.findAnyNode(node.left, interval);
    }

    // Otherwise search right
    return this.findAnyNode(node.right, interval);
  }

  /**
   * Finds the first interval that contains the given point.
   * Returns null if no interval contains the point.
   */
  contains(point: number): IntervalEntry<T> | null {
    return this.containsNode(this.root, point);
  }

  private containsNode(node: IntervalTreeNode<T> | null, point: number): IntervalEntry<T> | null {
    if (node === null) {
      return null;
    }

    // Check if current node contains the point
    if (node.interval.low <= point && point <= node.interval.high) {
      return {interval: node.interval, data: node.data};
    }

    // If left child exists and its max >= point, search left first
    if (node.left !== null && node.left.max >= point) {
      return this.containsNode(node.left, point);
    }

    // Otherwise search right
    return this.containsNode(node.right, point);
  }

  /**
   * Returns all intervals in the tree.
   */
  toArray(): Array<IntervalEntry<T>> {
    const results: Array<IntervalEntry<T>> = [];
    this.inorderTraversal(this.root, results);
    return results;
  }

  private inorderTraversal(node: IntervalTreeNode<T> | null, results: Array<IntervalEntry<T>>): void {
    if (node === null) {
      return;
    }
    this.inorderTraversal(node.left, results);
    results.push({interval: node.interval, data: node.data});
    this.inorderTraversal(node.right, results);
  }

  /**
   * Clears all intervals from the tree.
   */
  clear(): void {
    this.root = null;
    this.size = 0;
  }

  // AVL tree balancing methods

  private getHeight(node: IntervalTreeNode<T> | null): number {
    return node === null ? 0 : node.height;
  }

  private getMax(node: IntervalTreeNode<T> | null): number {
    return node === null ? -Infinity : node.max;
  }

  private getBalanceFactor(node: IntervalTreeNode<T>): number {
    return this.getHeight(node.left) - this.getHeight(node.right);
  }

  private balance(node: IntervalTreeNode<T>): IntervalTreeNode<T> {
    const balanceFactor = this.getBalanceFactor(node);

    // Left heavy
    if (balanceFactor > 1) {
      if (this.getBalanceFactor(node.left!) < 0) {
        // Left-Right case
        node.left = this.rotateLeft(node.left!);
      }
      // Left-Left case
      return this.rotateRight(node);
    }

    // Right heavy
    if (balanceFactor < -1) {
      if (this.getBalanceFactor(node.right!) > 0) {
        // Right-Left case
        node.right = this.rotateRight(node.right!);
      }
      // Right-Right case
      return this.rotateLeft(node);
    }

    return node;
  }

  private rotateLeft(node: IntervalTreeNode<T>): IntervalTreeNode<T> {
    const newRoot = node.right!;
    node.right = newRoot.left;
    newRoot.left = node;

    // Update heights
    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    newRoot.height = 1 + Math.max(this.getHeight(newRoot.left), this.getHeight(newRoot.right));

    // Update max values
    node.max = Math.max(node.interval.high, Math.max(this.getMax(node.left), this.getMax(node.right)));
    newRoot.max = Math.max(newRoot.interval.high, Math.max(this.getMax(newRoot.left), this.getMax(newRoot.right)));

    return newRoot;
  }

  private rotateRight(node: IntervalTreeNode<T>): IntervalTreeNode<T> {
    const newRoot = node.left!;
    node.left = newRoot.right;
    newRoot.right = node;

    // Update heights
    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    newRoot.height = 1 + Math.max(this.getHeight(newRoot.left), this.getHeight(newRoot.right));

    // Update max values
    node.max = Math.max(node.interval.high, Math.max(this.getMax(node.left), this.getMax(node.right)));
    newRoot.max = Math.max(newRoot.interval.high, Math.max(this.getMax(newRoot.left), this.getMax(newRoot.right)));

    return newRoot;
  }

  private doOverlap(a: Interval, b: Interval): boolean {
    return a.low <= b.high && b.low <= a.high;
  }

  /**
   * Returns true if the tree is balanced (for testing purposes).
   */
  isBalanced(): boolean {
    return this.checkBalance(this.root) !== -1;
  }

  private checkBalance(node: IntervalTreeNode<T> | null): number {
    if (node === null) {
      return 0;
    }

    const leftHeight = this.checkBalance(node.left);
    if (leftHeight === -1) return -1;

    const rightHeight = this.checkBalance(node.right);
    if (rightHeight === -1) return -1;

    if (Math.abs(leftHeight - rightHeight) > 1) {
      return -1;
    }

    return Math.max(leftHeight, rightHeight) + 1;
  }
}
