const HELLO_WORLD = `print("Hello World");`;

const ADDITION = `const a = 2;
const b = a ** 2;

print(add(a, b));

function add(a, b) {
  return a + b;
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
];
