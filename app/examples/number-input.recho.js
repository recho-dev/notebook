/**
 * @title Recho Notebook's Number Input Control
 * @author Luyu Cheng
 * @created 2025-09-29
 * @pull_request 134
 * @github chengluyu
 * @thumbnail_start 47
 */

/**
 * ============================================================================
 * =            Recho Notebook's Interactive Number Input Control            =
 * ============================================================================
 */

// Recho provides several interactive components in the editor, and the number
// input is a very common one. By calling the `recho.number` function with a
// numeric literal as the first argument, you can display `+` and `-` buttons
// in the editor. Users can click these two buttons to control the number.

// For example, the number input below can control the length of the displayed
// horizontal line.

//➜ "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo("━".repeat(width))
const width = recho.number(45);

// `recho.number` can set the maximum value, minimum value, and step size of
// the value by passing a object containing the relevant properties as the
// second argument.

// For example, the number input below can control the height of the displayed
// vertical line.

//➜ ┃
//➜ ┃
echo(Array.from("┃".repeat(height)).join("\n"))
const height = recho.number(2, {min: 2, max: 10, step: 2});

// Not all properties (`min`, `max`, and `step`) are required. You can omit
// any of them. Their default values are `-Infinity`, `Infinity`, and `1`,
// respectively.

// For example, the radius of the following circle can be set to any integers
// between 3 and 10.

const radius = recho.number(4, {min: 3, max: 10});
//➜   xxxxx
//➜  xx   xx
//➜ xx     xx
//➜ x       x
//➜ x       x
//➜ x       x
//➜ xx     xx
//➜  xx   xx
//➜   xxxxx
{
  const size = radius * 2 + 1;
  let result = '';
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const distance = Math.sqrt((x - radius) ** 2 + (y - radius) ** 2);
      result += Math.abs(distance - radius) < 0.5 ? 'x' : ' ';
    }
    result += '\n';
  }
  echo(result.trimEnd());
}

// Any JavaScript numeric literal is supported. If you use hexadecimal, octal,
// or binary numeric literals, the base format of the number will be preserved.

//➜ "▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▀▀▀▀▄▄▄▀▄▀▄▀"
{
  const leading = "▄".repeat(Math.clz32(bitMask));
  const remaining = bitMask.toString(2).replaceAll(/1/g, "▀").replaceAll(/0/g, "▄");
  echo(leading + remaining);
}
const bitMask = recho.number(0b111100010101, {step: 0b10101010});
