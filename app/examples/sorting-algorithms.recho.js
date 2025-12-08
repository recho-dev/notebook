/**
 * @title Sorting Algorithms
 * @author Luyu Cheng
 * @created 2025-12-09
 * @pull_request 86
 * @github chengluyu
 * @label Algorithm
 */

/**
 * ============================================================================
 * =                          Sorting Algorithms                              =
 * ============================================================================
 */

//➜                                            ▁▂▃
//➜                                      ▂▄▅▅▇▇███
//➜                                     ▁█████████
//➜                                ▃▅▆▇▇██████████
//➜                            ▁▃▇████████████████
//➜                         ▆▇▇███████████████████
//➜                      ▁▄███████████████████████
//➜                  ▂▂▅▆█████████████████████████
//➜                ▁▅█████████████████████████████
//➜            ▃▆▇▇███████████████████████████████
//➜       ▁▅▆▆▇███████████████████████████████████
//➜     ▁▇████████████████████████████████████████
//➜  ▄▇▇██████████████████████████████████████████
//➜                                               
//➜ ──────────────────────────────────────────────
{ echo.set("compact", true); echo(renderNumbers(numbers.data, numbers.highlight)); }

const maximum = recho.number(100);
const length = recho.number(46);
const swapsPerSecond = recho.number(43);

recho.button("Insertion Sort", () => {
  const numbers = randomArray(maximum, length);
  setNumbers({data: numbers, highlight: null});
  play(insertionSortSwaps(numbers));
});

recho.button("Selection Sort", () => {
  const numbers = randomArray(maximum, length);
  setNumbers({data: numbers, highlight: null});
  play(selectionSortSwaps(numbers));
});

recho.button("Merge Sort", () => {
  const numbers = randomArray(maximum, length);
  setNumbers({data: numbers, highlight: null});
  play(mergeSortSwaps(numbers));
});

recho.button("Quick Sort", () => {
  const numbers = randomArray(maximum, length);
  setNumbers({data: numbers, highlight: null});
  play(quickSortSwaps(numbers));
});

function insertionSortSwaps(arr) {
  const swaps = [];
  const copy = [...arr]; // work with a copy
  for (let i = 1; i < copy.length; i++) {
    let j = i;
    // Move element at position i to its correct position
    while (j > 0 && copy[j] < copy[j - 1]) {
      swaps.push([j - 1, j]);
      // Swap elements
      [copy[j - 1], copy[j]] = [copy[j], copy[j - 1]];
      j--;
    }
  }
  return swaps;
}

function selectionSortSwaps(arr) {
  const swaps = [];
  const copy = [...arr];
  
  for (let i = 0; i < copy.length - 1; i++) {
    let minIndex = i;
    // Find minimum element in remaining unsorted portion
    for (let j = i + 1; j < copy.length; j++) {
      swaps.push([j])
      if (copy[j] < copy[minIndex]) {
        minIndex = j;
      }
    }
    // Swap if minimum is not at current position
    if (minIndex !== i) {
      swaps.push([i, minIndex]);
      [copy[i], copy[minIndex]] = [copy[minIndex], copy[i]];
    }
  }
  
  return swaps;
}

function mergeSortSwaps(arr) {
  const swaps = [];
  const copy = [...arr];
  
  function merge(left, mid, right) {
    const leftArr = copy.slice(left, mid + 1);
    const rightArr = copy.slice(mid + 1, right + 1);
    
    let i = 0, j = 0, k = left;
    
    while (i < leftArr.length && j < rightArr.length) {
      if (leftArr[i] <= rightArr[j]) {
        copy[k] = leftArr[i];
        i++;
      } else {
        // Element from right half needs to move before elements from left half
        // This represents multiple swaps in the original array
        copy[k] = rightArr[j];
        // Record swaps: right element moves past remaining left elements
        const sourcePos = mid + 1 + j;
        for (let pos = sourcePos; pos > k; pos--) {
          swaps.push([pos - 1, pos]);
        }
        j++;
      }
      k++;
    }
    
    // Copy remaining elements (no swaps needed as they're already in place)
    while (i < leftArr.length) {
      copy[k] = leftArr[i];
      i++;
      k++;
    }
    while (j < rightArr.length) {
      copy[k] = rightArr[j];
      j++;
      k++;
    }
  }
  
  function mergeSort(left, right) {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);
      mergeSort(left, mid);
      mergeSort(mid + 1, right);
      merge(left, mid, right);
    }
  }
  
  mergeSort(0, copy.length - 1);
  return swaps;
}

function quickSortSwaps(arr) {
  const swaps = [];
  const copy = [...arr];
  
  function medianOfThree(left, right) {
    const mid = Math.floor((left + right) / 2);
    const a = copy[left], b = copy[mid], c = copy[right];
    
    // Find median and return its index
    if ((a <= b && b <= c) || (c <= b && b <= a)) return mid;
    if ((b <= a && a <= c) || (c <= a && a <= b)) return left;
    return right;
  }
  
  function partition(left, right) {
    // Choose pivot using median-of-three
    const pivotIndex = medianOfThree(left, right);
    
    // Move pivot to end
    if (pivotIndex !== right) {
      swaps.push([pivotIndex, right]);
      [copy[pivotIndex], copy[right]] = [copy[right], copy[pivotIndex]];
    }
    
    const pivot = copy[right];
    let i = left - 1;
    
    for (let j = left; j < right; j++) {
      if (copy[j] <= pivot) {
        i++;
        if (i !== j) {
          swaps.push([i, j]);
          [copy[i], copy[j]] = [copy[j], copy[i]];
        }
      }
    }
    
    // Move pivot to its final position
    i++;
    if (i !== right) {
      swaps.push([i, right]);
      [copy[i], copy[right]] = [copy[right], copy[i]];
    }
    
    return i;
  }
  
  function quickSort(left, right) {
    if (left < right) {
      const pivotIndex = partition(left, right);
      quickSort(left, pivotIndex - 1);
      quickSort(pivotIndex + 1, right);
    }
  }
  
  quickSort(0, copy.length - 1);
  return swaps;
}

function play(swaps) {
  if (playing !== null) {
    clearInterval(playing);
  }
  let current = 0;
  const id = setInterval(takeStep, Math.floor(1000 / swapsPerSecond));
  setPlaying(id);
  function takeStep() {
    if (current >= swaps.length) {
      clearInterval(playing);
      setPlaying(null);
      return;
    }
    const swap = swaps[current];
    if (swap.length === 2) {
      const [left, right] = swap;
      setNumbers(({ data }) => {
        const cloned = structuredClone(data);
        const temp = cloned[left];
        cloned[left] = cloned[right];
        cloned[right] = temp;
        return { data: cloned, highlight: null };
      });
    } else if (swap.length === 1) {
      const [index] = swap;
      setNumbers(({ data }) => {
        return { data, highlight: index};
      });
    }
    current++;
  }
}

function randomArray(maximum, length) {
  const buffer = [];
  const gen = d3.randomInt(maximum);
  for (let i = 0; i < length; i++) {
    buffer.push(gen());
  }
  return buffer;
}

function renderNumbers(numbers, highlight) {
  const min = d3.min(numbers), max = d3.max(numbers);
  const segmentCount = (max >>> 3) + ((max & 7) === 0 ? 0 : 1);
  const buffer = d3.transpose(numbers.map((n, i) => {
    const head = (n & 7) === 0 ? "" : blocks[n & 7];
    const body = fullBlock.repeat(n >>> 3);
    const padding = " ".repeat(segmentCount - (head.length + body.length));
    const ending = i === highlight ? "╻┸" : " ─";
    return padding + head + body + ending;
  }));
  return buffer.map(xs => xs.join("")).join("\n");
}

const [playing, setPlaying] = recho.state(null);
const [numbers, setNumbers] = recho.state({ data: [], highlight: null })

const blocks = Array.from(" ▁▂▃▄▅▆▇");
const fullBlock = "█";

const d3 = recho.require("d3");
