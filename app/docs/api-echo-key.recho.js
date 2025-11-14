/**
 * @title echo.key(key)
 */

/**
 * ============================================================================
 * =                            echo.key(key)                                 =
 * ============================================================================
 *
 * Specifies a key for the following output values. When multiple values are
 * echoed with the same key across iterations, they are displayed in a table
 * format where each key becomes a row.
 *
 * @param {string} key - The key to assign to the following output values.
 * @returns {Function} The echo function, allowing method chaining.
 */

// Example 1:
// Use echo.key() to track variables across iterations in a loop.
function binarySearch(key, array) {
  let lo = 0;
  let hi = array.length - 1;
  while (lo <= hi) {
    const mi = (lo + hi) >>> 1;
    const val = array[mi];
    echo.key("lo")(lo);
    echo.key("hi")(hi);
    echo.key("mi")(mi);
    echo.key("val")(val);
    if (val < key) lo = mi + 1;
    else if (val > key) hi = mi - 1;
    else return mi;
  }
  return -1;
}

//➜ +-------+-----+-----+-----+
//➜ |  {lo} |   0 |   3 |   3 |
//➜ |-------|-----|-----|-----|
//➜ |  {hi} |   5 |   5 |   3 |
//➜ |-------|-----|-----|-----|
//➜ |  {mi} |   2 |   4 |   3 |
//➜ |-------|-----|-----|-----|
//➜ | {val} | "c" | "e" | "d" |
//➜ +-------+-----+-----+-----+
binarySearch("d", ["a", "b", "c", "d", "e", "f"]);

// Example 2:
// Keys can be used to track any values across multiple calls.
{
  let x = 0;
  while (x < 3) {
    echo.key("x")(x);
    echo.key("square")(x * x);
    echo.key("cube")(x * x * x);
    x++;
  }
}

//➜ +--------+-----+-----+-----+
//➜ |    {x} |   0 |   1 |   2 |
//➜ |--------|-----|-----|-----|
//➜ |{square}|   0 |   1 |   4 |
//➜ |--------|-----|-----|-----|
//➜ | {cube} |   0 |   1 |   8 |
//➜ +--------+-----+-----+-----+
