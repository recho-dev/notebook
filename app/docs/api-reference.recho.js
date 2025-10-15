/**
 * @title API Reference
 * @order 9
 */

/**
 * ============================================================================
 * =                            API Reference                                 =
 * ============================================================================
 *
 * Recho provides a set of APIs to help you create notebooks.
 */

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                         echo(...values)
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Echos one or more values inline with your code as comments. If only one
 * value is provided, return the value itself. If multiple values are provided,
 * return all the values as an array.
 *
 * @param {...any} values - The values to echo.
 * @returns {any} The values if multiple values are provided, or the single value.
 */

//➜ "Hello, World!"
echo("Hello, World!");

//➜ 1 2 3
echo(1, 2, 3);

//➜ Peter:  Age = 20
//➜         Height = 180
echo("Peter: ", "Age = 20\nHeight = 180");

const a = echo(1 + 2);

//➜ 3
echo(a);

const numbers = echo(1, 2, 3);

//➜ [ 1, 2, 3 ]
echo(numbers);

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                      recho.inspect(value[, options])
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Formats a value for inspection with customizable options.
 *
 * @param {any} value - The value to inspect.
 * @param {Object} [options] - The options to format the output.
 * @param {string} [options.quote="double"] - The quote style of the output ("single", "double", or false).
 * @param {number} [options.indent=null] - The indentation of the output (null, "\t", or a positive integer).
 * @param {number} [options.limit=200] - The character limit of the output.
 * @returns {string} The formatted string representation of the value.
 */

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                                clear()
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Clear the output of the current block.
 *
 * @returns {void}
 */

{
  echo("Hello, World!");
  setTimeout(() => clear(), 1000);
}

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                             invalidation()
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Returns a promise that resolves before re-running the current block.
 *
 * @returns {Promise<void>}
 */

//➜ 9
{
  let count = echo(10);

  const timer = setInterval(() => {
    if (count-- <= 0) clearInterval(timer);
    else {
      clear();
      echo(count);
    }
  }, 1000);

  invalidation.then(() => clearInterval(timer));
}

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                                recho.now()
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Returns a generator that yields the current time continuously.
 *
 * @returns {Generator<number>}
 */

const now = recho.now();

//➜ 1757422825350
echo(now);

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                        recho.interval(milliseconds)
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Returns a generator that yields values at a specified interval.
 *
 * @param {number} milliseconds - The interval in milliseconds.
 * @returns {Generator<number>}
 */

const interval = recho.interval(1000);

//➜ 1
echo(interval);

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                           recho.require(...names)
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Imports one or more JavaScript packages. The import specifiers must be valid
 * npm package names with optional version specifiers. It use `d3-require`
 * under the hood.
 *
 * @param {string} ...names - The names of the packages to import.
 * @returns {any} The imported package.
 * @see https://github.com/d3/d3-require
 */

const Noise = recho.require("perlin-noise-3d");

//➜ [ 0.5428002520733116, 0.5424832952636395, 0.5414633391270067, 0.5397183031066122…
{
  const noise = new Noise();
  const values = [];
  for (let i = 0; i < 100; i++) {
    values.push(noise.get(i / 100, i / 100, i / 100));
  }
  echo(recho.inspect(values, {limit: 80}));
}

const d3 = recho.require("d3-array", "d3-random");

//➜ [ 6, 4, 1, 2, 5, 3, 3, 0, 6, 2 ]
echo(d3.range(10).map(d3.randomInt(0, 10)));

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                           recho.toggle(value)
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Creates an interactive toggle (checkbox) control that returns the boolean
 * value. In the editor, this renders as a clickable checkbox that updates the
 * code when toggled.
 *
 * @param {boolean} value - The initial boolean value.
 * @returns {boolean} The boolean value.
 */

const isEnabled = recho.toggle(true);

const isVisible = recho.toggle(false);

//➜ "The button is enabled."
//➜ "The button is hidden."
{
  echo(`The button is ${isEnabled ? "enabled" : "disabled"}.`);
  echo(`The button is ${isVisible ? "visible" : "hidden"}.`);
}

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                         recho.radio(index, options)
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Creates an interactive radio button group that returns the selected option.
 * In the editor, this renders as radio buttons next to each option in the array.
 *
 * @param {number} index - The index of the selected option (0-based).
 * @param {Array} options - The array of options to choose from.
 * @returns {any} The selected option from the options array.
 */

const size = recho.radio(1, ["small", "medium", "large"]);

const color = recho.radio(0, ["red", "green", "blue"]);

//➜ "This is a red medium button."
echo(`This is a ${color} ${size} button.`);

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                    recho.number(value[, options])
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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
