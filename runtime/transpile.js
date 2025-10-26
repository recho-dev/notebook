import {Parser} from "acorn";
import {recursive} from "acorn-walk";
import {Sourcemap} from "./sourcemap.js";

/**
 * Transforms echo function calls within JavaScript functions to ensure proper
 * echo context handling. For top-level function nodes, defines a local echo
 * variable. For nested function nodes, implements conditional echo resolution
 * to maintain correct execution context.
 *
 * Examples:
 *
 * Top-level function transformation:
 * ```js
 * const adder = () => (x, y) => echo(x, y);
 * const add = adder();
 * add(1, 2); // Uses the updated echo function context
 * ```
 *
 * Nested function transformation:
 * ```js
 * const asyncAdd = () => (x, y) => setTimeout(() => echo(x + y), 0);
 * const add = asyncAdd();
 * add(1, 2); // Preserves original echo function context
 * ```
 */
function rewriteEchoInFunction(input, output, body) {
  const echoNodes = [];
  const topLevelEchoNodes = [];
  const state = {depth: 0};
  recursive(body, state, {
    Function(node, state, c) {
      if (state.depth === 0) topLevelEchoNodes.push(node);
      else echoNodes.push(node);
      state.depth++;
      c(node.body, state);
      state.depth--;
    },
    // Skip transpilation of block statements while maintaining depth tracking.
    BlockStatement(node, state, c) {
      state.depth++;
      for (const statement of node.body) c(statement, state);
      state.depth--;
    },
  });

  for (const node of topLevelEchoNodes) {
    if (node.body.type !== "BlockStatement") {
      // Transform arrow function expression to block statement with echo context.
      // Input: (x, y) => echo(x, y)
      // Output: (x, y) => {const echo = __getEcho__(); return echo(x, y);}
      output.insertLeft(node.body.start, "{const echo = __getEcho__(); return ");
      output.insertLeft(node.body.end, "}");
    } else {
      // Inject echo context into existing block statement.
      // Input: (x, y) => {return echo(x, y);}
      // Output: (x, y) => {const echo = __getEcho__(); return echo(x, y);}
      output.insertLeft(node.body.start + 1, "const echo = __getEcho__();");
    }
  }

  for (const node of echoNodes) {
    if (node.body.type !== "BlockStatement") {
      // Transform nested arrow function with conditional echo resolution.
      // Input: () => echo(x, y);
      // Output: () => {if(__getEcho__()) {const echo = __getEcho__(); return echo(x, y);} return echo(x, y);}
      const source = input.slice(node.body.start, node.body.end);
      output.insertLeft(node.body.start, `{if(__getEcho__()) {const echo = __getEcho__(); return ${source};} return `);
      output.insertLeft(node.body.end, "}");
    } else {
      // Transform nested block statement with conditional echo resolution.
      // Input: () => {echo(x, y);}
      // Output: () => {if(__getEcho__()) {const echo = __getEcho__(); echo(x, y); return;} echo(x, y);}
      const source = input.slice(node.body.start + 1, node.body.end - 1);
      output.insertLeft(node.body.start + 1, `if(__getEcho__()) {const echo = __getEcho__(); ${source}; return;}`);
    }
  }
}

export function transpileRechoJavaScript(input) {
  const cell = Parser.parse(input, {ecmaVersion: "latest", sourceType: "module"});
  const output = new Sourcemap(input);
  rewriteEchoInFunction(input, output, cell);
  return String(output);
}
