/**
 * @title Reactive Blocks
 * @order 4
 */

/**
 * ============================================================================
 * =                            Reactive Blocks                               =
 * ============================================================================
 *
 * Reactive blocks are the fundamentals of Recho Notebook's reactive system, 
 * which is built on the reactive model of Observable Notebook Kit[1].
 *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                            Top-level Statements
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Each top-level statement is a block, such as Variable Declaration,
 * ExpressionStatement, ForStatement, IfStatement, and more. The output of a
 * block always appears above the block.
 */

//➜ 1
const declaration = echo(1);

//➜ 0.13787417441979044
echo(Math.random());

//➜ 0
//➜ 1
//➜ 2
for (let i = 0; i < 3; i++) echo(i);

//➜ "Odd"
if (Date.now() % 2 === 0) echo("Even");
else echo("Odd");

/**
 * A best practice is using **Block Statements** to group related blocks to
 * have a single output. Let's say we want to generate alphabets from "a" to
 * "z" and then echo them. We can do this:
 */

//➜ "abcdefghijklmnopqrstuvwxyz"
{
  let output = "";
  for (let i = 0; i < 26; i++) output += String.fromCharCode(97 + i);
  echo(output);
}

/**
 * !! NOTE: This can also avoid using `let` to define top-level mutable      !!
 * !! variables, which is not allowed in Recho Notebook yet.                 !!
 *
 * If you need to define a non-echoing top-level mutable variable, you can use
 * IIFE (Immediately Invoked Function Expression) to create a block and return
 * the variable.
 */

const alphabet = (() => {
  let output = "";
  for (let i = 0; i < 26; i++) output += String.fromCharCode(97 + i);
  return output;
})();

//➜ "abcdefghijklmnopqrstuvwxyz"
echo(alphabet);

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                             Reactive Data Flow
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * All the blocks run automatically like running a vanilla JavaScript script.
 * The difference is that blocks in Recho Notebook run in topological order 
 * determined by top-level variable references (a.k.a. **dataflow**), rather 
 * than the top-down document order[2].
 *
 * For example, we have three blocks: `sum`, `a`, and `b` in top-down order.
 * Since `sum` depends on `a` and `b`, it will be evaluated after `a` and `b`.
 */

//➜ 3
const sum = echo(a + b);
const a = 1;
const b = 2;

/**
 * Since code (blocks) runs independent of its order in notebook, you can 
 * arrange code however you want.
 *
 * In addition to that, when a block (`const sum = echo(a + b)`) references
 * top-level variables (`a` and `b`) defined by other blocks, the referencing
 * block automatically runs after the defining blocks. For example, you can
 * change the value of `a` or `b` and click ▶️ button to see the updated value
 * of `sum`.
 *
 * Note that all the evaluation of blocks is **incremental**, which means that
 * only the blocks that are affected by the changes will be re-evaluated. For
 * example, if you change the constant value from `1` to `2` and click ▶️
 * button, the `random` block will still display the same random value.
 */

//➜ 1
const constant = echo(1);

//➜ 0.6058679147506848
const random = echo(Math.random());

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                            "Cleaning Up" Block
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * With reactive evaluation, blocks can run multiple times. If you need to
 * "clear up" a block, say to cancel an animation loop or close a socket, use
 * the invalidation promise to register a disposal hook.
 */

//➜ 9
{
  let count = echo(10);

  const timer = setInterval(() => {
    if (count-- <= 0) clearInterval(timer);
    else {
      clear();
      echo(count);
    }
  }, 1000);

  // Clear the interval when the block is re-run.
  invalidation.then(() => clearInterval(timer));
}

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                                References
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * - [1] Observable Notebook Kit: https://github.com/observablehq/notebook-kit
 * - [2] Observable Framework: https://observablehq.com/framework/reactivity
 */
