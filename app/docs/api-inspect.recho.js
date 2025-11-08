/**
 * @title recho.inspect(value[, options])
 */

/**
 * ============================================================================
 * =                   recho.inspect(value[, options])                       =
 * ============================================================================
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

//➜ "Hello, World!"
const defaultQuotedString = echo("Hello, World!");

//➜ 'Hello, World!'
const singleQuotedString = echo(recho.inspect("Hello, World!", {quote: "single"}));

//➜ "Hello, World!"
const doubleQuotedString = echo(recho.inspect("Hello, World!", {quote: "double"}));

//➜ Hello, World!
const unquotedString = echo(recho.inspect("Hello, World!", {quote: false}));

//➜ {
//➜   a: 1,
//➜   b: 2,
//➜   c: 3
//➜ }
const indentedObject = echo(recho.inspect({a: 1, b: 2, c: 3}, {indent: 2}));

//➜ [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, …
const array1000 = echo(recho.inspect(new Array(1000).fill(0), {limit: Infinity}));

