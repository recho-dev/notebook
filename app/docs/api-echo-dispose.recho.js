/**
 * @title echo.dispose(callback)
 */

/**
 * ============================================================================
 * =                          echo.dispose(callback)                         =
 * ============================================================================
 *
 * Registers a disposal callback that runs before re-running the current block.
 *
 * @param {Function} callback - The function to call on disposal
 */

// Example 1:
// Change the value of count and click the run button to see the alert.
const count = 0;

{
  echo(count);
  echo.dispose(() => alert("Previous Value: " + count));
}

// Example 2:
// It can be used to clean up resources like intervals.
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

  echo.dispose(() => clearInterval(timer));
}
