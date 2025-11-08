/**
 * @title Find the Maximum Random Number
 * @author Bairui Su
 * @created 2025-09-26
 * @pull_request 125
 * @github pearmini
 * @thumbnail_start 22
 */

/**
 * ============================================================================
 * =                        Find the Maximum Random Number                    =
 * ============================================================================
 *
 * This example shows Recho is a reactive programming environment. Try to
 * change the value of `t`, click the run button and see how the `scale` block
 * is re-evaluated. Meanwhile, you'll notice that the random numbers and the 
 * maximum value don't change, which means only parts of this program re-run --
 * specifically the definition of the scale value (let t = 1) and other places
 * that reference it (const scale = max * t).
 */

//➜ [ "0.70", "0.42", "0.93", "0.50", "0.59", "0.89", "0.03", "0.85", "0.38", "0.21" ]
let numbers = echo(new Array(10).fill(0).map(() => Math.random().toFixed(2)));

//➜ 0.93
let max = echo(Math.max(...numbers));

let t = 10;

//➜ 9.3
const scale = echo(max * t);
