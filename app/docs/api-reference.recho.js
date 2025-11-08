/**
 * @title API Reference
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
 * 
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                                Core APIs
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * - echo(...values) - Echo values inline with your code as comments (https://recho.dev/notebook/docs/api-echo)
 * - echo.clear() - Clear the output of the current block (https://recho.dev/notebook/docs/api-echo-clear)
 * - invalidation() - Promise that resolves before re-running the current block (https://recho.dev/notebook/docs/api-invalidation)
 * - recho.inspect(value[, options]) - Format values for inspection (https://recho.dev/notebook/docs/api-inspect)
 *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                                 Inputs
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * - recho.toggle(value) - Interactive toggle (checkbox) control (https://recho.dev/notebook/docs/api-toggle)
 * - recho.radio(index, options) - Interactive radio button group (https://recho.dev/notebook/docs/api-radio)
 * - recho.number(value[, options]) - Interactive number input control (https://recho.dev/notebook/docs/api-number)
 * 
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                               Generators
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * - recho.now() - Generator that yields the current time continuously (https://recho.dev/notebook/docs/api-now)
 * - recho.interval(milliseconds) - Generator that yields values at intervals (https://recho.dev/notebook/docs/api-interval)
 * 
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                                Helpers
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * - recho.require(...names) - Import JavaScript packages from npm (https://recho.dev/notebook/docs/api-require)
 */
