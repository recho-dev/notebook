/**
 * @title Random Histogram
 */

const d3 = await require("d3");

const count = 200;
const width = 50;

const randomInt = doc(d3.randomInt(0, width));

const numbers = doc(d3.range(count).map(randomInt));

const groups = doc(d3.group(numbers, (d) => d));

const bins = doc(d3.range(width).map((_, i) => (groups.has(i) ? groups.get(i).length : 0)));

const height = doc(d3.max(bins));

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
  doc(output);
}
