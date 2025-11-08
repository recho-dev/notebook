/**
 * @title API Reference
 * @order 9
 */

/**
 * ============================================================================
 * =                            API Reference                                =
 * ============================================================================
 *
 * Recho Notebook provides a set of APIs to help you create reactive notebooks
 * and interactive visualizations. This page provides an overview of all
 * available APIs.
 *
 * Click on any API below to see detailed documentation and examples.
 */

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                              Core APIs
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

// echo(...values) - Echo values inline with your code as comments
// See: https://recho.dev/notebook/docs/api-echo

// recho.inspect(value[, options]) - Format values for inspection
// See: https://recho.dev/notebook/docs/api-inspect

// echo.clear() - Clear the output of the current block
// See: https://recho.dev/notebook/docs/api-echo-clear

// invalidation() - Promise that resolves before re-running the current block
// See: https://recho.dev/notebook/docs/api-invalidation

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                            Reactive APIs
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

// recho.now() - Generator that yields the current time continuously
// See: https://recho.dev/notebook/docs/api-now

// recho.interval(milliseconds) - Generator that yields values at intervals
// See: https://recho.dev/notebook/docs/api-interval

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                            Import APIs
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

// recho.require(...names) - Import JavaScript packages from npm
// See: https://recho.dev/notebook/docs/api-require

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                          Interactive Controls
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

// recho.toggle(value) - Interactive toggle (checkbox) control
// See: https://recho.dev/notebook/docs/api-toggle

// recho.radio(index, options) - Interactive radio button group
// See: https://recho.dev/notebook/docs/api-radio

// recho.number(value[, options]) - Interactive number input control
// See: https://recho.dev/notebook/docs/api-number

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                            Quick Example
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

// Here's a quick example combining multiple APIs:

const count = recho.number(0, {min: 0, max: 10, step: 1});

const isRunning = recho.toggle(false);

const speed = recho.radio(1, ["slow", "medium", "fast"]);

//➜ "Count: 0, Status: stopped, Speed: medium"
echo(`Count: ${count}, Status: ${isRunning ? "running" : "stopped"}, Speed: ${speed}`);
