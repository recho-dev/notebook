export const matrixRain = `const width = 60;
const height = 25;
const columns = d3.range(width).map(() => createColumn(height));

{
  frame;
  
  // Create a new buffer.
  const buffer = d3.range(width * height).map(() => " ");

  // Update all columns.
  for (let i = columns.length - 1; i >= 0; --i) {
    const column = columns[i];
    const {lifespan, length, chars} = column;
    const n = chars.length;
    if (lifespan < 0) columns[i] = createColumn(height);
    else if (lifespan <= n) chars[n - lifespan] = " ";
    else {
      for (let j = length - 1; j < n; ++j) chars[j] = randomChar();
      chars.push(randomChar());
    }
    column.lifespan -= 1;
  }

  // Update the buffer.
  for (let i = 0; i < columns.length; ++i) {
    const column = columns[i];
    const {y, chars} = column;
    for (let j = 0; j < chars.length; ++j) buffer[(y + j) * width + i] = chars[j];
  }

  // Render the buffer.
  let output = "";
  for (let i = 0; i < height; ++i) {
    for (let j = 0; j < width; ++j) output += buffer[i * width + j];
    output += i === height - 1 ? "" : "\\n";
  }
  output = output.split("\\n").map(d => "  " + d).join("\\n");
  doc(output);
}

function createColumn(height) {
  const lifespan = d3.randomInt(height)();
  const length = d3.randomInt(lifespan)();
  const chars = d3.range(length).map(randomChar);
  const y = d3.randomInt(0, 10)();
  return {lifespan, length, chars, y};
}

function randomChar() {
  return String.fromCharCode(d3.randomInt(32, 127)());
}

const frame = (async function* () {
  for (let i = 0; true; ++i) {
    yield i;
    await new Promise((resolve) => setTimeout(resolve, 1000 / 15));
  }
})();

const d3 = require("d3");`;
