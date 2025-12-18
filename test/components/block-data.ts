import {blockMetadataField} from "../../editor/blockMetadata.ts";
import type {EditorView} from "@codemirror/view";

export interface BlockData {
  id: string;
  name: string;
  index: number;
  sourceFrom: number;
  sourceTo: number;
  outputFrom: number | null;
  outputTo: number | null;
  hasError: boolean;
  attributes: Record<string, unknown>;
}

export function extractBlockData(view: EditorView): BlockData[] {
  const blockMetadata = view.state.field(blockMetadataField, false);
  if (!blockMetadata) return [];

  return blockMetadata.map((block, index) => ({
    id: block.id,
    name: block.name,
    index,
    sourceFrom: block.source.from,
    sourceTo: block.source.to,
    outputFrom: block.output?.from ?? null,
    outputTo: block.output?.to ?? null,
    hasError: block.error || false,
    attributes: block.attributes || {},
  }));
}
