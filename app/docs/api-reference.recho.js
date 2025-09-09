/**
 * @title API Reference
 * @order 9
 */

/**
 * ============================================================================
 * =                            API Reference                                 =
 * ============================================================================
 *
 * Recho provides a set of APIs to help you create sketches.
 */

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                         echo(value[, options])
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Echos a value inline with your code as comments.
 *
 * @param {any} value - The value to echo.
 * @param {Object} [options] - The options to format the output.
 * @param {string} [options.quote="double"] - The quote style of the output.
 * @param {number} [options.indent=null] - The indentation of the output.
 * @param {number} [options.limit=200] - The limit of the output.
 * @returns {any} The value.
 */

//➜ "Hello, World!"
echo("Hello, World!");

//➜ 'Hello, World!'
echo("Hello, World!", {quote: "single"});

//➜ Hello, World!
echo("Hello, World!", {quote: false});

//➜ {
//➜   a: 1,
//➜   b: 2
//➜ }
echo({a: 1, b: 2}, {indent: 2});

//➜ [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, …
echo(new Array(100).fill(0), {limit: 80});

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
  echo(values, {limit: 80});
}

const d3 = recho.require("d3-array", "d3-random");

//➜ [ 6, 4, 1, 2, 5, 3, 3, 0, 6, 2 ]
echo(d3.range(10).map(d3.randomInt(0, 10)));
