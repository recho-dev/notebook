/**
 * @title Inline Echoing
 * @order 3
 */

/**
 * ============================================================================
 * =                            Inline Echoing                                =
 * ============================================================================
 *
 * The core feature of Recho is to echo output inline with your code as
 * comments. Each line of the output is prefixed with `//➜`. You can call the
 * built-in function `echo` to echo output.
 */

echo("Hello, World!");

/**
 * The `echo` function returns the value as is, so you can define a echoing
 * variable like this:
 */

const message = echo("Hello, World!");

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                              Instant Feedback
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * `echo` allows you to quickly get feedback about the states of your code. You
 * don't need to frequently switch between with the code and the console, which
 * largely improves your development experience.
 *
 * For example, let's consider the following text processing examples, which
 * is a good demonstration of how `echo` show progressive data transformations
 * clearly.
 */

const text = echo("The quick brown fox jumps over the lazy dog. The dog was not amused.");

/** 1. Normalize: lowercase + remove punctuation */
const clean = echo(text.toLowerCase().replace(/[.,!?]/g, ""));

/** 2. Split into words */
const words = echo(clean.split(/\s+/));

/** 3. Remove stopwords */
const filtered = echo(words.filter((w) => !stopwords.includes(w)));
const stopwords = ["the", "was", "not", "over"];

/** 4. Count frequencies */
const frequencies = echo(
  filtered.reduce((acc, w) => {
    acc[w] = (acc[w] || 0) + 1;
    return acc;
  }, {}),
);

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                           Inspecting Values
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * `echo` provides a built-in inspector to format all kind of types in
 * JavaScript, including numbers, booleans, strings, arrays, objects, functions,
 * classes, maps, sets, dates, and more.
 */

const number = echo(1234567890);

const boolean = echo(true);

const NULL = echo(null);

const UNDEFINED = echo(undefined);

const string = echo("Hello, World!");

const array = echo([1, 2, 3, 4, 5]);

const object = echo({a: 1, b: 2, c: 3});

const foo = echo(function add(a, b) {
  return a + b;
});

const cls = echo(
  class Foo {
    constructor(a, b) {
      this.a = a;
      this.b = b;
    }
  },
);

const map = echo(
  new Map([
    ["a", 1],
    ["b", 2],
    ["c", 3],
  ]),
);

const set = echo(new Set([1, 2, 3, 4, 5]));

const date = echo(new Date());

const regex = echo(/^[a-zA-Z]+$/);

const bigInt = echo(12345678901234567890n);

const symbol = echo(Symbol("foo"));

/**
 * If you want to customize the output, you can convert the value to a string
 * manually and then echo it.
 */

const customDate = echo(new Date().toLocaleString());

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                             Formatting Outputs
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * `echo` provides `options` to format the output. For example, you can format
 * the quote style of a string value using the `quote` option:
 */

const defaultQuotedString = echo("Hello, World!");

const singleQuotedString = echo("Hello, World!", {quote: "single"});

const doubleQuotedString = echo("Hello, World!", {quote: "double"});

const unquotedString = echo("Hello, World!", {quote: false});

/**
 * You can also format the indentation of the output using the `indent` option.
 * It must be "\t", null, or a positive integer, defaults to null. This is
 * useful when you want to the clearer structure of the output.
 */

const indentedObject = echo({a: 1, b: 2, c: 3}, {indent: 2});

/**
 * You can also limit the length of the output using the `limit` option. It
 * must be a positive integer, Infinity, defaults to 200.
 */

const array1000 = echo(
  new Array(1000).fill(0).map((_, i) => i),
  {limit: 100},
);
