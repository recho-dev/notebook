export class MaxHeap<T> {
  private heap: T[] = [];
  private weights: number[] = [];
  private indexMap: Map<T, number> = new Map();
  private keyFn: (value: T) => number;
  private compareFn: (a: number, b: number) => number;

  constructor(keyFn: (value: T) => number, compareFn: (a: number, b: number) => number = (a, b) => a - b) {
    this.keyFn = keyFn;
    this.compareFn = compareFn;
  }

  private parent(i: number): number {
    return Math.floor((i - 1) / 2);
  }

  private leftChild(i: number): number {
    return 2 * i + 1;
  }

  private rightChild(i: number): number {
    return 2 * i + 2;
  }

  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    [this.weights[i], this.weights[j]] = [this.weights[j], this.weights[i]];
    this.indexMap.set(this.heap[i]!, i);
    this.indexMap.set(this.heap[j]!, j);
  }

  private percolateUp(i: number): void {
    while (i > 0) {
      const p = this.parent(i);
      if (this.compareFn(this.weights[i]!, this.weights[p]!) > 0) {
        this.swap(i, p);
        i = p;
      } else {
        break;
      }
    }
  }

  private percolateDown(i: number): void {
    const size = this.heap.length;
    while (true) {
      let largest = i;
      const left = this.leftChild(i);
      const right = this.rightChild(i);

      if (left < size && this.compareFn(this.weights[left], this.weights[largest]) > 0) {
        largest = left;
      }
      if (right < size && this.compareFn(this.weights[right], this.weights[largest]) > 0) {
        largest = right;
      }

      if (largest !== i) {
        this.swap(i, largest);
        i = largest;
      } else {
        break;
      }
    }
  }

  insert(value: T): void {
    const weight = this.keyFn(value);
    const existingIndex = this.indexMap.get(value);

    if (existingIndex !== undefined) {
      const oldWeight = this.weights[existingIndex];
      if (weight !== oldWeight) {
        this.weights[existingIndex] = weight;
        const cmp = this.compareFn(weight, oldWeight);
        if (cmp > 0) {
          this.percolateUp(existingIndex);
        } else if (cmp < 0) {
          this.percolateDown(existingIndex);
        }
      }
    } else {
      const index = this.heap.length;
      this.heap.push(value);
      this.weights.push(weight);
      this.indexMap.set(value, index);
      this.percolateUp(index);
    }
  }

  extractMax(): T | undefined {
    if (this.heap.length === 0) {
      return undefined;
    }

    const max = this.heap[0];
    this.indexMap.delete(max);

    if (this.heap.length === 1) {
      this.heap.pop();
      this.weights.pop();
      return max;
    }

    this.heap[0] = this.heap.pop()!;
    this.weights[0] = this.weights.pop()!;
    this.indexMap.set(this.heap[0], 0);
    this.percolateDown(0);

    return max;
  }

  get peek(): T | undefined {
    return this.heap[0];
  }

  peekWeight(): number | undefined {
    return this.weights[0];
  }

  has(value: T): boolean {
    return this.indexMap.has(value);
  }

  get size(): number {
    return this.heap.length;
  }

  get isEmpty(): boolean {
    return this.heap.length === 0;
  }

  nonEmpty(): this is NonEmptyHeap<T> {
    return this.heap.length > 0;
  }

  clear(): void {
    this.heap = [];
    this.weights = [];
    this.indexMap.clear();
  }
}

type NonEmptyHeap<T> = Omit<MaxHeap<T>, "peek"> & {readonly peek: T};
