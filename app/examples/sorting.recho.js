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
 * =                            Sorting Algorithms                            =
 * ============================================================================
 * Insertion sort is efficient for small arrays. Think of it like playing
 * cards: you're holding sorted cards in your left hand (sorted prefix/subarray)
 * and holding a card in your right hand (key). You insert the current card into
 * the sorted cards until there is no card in the table (unsorted subarray).
 */

recho.button("Run", run);

//➜ Insertion Sort                          
//➜                        ▁                
//➜                     ▃▃▇█▃  ▃   █        
//➜               ▂▃▃▆▆██████▆ █  ██ ▇ ▁   ▄
//➜             ▄▅████████████ █ ▅██▇█ █ ▂ █
//➜      ▁▂▂▃▇████████████████ █▃███████▆█▃█
//➜ ▁▄▅▆██████████████████████▄█████████████
visualize(array, insertionSort, "Insertion Sort");

function* insertionSort(array) {
  for (let i = 1; i < array.length; i++) {
    const key = array[i];
    let j = i - 1;
    while (j >= 0 && array[j] > key) {
      array[j + 1] = array[j];
      yield array.slice();
      j--;
    }
    array[j + 1] = key;
    yield array.slice();
  }
  yield array.slice();
  return array;
}

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
  }, 20);
  echo.dispose(() => clearInterval(timer));
}

const d3 = recho.require("d3");
