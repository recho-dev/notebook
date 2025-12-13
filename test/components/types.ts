import type {ViewPlugin} from "@codemirror/view";

export interface BlockData {
  name: string;
  index: number;
  sourceFrom: number;
  sourceTo: number;
  outputFrom: number | null;
  outputTo: number | null;
  hasError: boolean;
  attributes: Record<string, any>;
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
  value: any;
  type: string;
  blockMetadata?: any[];
}

export interface TransactionData {
  index: number;
  docChanged: boolean;
  changes: TransactionChange[];
  annotations: Record<string, any>;
  effects: TransactionEffect[];
  selection: TransactionRange[];
  scrollIntoView?: boolean;
  timestamp: number;
}

export interface TransactionGroup {
  type: "individual" | "selection";
  transaction?: TransactionData;
  transactions?: TransactionData[];
}

export interface TransactionViewerProps {
  onPluginCreate: (plugin: ViewPlugin<any>) => void;
}
