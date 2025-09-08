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

echo("Hello, World!");

echo("Hello, World!", {quote: "single"});

echo("Hello, World!", {quote: false});

echo({a: 1, b: 2}, {indent: 2});

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
 *                               recho.now()
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Returns a generator that yields the current time continuously.
 *
 * @returns {Generator<number>}
 */

const now = recho.now();

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

echo(interval);
