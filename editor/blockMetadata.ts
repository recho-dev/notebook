import {StateField, StateEffect} from "@codemirror/state";

export const blockMetadataEffect = StateEffect.define<BlockMetadata[]>();

type BlockMetadata = {
  output: {from: number; to: number} | null;
  source: {from: number; to: number};
  attributes: Record<string, unknown>;
};

export const blockMetadataField = StateField.define<BlockMetadata[]>({
  create() {
    return [];
  },
  update(blocks, tr) {
    // Find if the block attributes effect is present.
    let blocksFromEffect: BlockMetadata[] | null = null;
    for (const effect of tr.effects) {
      if (effect.is(blockMetadataEffect)) {
        blocksFromEffect = effect.value;
        break;
      }
    }

    if (blocksFromEffect === null) {
      // If the block attributes effect is not present, then this transaction
      // is made by the user, we need to update the block attributes accroding
      // to the latest syntax tree. TODO
      return blocks;
    } else {
      // Otherwise, we need to update the block attributes according to the
      // metadata sent from the runtime. Most importantly, we need to translate
      // the position of each block after the changes has been made.
      for (const block of blocksFromEffect) {
        if (block.output === null) {
          const from = tr.changes.mapPos(block.source.from, -1);
          const to = tr.changes.mapPos(block.source.from, 1);
          block.output = {from, to: to - 1};
        } else {
          const from = tr.changes.mapPos(block.output.from, -1);
          const to = tr.changes.mapPos(block.output.to, 1);
          block.output = {from, to: to - 1};
        }
        block.source = {
          from: tr.changes.mapPos(block.source.from, 1),
          to: tr.changes.mapPos(block.source.to, 1),
        };
      }
      return blocksFromEffect;
    }
  },
});

export const blockMetadata = blockMetadataField.extension;
