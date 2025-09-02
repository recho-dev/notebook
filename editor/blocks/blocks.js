import {syntaxTree} from "@codemirror/language";
import {EditorState, StateField} from "@codemirror/state";

/**
 * @type {StateField<{ id: string, code: string }[]>}
 */
export const blocksField = StateField.define({
  /**
   * Creates the initial value for the field when a state is created.
   * @param {EditorState} state
   */
  create(state) {
    return getBlocks(state);
  },

  update(value, tr) {
    return tr.docChanged ? getBlocks(tr.state) : value;
  },
});

/**
 * Traverse the syntax tree of the editor state and collect all blocks.
 * @param {EditorState} state
 */
function getBlocks(state) {
  syntaxTree(state).iterate({
    enter: (node) => {
      // Always traverse the root node.
      if (node.matchContext([])) return true;
      // Do not traverse nodes that deeper than the top-level nodes.
      if (!node.matchContext(["Script"])) return false;
      console.log(`Traversing ${node.name}`);
    },
  });
}
