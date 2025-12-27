import {useState, useEffect, useRef, useMemo} from "react";
import {SelectionGroupItem} from "./SelectionGroupItem.tsx";
import type {TransactionData, TransactionGroup} from "./transaction-data.ts";
import {TransactionItem} from "./TransactionItem.tsx";
import type {List} from "immutable";

export type TransactionViewerProps = {
  transactions: List<TransactionData>;
  onClear: () => void;
};

export function TransactionViewer({transactions, onClear}: TransactionViewerProps) {
  const [autoScroll, setAutoScroll] = useState(true);
  const [showEffects, setShowEffects] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && listRef.current) {
      listRef.current.scrollTo({top: listRef.current.scrollHeight, behavior: "smooth"});
    }
  }, [transactions, autoScroll]);

  const filteredTransactions = useMemo(() => {
    return showEffects ? transactions : transactions.filter((tr) => tr.effects.length === 0);
  }, [transactions, showEffects]);

  const groupedTransactions = useMemo(() => {
    const groups: TransactionGroup[] = [];
    let currentGroup: TransactionGroup | null = null;
    filteredTransactions.forEach((tr) => {
      const isSelection = tr.annotations.userEvent === "select" || tr.annotations.userEvent === "select.pointer";
      if (isSelection) {
        if (currentGroup && currentGroup.type === "selection") {
          currentGroup.transactions.push(tr);
        } else {
          currentGroup = {type: "selection", transactions: [tr]};
          groups.push(currentGroup);
        }
      } else {
        groups.push({type: "individual", transaction: tr});
        currentGroup = null;
      }
    });
    return groups;
  }, [filteredTransactions]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Transactions</h3>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onClear}
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
        {transactions.size === 0 ? (
          <div className="text-sm text-gray-500 text-center py-4">No transactions yet</div>
        ) : (
          groupedTransactions.map((group) =>
            group.type === "individual" ? (
              <TransactionItem key={`tr-${group.transaction.timestamp}`} transaction={group.transaction!} />
            ) : (
              <SelectionGroupItem key={`group-${group.transactions[0].timestamp}`} transactions={group.transactions!} />
            ),
          )
        )}
      </div>
    </div>
  );
}
