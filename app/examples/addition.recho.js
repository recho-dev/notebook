/**
 * @title Addition
 * @author Bairui Su
 * @created 2025-09-26
 * @pull_request 124
 * @github pearmini
 * @thumbnail_start 17
 * @label Algorithm, Beginner
 */

/**
 * ============================================================================
 * =                                Addition                                  =
 * ============================================================================
 *
 * This example shows Recho's core feature: inline echoing. You can `echo` a 
 * value directly at the point of definition or anywhere in your code.
 */

const a = 1;

//➜ 2
const b = echo(a + 1);

const c = a + b;

//➜ 3
echo(c);