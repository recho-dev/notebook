import {useState} from "react";
import type {TransactionData} from "./types.ts";

export function SelectionGroupItem({transactions}: {transactions: TransactionData[]}) {
  const [isOpen, setIsOpen] = useState(false);

  const formatTime = (timestamp: number) => {
    const time = new Date(timestamp);
    return (
      time.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }) +
      "." +
      time.getMilliseconds().toString().padStart(3, "0")
    );
  };

  const count = transactions.length;
  const firstTr = transactions[0]!;
  const lastTr = transactions[transactions.length - 1]!;

  const summaryLeft = `#${lastTr.index}-${firstTr.index} [select] (${count} transactions)`;
  const summaryRight = `${formatTime(lastTr.timestamp)} - ${formatTime(firstTr.timestamp)}`;

  return (
    <details
      open={isOpen}
      onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
      className="mb-2 border border-gray-300 rounded text-xs bg-gray-50"
    >
      <summary className="px-2 py-1.5 cursor-pointer hover:bg-gray-100 flex justify-between items-center">
        <span className="font-mono font-medium">{summaryLeft}</span>
        <span className="text-gray-500">{summaryRight}</span>
      </summary>
      <div className="px-2 py-2 bg-white border-t border-gray-200">
        {transactions.map((tr) => {
          const selectionInfo = tr.selection
            .map((range) => {
              const isCursor = range.from === range.to;
              return isCursor ? `cursor at ${range.from}` : `${range.from}-${range.to}`;
            })
            .join(", ");

          return (
            <div
              key={tr.index}
              className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0"
            >
              <span className="font-mono">#{tr.index}</span>
              <span className="flex-1 mx-2 text-gray-600">{selectionInfo}</span>
              <span className="text-gray-400 text-xs">{formatTime(tr.timestamp)}</span>
            </div>
          );
        })}
      </div>
    </details>
  );
}
