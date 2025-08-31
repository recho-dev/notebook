/**
 * @title Random Histogram
 * @author Bairui Su
 * @created 2025-08-31
 * @pull_request 3
 * @github pearmini
 * @thumbnail 29
 */

const d3 = await recho.require("d3");

const count = 200;
const width = 50;

//➜ [Function (anonymous)]
const randomInt = echo(d3.randomInt(0, width));

//➜ [ 39, 4, 36, 28, 26, 6, 0, 1, 37, 2, 14, 29, 38, 25, 20, 46, 19, 38, 33, 4, 15, 5, 6, 26, 6, 41, 34, 23, 6, 1, 48, 5, 16, 29, 44, 45, 18, 9, 10, 49, 3, 19, 5, 47, 15, 27, 11, 33, 41, 0, 2, 1, 7, 24, 3…
const numbers = echo(d3.range(count).map(randomInt));

//➜ Map (50) {39 => [ 39, 39, 39, 39 ], 4 => [ 4, 4, 4, 4, 4 ], 36 => [ 36, 36, 36 ], 28 => [ 28, 28, 28, 28, 28 ], 26 => [ 26, 26, 26, 26, 26 ], 6 => [ 6, 6, 6, 6, 6, 6, 6 ], 0 => [ 0, 0, 0 ], 1 => [ 1, …
const groups = echo(d3.group(numbers, (d) => d));

//➜ [ 3, 4, 5, 3, 5, 4, 7, 5, 4, 8, 1, 2, 6, 3, 6, 5, 3, 3, 3, 3, 7, 4, 3, 7, 2, 4, 5, 5, 5, 2, 2, 1, 2, 4, 6, 2, 3, 4, 4, 4, 4, 3, 5, 3, 7, 7, 1, 3, 4, 4 ]
const bins = echo(d3.range(width).map((_, i) => (groups.has(i) ? groups.get(i).length : 0)));

//➜ 8
const height = echo(d3.max(bins));

//➜          █
//➜       █  █          █  █                    ██
//➜       █  █  █ █     █  █          █         ██
//➜   █ █ ██ █  █ ██    █  █  ███     █       █ ██
//➜  ██ ██████  █ ██    ██ █ ████    ██  ████ █ ██  ██
//➜ ██████████  ████████████ ████    ██ ██████████ ███
//➜ ██████████ ████████████████████ ██████████████ ███
//➜ ██████████████████████████████████████████████████
{
  let output = "";
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const bin = bins[j];
      const h = bin ? (bin * height) / d3.max(bins) : 0;
      output += h >= height - i ? "█" : " ";
    }
    output += i === height - 1 ? "" : "\n";
  }
  echo(output);
}
