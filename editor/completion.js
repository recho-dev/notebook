import {syntaxTree} from "@codemirror/language";

function documentation(source) {}

function toApplyCompletion(template) {
  const offset = template.indexOf("$");
  const insert = offset < 0 ? template : template.slice(0, offset) + template.slice(offset + 1);
  return (view, _completion, from, to) => {
    view.dispatch({
      changes: [{from, to, insert}],
      selection: offset < 0 ? {anchor: from + template.length} : {anchor: from + offset},
    });
  };
}

/** @type {import("@codemirror/autocomplete").Completion} */
const builtinFunctions = [
  {
    label: "echo",
    type: "function",
    detail: "(value: any)",
    info: "Echos the output above the current block.",
    apply: toApplyCompletion("echo($)"),
  },
  {
    label: "clear",
    type: "function",
    detail: "()",
    info: "Clears the output of the current block.",
    apply: toApplyCompletion("clear()"),
  },
  {
    label: "invalidation",
    type: "function",
    detail: "()",
    info: "Returns a promise that resolves before re-running the current block.",
    apply: toApplyCompletion("invalidation()"),
  },
  {
    label: "now",
    type: "function",
    detail: "()",
    info: "Returns a generator that yields the current time continuously.",
    apply: toApplyCompletion("recho.now()"),
  },
  {
    label: "interval",
    type: "function",
    detail: "(intervalInMilliseconds: number)",
    info: "Returns a generator that yields values at a specified interval.",
    apply: toApplyCompletion("recho.interval($)"),
  },
  {
    label: "require",
    detail: "(...names: string[])",
    type: "function",
    info: "Imports one or more JavaScript packages. The import specifiers must be valid npm package names with optional version specifiers.",
    apply: toApplyCompletion('recho.require("$")'),
  },
  {
    label: "toggle",
    detail: "(value: boolean)",
    type: "function",
    info: "Display an interactive toggle in the editor.",
    apply: toApplyCompletion("recho.toggle($)"),
  },
  {
    label: "slider",
    detail: "(value: number, options?: { min?: number, max?: number, step?: number })",
    type: "function",
    info: "Display an interactive slider in the editor.",
    apply: toApplyCompletion("recho.slider($)"),
  },
  {
    label: "mask",
    detail: "(value: string)",
    type: "function",
    info: "Mask a string value in the editor",
    apply: toApplyCompletion("recho.mask($)"),
  },
];

/**
 *
 * @param {import("@codemirror/autocomplete").CompletionContext} context
 * @returns {import("@codemirror/autocomplete").CompletionResult | null}
 */
export function rechoCompletion(context) {
  const tree = syntaxTree(context.state);
  const nodeBefore = tree.resolveInner(context.pos, -1);
  if (nodeBefore.name === "VariableName") {
    return {
      from: nodeBefore.from,
      validFor: /^(?:\w*)?$/,
      options: builtinFunctions,
    };
  } else if (nodeBefore.name === "BlockComment") {
    return {
      from: nodeBefore.from,
      validFor: /^(?:\w*)?$/,
      options: [
        {
          label: "/**",
          type: "comment",
          detail: " */",
          info: "Enters a comment block.",
          apply: toApplyCompletion("/**\n * $\n */"),
        },
      ],
    };
  } else {
    return null;
  }
}
