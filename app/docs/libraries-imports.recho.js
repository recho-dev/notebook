/**
 * @title Libraries Imports
 * @order 7
 */

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                           Libraries Imports
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Recho Notebook has some built-in libraries that you can access directly
 * through the namespace `recho`. There is no extra setup needed.
 */

const now = recho.now();

//➜ 1757422790999
echo(now);

/**
 * Refer to https://recho.dev/docs/api-reference for more built-in libraries.
 *
 * For using external libraries, Recho Notebook stdlib provides the
 * `recho.require` function to import one or more JavaScript packages.
 *
 * For example, let's import the `d3-time` package to count the number of days
 * between two dates.
 */

const d3Time = recho.require("d3-time");

const start = new Date(2025, 8, 1);
const end = new Date(2025, 9, 1);

//➜ 30
echo(d3Time.timeDay.count(start, end));

/**
 * The following example demonstrates how to import multiple packages at once.
 */

const d3Math = recho.require("d3-random", "d3-array");

//➜ [ 4, 1, 1, 7, 1, 0, 8, 3, 1, 5 ]
echo(d3Math.range(10).map(d3Math.randomInt(0, 10)));

/**
 * !! NOTE: Not all the libraries are importable with `recho.require`. !!
 *
 * If you see the following error when you try to import a library, it means
 * that the library is not satisfied the constraints of `d3-require`. (We use
 * `d3-require` under the hood.)
 */

//➜ { [RuntimeError: invalid module] input: "figlet", [Symbol(next.console.error.digest)]: "NEXT_CONSOLE_ERROR" }
echo(figlet);

const figlet = recho.require("figlet");

/**
 * If this happens, you can try to find a alternative package. Please refer to
 * https://github.com/d3/d3-require#browser-packages for more details.
 */
