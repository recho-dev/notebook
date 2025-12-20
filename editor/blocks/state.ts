import {StateField} from "@codemirror/state";
import {BlockMetadata} from "./BlockMetadata.ts";
import {blockMetadataEffect} from "./effect.ts";
import {updateBlocks} from "./update.ts";

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
      // to the latest syntax tree.
      return updateBlocks(blocks, tr);
    } else {
      // Otherwise, we need to update the block attributes according to the
      // metadata sent from the runtime. Most importantly, we need to translate
      // the position of each block after the changes has been made.
      return blocksFromEffect.map((block) => block.map(tr));
    }
  },
});

export const blockMetadataExtension = blockMetadataField.extension;
