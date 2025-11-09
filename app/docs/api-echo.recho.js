/**
 * @title echo(...values)
 */

/**
 * ============================================================================
 * =                            echo(...values)                              =
 * ============================================================================
 *
 * Echos one or more values inline with your code as comments. If only one
 * value is provided, return the value itself. If multiple values are provided,
 * return all the values as an array.
 *
 * @param {...any} values - The values to echo.
 * @returns {any} The values if multiple values are provided, or the single value.
 */

//➜ "Hello, World!"
echo("Hello, World!");

//➜ 1 2 3
echo(1, 2, 3);

//➜ Peter:  Age = 20
//➜         Height = 180
echo("Peter: ", "Age = 20\nHeight = 180");

const a = echo(1 + 2);

//➜ 3
echo(a);

const numbers = echo(1, 2, 3);

//➜ [ 1, 2, 3 ]
echo(numbers);
