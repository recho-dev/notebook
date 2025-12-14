import {useState, useEffect, useRef, useMemo} from "react";
import {ViewPlugin, ViewUpdate} from "@codemirror/view";
import {Transaction as Tr} from "@codemirror/state";
import {blockMetadataEffect} from "../../editor/blockMetadata.ts";
import {SelectionGroupItem} from "./SelectionGroupItem.tsx";
import type {TransactionData, TransactionGroup, TransactionViewerProps} from "./types.ts";
import {TransactionItem} from "./TransactionItem.tsx";

// Maximum number of transactions to keep in history
const MAX_HISTORY = 100;

function extractTransactionData(tr: Tr, index: number): TransactionData {
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

export function TransactionViewer({onPluginCreate}: TransactionViewerProps) {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showEffects, setShowEffects] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const nextIndexRef = useRef(0);

  useEffect(() => {
    const transactionsList: TransactionData[] = [];
    const listeners = new Set<(transactions: TransactionData[]) => void>();

    function notifyListeners() {
      listeners.forEach((fn) => fn([...transactionsList]));
    }

    const plugin = ViewPlugin.fromClass(
      class {
        constructor(view: any) {
          notifyListeners();
        }

        update(update: ViewUpdate) {
          update.transactions.forEach((tr: Tr) => {
            const transactionData = extractTransactionData(tr, nextIndexRef.current++);
            transactionsList.push(transactionData);

            if (transactionsList.length > MAX_HISTORY) {
              transactionsList.shift();
            }
          });

          if (update.transactions.length > 0) {
            notifyListeners();
          }
        }
      },
    );

    listeners.add((newTransactions) => {
      setTransactions(newTransactions);
    });

    onPluginCreate(plugin);

    return () => {
      listeners.clear();
    };
  }, [onPluginCreate]);

  useEffect(() => {
    if (autoScroll && listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [transactions, autoScroll]);

  const handleClear = () => {
    setTransactions([]);
    nextIndexRef.current = 0;
  };

  const filteredTransactions = useMemo(() => {
    return showEffects ? transactions : transactions.filter((tr) => tr.effects.length === 0);
  }, [transactions, showEffects]);

  const groupedTransactions = useMemo(() => {
    const groups: TransactionGroup[] = [];
    let currentGroup: TransactionGroup | null = null;

    for (let i = filteredTransactions.length - 1; i >= 0; i--) {
      const tr = filteredTransactions[i]!;
      const isSelection = tr.annotations.userEvent === "select" || tr.annotations.userEvent === "select.pointer";

      if (isSelection) {
        if (currentGroup && currentGroup.type === "selection") {
          currentGroup.transactions!.push(tr);
        } else {
          currentGroup = {
            type: "selection",
            transactions: [tr],
          };
          groups.push(currentGroup);
        }
      } else {
        groups.push({
          type: "individual",
          transaction: tr,
          transactions: undefined,
        });
        currentGroup = null;
      }
    }

    return groups;
  }, [filteredTransactions]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Transactions</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={handleClear}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Clear
          </button>
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded"
            />
            Auto-scroll
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={showEffects}
              onChange={(e) => setShowEffects(e.target.checked)}
              className="rounded"
            />
            Show Effects
          </label>
        </div>
      </div>
      <div ref={listRef} className="flex-1 overflow-y-auto p-2">
        {transactions.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-4">No transactions yet</div>
        ) : (
          groupedTransactions.map((group, idx) =>
            group.type === "individual" ? (
              <TransactionItem key={`tr-${group.transaction!.index}`} transaction={group.transaction!} />
            ) : (
              <SelectionGroupItem key={`group-${idx}`} transactions={group.transactions!} />
            ),
          )
        )}
      </div>
    </div>
  );
}
