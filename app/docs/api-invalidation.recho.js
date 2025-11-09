/**
 * @title invalidation()
 */

/**
 * ============================================================================
 * =                            invalidation()                               =
 * ============================================================================
 *
 * Returns a promise that resolves before re-running the current block.
 *
 * @returns {Promise<void>}
 */

//➜ 9
{
  let count = echo(10);

  const timer = setInterval(() => {
    if (count-- <= 0) clearInterval(timer);
    else {
      echo.clear();
      echo(count);
    }
  }, 1000);

  invalidation.then(() => clearInterval(timer));
}
