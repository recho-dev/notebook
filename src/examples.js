const HELLO_WORLD = `print("Hello World");`;

const ADDITION = `const a = 2;
const b = a ** 2;

print(add(a, b));

function add(a, b) {
  return a + b;
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
  print(output);
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
    name: "Mandelbrot Set",
    code: MANDELBROT_SET,
  },
];
