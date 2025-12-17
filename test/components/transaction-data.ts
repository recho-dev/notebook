import { blockMetadataEffect } from "../../editor/blockMetadata.ts";
import type { BlockMetadata } from "../../editor/blocks/BlockMetadata.ts";
import { Transaction as Tr } from "@codemirror/state";

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

export function extractTransactionData(tr: Tr, index: number): TransactionData {
  const data: TransactionData = {
    index,
    docChanged: tr.docChanged,
    changes: [],
    annotations: {},
    effects: [],
    selection: tr.state.selection.ranges.map((r) => ({
      from: r.from,
      to: r.to,
      anchor: r.anchor,
      head: r.head,
    })),
    scrollIntoView: tr.scrollIntoView,
    timestamp: Date.now(),
    blockMetadata: null,
  };

  // Extract changes
  tr.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
    const fromLine = tr.startState.doc.lineAt(fromA);
    const toLine = tr.startState.doc.lineAt(toA);

    data.changes.push({
      from: fromA,
      to: toA,
      fromLine: fromLine.number,
      fromCol: fromA - fromLine.from,
      toLine: toLine.number,
      toCol: toA - toLine.from,
      insert: inserted.toString(),
    });
  });

  // Extract annotations
  const userEvent = tr.annotation(Tr.userEvent);
  if (userEvent !== undefined) {
    data.annotations.userEvent = userEvent;
  }

  const remote = tr.annotation(Tr.remote);
  if (remote !== undefined) {
    data.annotations.remote = remote;
  }

  const addToHistory = tr.annotation(Tr.addToHistory);
  if (addToHistory !== undefined) {
    data.annotations.addToHistory = addToHistory;
  }

  for (const effect of tr.effects) {
    if (effect.is(blockMetadataEffect)) {
      data.blockMetadata = Array.from(effect.value);
    } else {
      data.effects.push({
        value: effect.value,
        type: "StateEffect",
      });
    }
  }

  return data;
}