/**
 * Represents a half-open range [from, to) where from is inclusive and to is exclusive.
 */
export interface Range {
  from: number;
  to: number;
}

/**
 * Node in the AVL-based range tree.
 */
class RangeNode {
  range: Range;
  max: number; // Maximum to value in this subtree
  height: number;
  left: RangeNode | null = null;
  right: RangeNode | null = null;

  constructor(range: Range) {
    this.range = range;
    this.max = range.to;
    this.height = 1;
  }
}

/**
 * A balanced range tree that supports efficient interval operations.
 * Ranges are left-inclusive and right-exclusive: [from, to).
 */
export class RangeTree {
  private root: RangeNode | null = null;

  /**
   * Inserts a new range into the tree.
   */
  insert(from: number, to: number): void {
    if (from >= to) {
      throw new Error("Invalid range: from must be less than to");
    }
    this.root = this.insertNode(this.root, {from, to});
  }

  /**
   * Checks if any range in the tree overlaps with the given range.
   */
  hasOverlap(from: number, to: number): boolean {
    if (from >= to) {
      throw new Error("Invalid range: from must be less than to");
    }
    return this.searchOverlap(this.root, {from, to}) !== null;
  }

  /**
   * Checks if any range in the tree contains the given position.
   */
  contains(position: number): boolean {
    return this.searchContains(this.root, position) !== null;
  }

  /**
   * Retrieves all ranges that overlap with the given range.
   */
  findAllOverlapping(from: number, to: number): Range[] {
    if (from >= to) {
      throw new Error("Invalid range: from must be less than to");
    }
    const result: Range[] = [];
    this.collectOverlapping(this.root, {from, to}, result);
    return result;
  }

  private insertNode(node: RangeNode | null, range: Range): RangeNode {
    // Standard BST insertion
    if (node === null) {
      return new RangeNode(range);
    }

    if (range.from < node.range.from) {
      node.left = this.insertNode(node.left, range);
    } else {
      node.right = this.insertNode(node.right, range);
    }

    // Update height and max
    this.updateNode(node);

    // Balance the node
    return this.balance(node);
  }

  private searchOverlap(node: RangeNode | null, range: Range): RangeNode | null {
    if (node === null) {
      return null;
    }

    // Check if current node's range overlaps with the search range
    if (this.overlaps(node.range, range)) {
      return node;
    }

    // If left child exists and its max is greater than range.from,
    // there might be an overlap in the left subtree
    if (node.left !== null && node.left.max > range.from) {
      const leftResult = this.searchOverlap(node.left, range);
      if (leftResult !== null) {
        return leftResult;
      }
    }

    // Search in the right subtree
    return this.searchOverlap(node.right, range);
  }

  private searchContains(node: RangeNode | null, position: number): RangeNode | null {
    if (node === null) {
      return null;
    }

    // Check if current node's range contains the position
    if (node.range.from <= position && position < node.range.to) {
      return node;
    }

    // If left child exists and its max is greater than position,
    // there might be a containing range in the left subtree
    if (node.left !== null && node.left.max > position) {
      const leftResult = this.searchContains(node.left, position);
      if (leftResult !== null) {
        return leftResult;
      }
    }

    // Search in the right subtree
    return this.searchContains(node.right, position);
  }

  private collectOverlapping(node: RangeNode | null, range: Range, result: Range[]): void {
    if (node === null) {
      return;
    }

    // Check if current node's range overlaps
    if (this.overlaps(node.range, range)) {
      result.push({...node.range});
    }

    // If left child exists and its max is greater than range.from,
    // there might be overlaps in the left subtree
    if (node.left !== null && node.left.max > range.from) {
      this.collectOverlapping(node.left, range, result);
    }

    // Always check right subtree if the range might extend there
    if (node.right !== null && node.range.from < range.to) {
      this.collectOverlapping(node.right, range, result);
    }
  }

  private overlaps(a: Range, b: Range): boolean {
    // Two half-open ranges [a.from, a.to) and [b.from, b.to) overlap if:
    // a.from < b.to AND b.from < a.to
    return a.from < b.to && b.from < a.to;
  }

  private updateNode(node: RangeNode): void {
    const leftHeight = node.left?.height ?? 0;
    const rightHeight = node.right?.height ?? 0;
    node.height = Math.max(leftHeight, rightHeight) + 1;

    const leftMax = node.left?.max ?? Number.NEGATIVE_INFINITY;
    const rightMax = node.right?.max ?? Number.NEGATIVE_INFINITY;
    node.max = Math.max(node.range.to, leftMax, rightMax);
  }

  private getBalance(node: RangeNode): number {
    const leftHeight = node.left?.height ?? 0;
    const rightHeight = node.right?.height ?? 0;
    return leftHeight - rightHeight;
  }

  private balance(node: RangeNode): RangeNode {
    const balance = this.getBalance(node);

    // Left heavy
    if (balance > 1) {
      if (node.left && this.getBalance(node.left) < 0) {
        // Left-Right case
        node.left = this.rotateLeft(node.left);
      }
      // Left-Left case
      return this.rotateRight(node);
    }

    // Right heavy
    if (balance < -1) {
      if (node.right && this.getBalance(node.right) > 0) {
        // Right-Left case
        node.right = this.rotateRight(node.right);
      }
      // Right-Right case
      return this.rotateLeft(node);
    }

    return node;
  }

  private rotateLeft(node: RangeNode): RangeNode {
    const newRoot = node.right!;
    node.right = newRoot.left;
    newRoot.left = node;

    this.updateNode(node);
    this.updateNode(newRoot);

    return newRoot;
  }

  private rotateRight(node: RangeNode): RangeNode {
    const newRoot = node.left!;
    node.left = newRoot.right;
    newRoot.right = node;

    this.updateNode(node);
    this.updateNode(newRoot);

    return newRoot;
  }
}
