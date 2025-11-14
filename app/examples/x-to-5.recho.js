/**
 * @title X to 5
 * @author Bairui Su
 * @created 2025-11-13
 * @pull_request 193
 * @github pearmini
 * @thumbnail_start 23
 * @label Algorithm, Beginner
 */

/**
 * ============================================================================
 * =                            X to 5                                        =
 * ============================================================================
 *
 * This example demonstrates how to use `echo.key()` to track values across
 * multiple iterations. When you use the same key for different values across
 * iterations, they are displayed in a table format where each key becomes a row.
 *
 * This makes it easy to visualize how variables change over time in loops or
 * iterative algorithms.
 */

//➜ +-------+---+---+----+
//➜ | {x^1} | 0 | 1 |  2 |
//➜ |-------|---|---|----|
//➜ | {x^2} | 0 | 1 |  4 |
//➜ |-------|---|---|----|
//➜ | {x^3} | 0 | 1 |  8 |
//➜ |-------|---|---|----|
//➜ | {x^4} | 0 | 1 | 16 |
//➜ |-------|---|---|----|
//➜ | {x^5} | 0 | 1 | 32 |
//➜ +-------+---+---+----+
{
  let x = 0;
  while (x < 3) {
    echo.key("x^1")(x ** 1);
    echo.key("x^2")(x ** 2);
    echo.key("x^3")(x ** 3);
    echo.key("x^4")(x ** 4);
    echo.key("x^5")(x ** 5);
    x++;
  }
}
