const HELLO_WORLD = `doc("Hello World");`;

const ADDITION = `const a = 2;
const b = a ** 2;

doc(add(a, b));

function add(a, b) {
  return a + b;
}`;

const INSPECTOR = `doc("line1\\nline2");

doc([1, 2, 3]);

doc(function add(a, b) {
  return a + b;
});

doc({a: 1, b: 2});

doc(class Foo {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }
});

doc(new Map([[1, 2], [3, 4]]));

doc(new Date());

doc(new Map([[1, 2], [3, 4]]), {indent: 2});

doc(new Array(100).fill(0));

doc(new Array(100).fill(0), {limit: 100});

doc(new Array(100).fill(0), {limit: Infinity});
`;

const PROMISE = `const a = doc(new Promise(resolve => setTimeout(() => resolve(1), 2000)));

const b = doc(a + 1);`;

const SYNTAX_ERROR = `function add();`;

const RUNTIME_ERROR = `add(1, 2);`;

const RANDOM_HISTOGRAM = `const d3 = await require("d3");

const count = 200;
const width = 50;

const randomInt = doc(d3.randomInt(0, width));

const numbers = doc(d3.range(count).map(randomInt));

const groups = doc(d3.group(numbers, d => d));

const bins = doc(d3.range(width).map((_, i) => groups.has(i) ? groups.get(i).length : 0));

const height = doc(d3.max(bins));

{
  let output = "";
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const bin = bins[j];
      const h = bin ? bin * height / d3.max(bins) : 0;
      output += h >= height - i ? "█" : " ";
    }
    output += i === height - 1 ? "" : "\\n";
  }
  doc(output);
}`;

const MANDELBROT_SET = `const cols = 80;
const rows = 30;
const maxIter = 80;

{
  let output = "";
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const re = map(x, 0, cols, -2.5, 1);
      const im = map(y, 0, rows, -1, 1);
      let [a, b, i] = [0, 0, 0];
      while (i < maxIter) {
        [a, b] = [a * a - b * b + re, 2 * a * b + im];
        if(a * a + b * b > 4) break;
        i++;
      }
      output += i === maxIter ? "0" : " ";
    }
    output += y === rows - 1 ? "" : "\\n";
  }
  doc(output);
}

function map(x, d0, d1, r0, r1) {
  return r0 + (r1 - r0) * (x - d0) / (d1 - d0);
}`;

export const examples = [
  {
    name: "Hello World",
    code: HELLO_WORLD,
  },
  {
    name: "Addition",
    code: ADDITION,
  },
  {
    name: "Inspector",
    code: INSPECTOR,
  },
  {
    name: "Promise",
    code: PROMISE,
  },
  {
    name: "Syntax Error",
    code: SYNTAX_ERROR,
  },
  {
    name: "Runtime Error",
    code: RUNTIME_ERROR,
  },
  {
    name: "Random Histogram",
    code: RANDOM_HISTOGRAM,
  },
  {
    name: "Mandelbrot Set",
    code: MANDELBROT_SET,
  },
];
