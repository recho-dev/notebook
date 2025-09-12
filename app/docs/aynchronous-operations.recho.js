/**
 * @title Asynchronous Operations
 * @order 6
 */

/**
 * ============================================================================
 * =                            Asynchronous Operations                       =
 * ============================================================================
 *
 * Asynchronous operations happen often in JavaScript, say fetching data from
 * an API, importing external packages, or waiting for a user action. These
 * operations can be represented as promises[1] in JavaScript.
 *
 * In Recho, top-level await is supported.
 */

const string = await new Promise((resolve) => setTimeout(() => resolve("I'm a string!"), 1000));

//➜ "I'm a string!"
echo(string);

/**
 * When one block refers to a promised defined in another block, the referencing
 * block implicitly awaits the promise, echoing `Pending…`. There is not need
 * to worry about whether something is a promise or whether it's resolved[1].
 *
 * For the following example, though `string2` is a promise, the referencing
 * block (`echo(string2)`) will implicitly await it and use the resolved value.
 */

//➜ Promise [Promise] {}
const string2 = echo(new Promise((resolve) => setTimeout(() => resolve("I'm a string!"), 1000)));

//➜ "I'm a string!"
echo(string2);

/**
 * !! NOTE: Within a block, a promise is a promise, should await it explicitly. !!
 *
 * For the following example, the `string3` is echoed as a promise, while the
 * `string4` is the resolved value of the promise.
 */

//➜ Promise [Promise] {}
//➜ "I'm a string!"
{
  const string3 = new Promise((resolve) => setTimeout(() => resolve("I'm a string!"), 1000));
  echo(string3);
  const string4 = await string3;
  echo(string4);
}

/**
 * In Recho, you will typically use promises to import external packages. Refer
 * to https://recho.dev/docs/libraries-imports for more details.
 */

const d3 = recho.require("d3");

//➜ [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]
echo(d3.range(10));

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                           References
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * - [1] https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
 * - [2] https://observablehq.com/framework/reactivity#promises
 */
