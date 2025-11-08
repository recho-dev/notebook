/**
 * @title recho.number(value[, options])
 * @order 19
 */

/**
 * ============================================================================
 * =                    recho.number(value[, options])                       =
 * ============================================================================
 *
 * Creates an interactive number input control that returns a constrained number.
 * In the editor, this renders as increment and decrement buttons around the
 * number value.
 *
 * @param {number} value - The initial number value.
 * @param {Object} [options] - The options to constrain the number.
 * @param {number} [options.min=-Infinity] - The minimum allowed value.
 * @param {number} [options.max=Infinity] - The maximum allowed value.
 * @param {number} [options.step=1] - The step size for increment/decrement operations.
 * @returns {number} The number value, constrained to the specified range.
 */

const count = recho.number(5);

const volume = recho.number(5.5, {min: 0, max: 10, step: 0.1});

//➜ "Volume ▓▓▓▓▓▒▒▒▒▒ 55%"
{
  const filled = "▓".repeat(Math.floor(volume));
  const empty = "▒".repeat(Math.ceil(10 - volume));
  echo(`Volume ${filled}${empty} ${volume * 10}%`);
}

const signal = recho.number(0b1010101010101010, {min: 0, max: 0xffff});

//➜ ╶┐┌┐┌┐┌┐┌┐┌┐┌┐┌┐
//➜  └┘└┘└┘└┘└┘└┘└┘└
{
  let upper = "";
  let lower = "";
  let lastBit = null;
  for (const bit of signal.toString(2)) {
    if (lastBit === null) {
      upper += bit == "1" ? "╶" : " ";
      lower += bit == "1" ? " " : "╶";
    } else if (lastBit === bit) {
      upper += bit == "1" ? "─" : " ";
      lower += bit == "1" ? " " : "─";
    } else {
      upper += bit == "1" ? "┌" : "┐";
      lower += bit == "1" ? "┘" : "└";
    }
    lastBit = bit;
  }
  echo(upper + "\n" + lower);
}

const temperature = recho.number(24, {min: -10, max: 40, step: 0.5});

//➜ "The room temperature is 24 °C (75.2 °F)."
{
  const fahrenheit = (temperature * 9) / 5 + 32;
  echo(`The room temperature is ${temperature} °C (${fahrenheit} °F).`);
}

