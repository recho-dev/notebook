/**
 * @title Sorting Algorithms
 * @author Bairui Su
 * @created 2026-01-03
 * @github pearmini
 * @pull_request 205
 * @thumbnail_start 24
 * @label Algorithm
 */

/**
 * ============================================================================
 * =                     Sorting Algorithms Visualization                     =
 * ============================================================================
 *
 * This example demonstrates four sorting algorithms: Bubble Sort, Insertion
 * Sort, Selection Sort, and Quick Sort. Each algorithm is visualized with a
 * bar chart of the array elements.
 *
 */

recho.button("Run", run);

//➜ Bubble Sort
//➜                                        ▁
//➜                          ▁▂▄▄▄▅▆▆▆██████
//➜          ▁▁ ▂ ▇ ▇█ █ ▄   ███████████████
//➜       ▂▅▆██ █ █▇████▆█   ███████████████
//➜   ▂▅▇██████ █ ████████ ▅ ███████████████
//➜ ▁▇█████████▂█▁████████▁█▂███████████████
visualize(array.slice(), sortBubble, "Bubble Sort");

//➜ Insertion Sort
//➜                           ▁
//➜           ▄▆▆██ ▆ ▁ ▂█▄   █   ▄█ █     ▅
//➜        ▁▂████████ █ ███▇▁ █ ▇ ██ █ ▄   █
//➜      ▅▆██████████ █▂█████ █ █▇████▆█   █
//➜   ▂▇█████████████▅███████ █ ████████ ▅ █
//➜ ▁▇███████████████████████▂█▁████████▁█▂█
visualize(array.slice(), sortInsertion, "Insertion Sort");

//➜ Selection Sort
//➜                           ▁
//➜                 ▆█▁▄▂█▄  ▆█   ▄█ █  █▆ ▅
//➜               ▁████████▇▁███▇ ██ █ ▄██▂█
//➜            ▂▅▆███████████████▇████▆█████
//➜       ▂▅▅▇██████████████████████████████
//➜ ▁▁▁▂▂▇██████████████████████████████████
visualize(array.slice(), sortSelection, "Selection Sort");

//➜ Quick Sort
//➜                                    ▁
//➜                          ▁▄▂▄▄▅███▆███▆▆
//➜                  ▁▂▁▄▇▇█████████████████
//➜            ▂▅▆▆▇████████████████████████
//➜       ▂▅▅▇██████████████████████████████
//➜ ▁▁▁▂▂▇██████████████████████████████████
visualize(array.slice(), sortQuick, "Quick Sort");

const [array, setArray] = recho.state(data());

const chs = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];

function run() {
  setArray(data());
}

function data() {
  return d3.range(40).map(() => d3.randomInt(1, 100)());
}

function visualize(array, sorter, label) {
  const sortedArray = sorter(array);
  const y = d3.scaleLinear(d3.extent(array), [0, 40]);
  const timer = setInterval(() => {
    const step = sortedArray.next();
    if (step.done) {
      clearInterval(timer);
    } else {
      echo.clear();
      const len = chs.length;
      const Y = step.value.map(y).map((d) => {
        const n = Math.floor(d / len);
        const r = Math.floor(d - n * len);
        return chs[len - 1].repeat(n) + chs[r];
      });
      const maxHeight = d3.max(Y, (d) => d.length);
      const padY = Y.map((d) => d.padEnd(maxHeight, " ").split(""));
      let output = label ? `${label}\n` : "";
      for (let i = 0; i < maxHeight; i++) {
        for (let j = 0; j < padY.length; j++) {
          output += padY[j][maxHeight - i - 1];
        }
        output += i < maxHeight - 1 ? "\n" : "";
      }
      echo.set("compact", true)(output);
    }
  }, 100);
  echo.dispose(() => clearInterval(timer));
}

function* sortSelection(array) {
  const n = array.length;
  yield array.slice();
  for (let i = 0; i < n; i++) {
    let minIndex = i;
    for (let j = i + 1; j < n; j++) {
      if (array[j] < array[minIndex]) {
        minIndex = j;
      }
    }
    [array[i], array[minIndex]] = [array[minIndex], array[i]];
    yield array.slice();
  }
  yield array.slice();
  return array;
}

function* sortInsertion(array) {
  const n = array.length;
  yield array.slice();
  for (let i = 1; i < n; i++) {
    const current = array[i];
    let j = i - 1;
    while (j >= 0 && array[j] > current) {
      array[j + 1] = array[j];
      j--;
    }
    array[j + 1] = current;
    yield array.slice();
  }
  yield array.slice();
  return array;
}

function* sortBubble(array) {
  const n = array.length;
  yield array.slice();
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (array[j] > array[j + 1]) {
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
      }
    }
    yield array.slice();
  }
  yield array.slice();
  return array;
}

function* sortQuick(array, left = 0, right = array.length - 1) {
  if (left >= right) return;

  let pivot = array[right]; // Pick the rightmost element as pivot.
  let i = left;
  for (let j = left; j < right; j++) {
    if (array[j] < pivot) {
      [array[i], array[j]] = [array[j], array[i]];
      i++;
    }
  }
  [array[i], array[right]] = [array[right], array[i]];
  yield array.slice();

  yield* sortQuick(array, left, i - 1);
  yield* sortQuick(array, i + 1, right);
}

const d3 = recho.require("d3-array", "d3-random", "d3-scale");
