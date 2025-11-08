/**
 * @title recho.interval(milliseconds)
 * @order 15
 */

/**
 * ============================================================================
 * =                      recho.interval(milliseconds)                       =
 * ============================================================================
 *
 * Returns a generator that yields values at a specified interval.
 *
 * @param {number} milliseconds - The interval in milliseconds.
 * @returns {Generator<number>}
 */

const interval = recho.interval(1000);

//➜ 1
echo(interval);

