/**
 * @title Inline Echoing
 */

/**
 * ============================================================================
 * =                            Inline Echoing                                =
 * ============================================================================
 *
 * The core feature of Recho Notebook is to echo output inline with your code as
 * comments. Each line of the output is prefixed with `//➜`. You can call the
 * built-in function `echo` to echo output.
 */

//➜ "Hello, World!"
echo("Hello, World!");

/**
 * The `echo` function returns the value as is, so you can define a echoing
 * variable like this:
 */

//➜ "Hello, World!"
const message = echo("Hello, World!");

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                            Instant Feedback
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

//➜ "The quick brown fox jumps over the lazy dog. The dog was not amused."
const text = echo("The quick brown fox jumps over the lazy dog. The dog was not amused.");

/** 1. Normalize: lowercase + remove punctuation */

//➜ "the quick brown fox jumps over the lazy dog the dog was not amused"
const clean = echo(text.toLowerCase().replace(/[.,!?]/g, ""));

/** 2. Split into words */

//➜ [ "the", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog", "the", "dog", "was", "not", "amused" ]
const words = echo(clean.split(/\s+/));

/** 3. Remove stopwords */

//➜ [ "quick", "brown", "fox", "jumps", "lazy", "dog", "dog", "amused" ]
const filtered = echo(words.filter((w) => !stopwords.includes(w)));
const stopwords = ["the", "was", "not", "over"];

/** 4. Count frequencies */

//➜ { quick: 1, brown: 1, fox: 1, jumps: 1, lazy: 1, dog: 2, amused: 1 }
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

//➜ 1234567890
const number = echo(1234567890);

//➜ true
const boolean = echo(true);

//➜ null
const NULL = echo(null);

//➜ undefined
const UNDEFINED = echo(undefined);

//➜ "Hello, World!"
const string = echo("Hello, World!");

//➜ [ 1, 2, 3, 4, 5 ]
const array = echo([1, 2, 3, 4, 5]);

//➜ { a: 1, b: 2, c: 3 }
const object = echo({a: 1, b: 2, c: 3});

//➜ [Function: add]
const foo = echo(function add(a, b) {
  return a + b;
});

//➜ [Function: Foo]
const cls = echo(
  class Foo {
    constructor(a, b) {
      this.a = a;
      this.b = b;
    }
  },
);

//➜ Map (3) {"a" => 1, "b" => 2, "c" => 3}
const map = echo(
  new Map([
    ["a", 1],
    ["b", 2],
    ["c", 3],
  ]),
);

//➜ Set (5) {1, 2, 3, 4, 5}
const set = echo(new Set([1, 2, 3, 4, 5]));

//➜ Tue Sep 09 2025 08:58:48 GMT-0400 (Eastern Daylight Time)
const date = echo(new Date());

//➜ /^[a-zA-Z]+$/
const regex = echo(/^[a-zA-Z]+$/);

//➜ 12345678901234567890n
const bigInt = echo(12345678901234567890n);

//➜ Symbol(foo)
const symbol = echo(Symbol("foo"));

/**
 * If you want to customize the output, you can convert the value to a string
 * manually and then echo it.
 */

//➜ "9/9/2025, 8:58:48 AM"
const customDate = echo(new Date().toLocaleString());

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                           Echoing Multiple Values
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * You can pass multiple values to `echo` in a single call. The values will be
 * merged horizontally.
 */

//➜ 1 2 3
echo(1, 2, 3);

//➜ Hello World
echo("Hello", "World");

//➜ Peter:  Age = 20
//➜         Height = 180
echo("Peter: ", "Age = 20\nHeight = 180");

/**
 * You can also call `echo` multiple times to echo multiple values in ForStatement,
 * BlockStatement, and more. The values will be joined by a newline.
 */

//➜ 0
//➜ 1
//➜ 2
for (let i = 0; i < 3; i++) echo(i);

//➜ 1
//➜ 2
//➜ 3
{
  echo(1);
  echo(2);
  echo(3);
}

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                           Inspecting Options
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * You can use `recho.inspect()` with options to format the output. For example,
 * you can format the quote style of a string value using the `quote` option:
 */

//➜ "Hello, World!"
const defaultQuotedString = echo("Hello, World!");

//➜ 'Hello, World!'
const singleQuotedString = echo(recho.inspect("Hello, World!", {quote: "single"}));

//➜ "Hello, World!"
const doubleQuotedString = echo(recho.inspect("Hello, World!", {quote: "double"}));

//➜ Hello, World!
const unquotedString = echo(recho.inspect("Hello, World!", {quote: false}));

/**
 * You can also format the indentation of the output using the `indent` option.
 * It must be "\t", null, or a positive integer, defaults to null. This is
 * useful when you want to the clearer structure of the output.
 */

//➜ {
//➜   a: 1,
//➜   b: 2,
//➜   c: 3
//➜ }
const indentedObject = echo(recho.inspect({a: 1, b: 2, c: 3}, {indent: 2}));

/**
 * You can also limit the length of the output using the `limit` option. It
 * must be a positive integer, Infinity, defaults to 200.
 */

//➜ [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, …
const array1000 = echo(recho.inspect(new Array(1000).fill(0), {limit: 80}));

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                           Clearing Output
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * You can call `echo.clear()` to clear the output of the current block. For
 * example, click the ▶️ button to see the output being cleared after 1 second.
 */

{
  echo("hello world");
  setTimeout(() => echo.clear(), 1000);
}

/**
 * Refer to https://recho.dev/docs/reactive-blocks for more details.
 */
