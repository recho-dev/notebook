import { atom } from "jotai";

// Types
export interface Transaction {
  time: number;
  docChanged: boolean;
  selection: { from: number; to: number } | null;
  effects: string[];
  annotations: string[];
}

export interface TestSample {
  name: string;
  code: string;
}

// Atoms
export const selectedTestAtom = atom<string>("helloWorld");
export const transactionHistoryAtom = atom<Transaction[]>([]);
export const autoScrollAtom = atom<boolean>(true);

// Factory functions for state operations
export function createTransaction(data: {
  time: number;
  docChanged: boolean;
  selection: { from: number; to: number } | null;
  effects: string[];
  annotations: string[];
}): Transaction {
  return {
    time: data.time,
    docChanged: data.docChanged,
    selection: data.selection,
    effects: data.effects,
    annotations: data.annotations,
  };
}

export function addTransaction(
  history: Transaction[],
  transaction: Transaction
): Transaction[] {
  const newHistory = [...history, transaction];
  // Keep max 100 transactions
  if (newHistory.length > 100) {
    return newHistory.slice(-100);
  }
  return newHistory;
}

export function clearTransactionHistory(): Transaction[] {
  return [];
}

export function getTestSampleName(key: string): string {
  // Convert camelCase to Title Case with spaces
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}
