import {StateField, StateEffect} from "@codemirror/state";

/**
 * Effect to set block attributes
 * @type {StateEffect<{from: number, to: number, attributes: Object}[]>}
 */
export const setBlockAttributesEffect = StateEffect.define();

/**
 * StateField that stores block attributes keyed by line ranges
 * Structure: Array of {from, to, attributes}
 * @type {StateField<{from: number, to: number, attributes: Object}[]>}
 */
export const blockAttributesField = StateField.define({
  create() {
    return [];
  },
  update(blocks, tr) {
    // If document changed, map existing blocks to new positions
    if (tr.docChanged) {
      blocks = blocks.map(block => ({
        from: tr.changes.mapPos(block.from),
        to: tr.changes.mapPos(block.to),
        attributes: block.attributes,
      }));
    }

    // Check for setBlockAttributesEffect
    for (const effect of tr.effects) {
      if (effect.is(setBlockAttributesEffect)) {
        blocks = effect.value;
      }
    }

    return blocks;
  },
});

export const blockAttributes = blockAttributesField.extension;
