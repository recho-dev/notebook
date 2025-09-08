/**
 * @title Getting Started
 * @order 2
 */

/**
 * ============================================================================
 * =                            Getting Started                               =
 * ============================================================================
 *
 * This page will quickly guide you through the core concepts of Recho. After
 * reading this, you will be able to create your own sketches!
 *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                              Inline Echoing
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Recho allows you to echo output inline with your code. This is useful for
 * quickly inspecting your variables and display the output as comments. Each
 * line of output is prefixed with `//➜`.
 *
 * To echo output, you can use the `echo` function:
 */

echo("Hello, World!");

/**
 * The `echo` function returns the value as is, so you can define a echoing
 * variable like this:
 */

const message = echo("Hello, World!");

/**
 * You can echo all kinds of values, including numbers, strings, arrays, objects,
 * functions, classes, maps, sets, dates, and more.
 */

const array = echo([1, 2, 3]);

const object = echo({a: 1, b: 2});

const foo = echo(function add(a, b) {
  return a + b;
});

/**
 * Refer to https://recho.dev/docs/inline-echoing for more details.
 *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                             Reactive Blocks
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Blocks are the fundamentals of Recho's reactive system. Each top-level
 * statement is a block. The output always appears above the block. Once the
 * upstream blocks change, the downstream blocks will be re-evaluated.
 *
 * For example, if you update the value of `a`, then click the run button, `b`
 * will be re-evaluated.
 */

const a = 1;

const b = echo(a + 1);

/**
 * A best practice is using **Block Statements** to group related blocks
 * together for complex echoing.
 */

{
  let output = "";
  for (let i = 0; i < 10; i++) {
    output += String.fromCharCode(97 + i);
  }
  echo(output);
}

/**
 * Unlike vanilla JavaScript, you can define blocks in any order. Recho will
 * automatically execute the blocks in the correct order.
 */

echo(c);

const c = "I'll be executed first!";

/**
 * !! NOTE: You should not use **let** to define top-level variables for now !!
 *
 * Refer to https://recho.dev/docs/reactive-blocks for more details.
 *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                             Animations Authoring
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Recho provides two built-in functions to create fluid animations. The first
 * one is `recho.now()`, which returns a generator that yields the current time
 * continuously.
 */

const now = recho.now();

echo(now);

/**
 * You can define a variable that depends on `now`. Once it changes, the
 * variable will be re-evaluated, resulting in a fluid animation.
 */

const x = echo(Math.abs(~~(Math.sin(now / 1000) * 22)));

echo("~".repeat(x) + "(๑•̀ㅂ•́)و✧");

/**
 * The second one is `recho.interval(milliseconds)`, which returns a generator
 * that yields values at a specified interval. For example, let's create a
 * counter:
 */

const counter = recho.interval(1000);

echo(counter);

/**
 * Refer to https://recho.dev/docs/fluid-animation for more details.
 *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                           Asynchronous Operations
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * There are some asynchronous operations that you need to handle, such as
 * fetching data from an API, requiring external packages, or waiting for a
 * user action. These operations can be represented as promises in JavaScript.
 * If a top-level variable is a promise, the value is the resolved value of the
 * promise, instead of the promise itself.
 */

const string = new Promise((resolve) => setTimeout(() => resolve("I'm a string!"), 1000));

echo(string);

/**
 * If one of the upstream blocks is a promise, the downstream blocks will wait
 * for the promise to be resolved before being evaluated. For example, let's
 * fetch data from an mock API and post-process it.
 */

const numbers = new Promise((resolve) => setTimeout(() => resolve([1, 2, 3]), 1000));
const scale = 2;

const sum = echo(numbers.reduce((a, b) => a + scale * b, 0));

/**
 * Refer to https://recho.dev/docs/asynchronous-operations for more details.
 *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                           Libraries Imports
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Recho allows you to import external browser-based libraries using the
 *  `recho.require` function. The import specifiers must be valid npm package
 * names with optional version specifiers.
 *
 * For example, let's import the `d3` package:
 */

const d3 = recho.require("d3");

echo(d3.range(10));

/**
 * This is quite useful when you want to create something complex! Refer to
 * https://recho.dev/docs/libraries-requiring for more details.
 *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                           Errors Handling
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Errors are echoed as normal output. For syntax errors, they will be
 * positioned at the beginning of the sketch. For runtime errors, they will be
 * positioned above the block that caused the error.
 */

{
  const a = 1;
  a = 2;
}

/**
 * Refer to https://recho.dev/docs/errors-handling for more details.
 *
 *   ____                            _         _       _   _
 *  / ___|___  _ __   __ _ _ __ __ _| |_ _   _| | __ _| |_(_) ___  _ __  ___
 * | |   / _ \| '_ \ / _` | '__/ _` | __| | | | |/ _` | __| |/ _ \| '_ \/ __|
 * | |__| (_) | | | | (_| | | | (_| | |_| |_| | | (_| | |_| | (_) | | | \__ \
 *  \____\___/|_| |_|\__, |_|  \__,_|\__|\__,_|_|\__,_|\__|_|\___/|_| |_|___/
 *                   |___/
 *
 * You've already mastered the basics of Recho! We highly recommend you to go
 * to the editor: https://recho.dev and start creating your own sketches!
 *
 * If you need inspiration, you can check out the examples page:
 * https://recho.dev/examples to see what you can create with Recho.
 *
 * Of course, we'll not stop you if you want to dive into the details of Recho.
 *
 * Hackers and painters, let's paint by code!
 */
