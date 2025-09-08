/**
 * @title Errors Handling
 * @order 8
 */

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                           Errors Handling
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Errors are echoed as normal output. There are two types of errors in Recho:
 * syntax errors and runtime errors.
 *
 * For syntax errors, they will be positioned at the beginning of the sketch.
 * The sketch will not run until the syntax error is fixed.
 * 
 * You can fix the following syntax error by removing the prefix `1` for the 
 * variable name, then click the ▶️ button.
 */

{
  const 1a = 1;
}

/**
 * After fixing the above syntax error, you will be able to see the following 
 * runtime errors.
 * 
 * For runtime errors, they will be positioned above the block that caused the
 * error. Try to fix the following runtime errors to see the errors being
 * cleared!
 */

//➜ { [TypeError: Assignment to constant variable.] [Symbol(next.console.error.digest)]: "NEXT_CONSOLE_ERROR" }
{
  const a = 1;
  a = 2;
}

{
  echo(a);
  const a = 2;
}
