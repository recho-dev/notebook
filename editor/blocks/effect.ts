import {StateEffect} from "@codemirror/state";
import {BlockMetadata} from "./BlockMetadata.ts";

export const blockMetadataEffect = StateEffect.define<BlockMetadata[]>();
