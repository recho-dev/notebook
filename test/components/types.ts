import type {PluginValue, ViewPlugin} from "@codemirror/view";
import type {BlockMetadata} from "../../editor/blocks/BlockMetadata.ts";

export interface BlockData {
  name: string;
  index: number;
  sourceFrom: number;
  sourceTo: number;
  outputFrom: number | null;
  outputTo: number | null;
  hasError: boolean;
  attributes: Record<string, unknown>;
}

export interface TransactionRange {
  from: number;
  to: number;
  anchor: number;
  head: number;
}

export interface TransactionChange {
  from: number;
  to: number;
  fromLine: number;
  fromCol: number;
  toLine: number;
  toCol: number;
  insert: string;
}

export interface TransactionEffect {
  value: unknown;
  type: string;
}

export interface TransactionData {
  index: number;
  docChanged: boolean;
  changes: TransactionChange[];
  annotations: Record<string, unknown>;
  effects: TransactionEffect[];
  selection: TransactionRange[];
  scrollIntoView?: boolean;
  timestamp: number;
  blockMetadata: BlockMetadata[] | null;
}

export type TransactionGroup =
  | {
      type: "individual";
      transaction: TransactionData;
    }
  | {
      type: "selection";
      transactions: TransactionData[];
    };

export interface TransactionViewerProps {
  onPluginCreate: (plugin: ViewPlugin<PluginValue>) => void;
}
