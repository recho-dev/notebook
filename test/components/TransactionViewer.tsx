import {useState, useEffect, useRef} from "react";
import {ViewPlugin} from "@codemirror/view";
import {Transaction as CMTransaction} from "@codemirror/state";
import {blockMetadataEffect} from "../../editor/blockMetadata.ts";
import {cn} from "../../app/cn.js";

// Maximum number of transactions to keep in history
const MAX_HISTORY = 100;

interface TransactionRange {
  from: number;
  to: number;
  anchor: number;
  head: number;
}

interface TransactionChange {
  from: number;
  to: number;
  fromLine: number;
  fromCol: number;
  toLine: number;
  toCol: number;
  insert: string;
}

interface TransactionEffect {
  value: any;
  type: string;
  blockMetadata?: any[];
}

interface TransactionData {
  index: number;
  docChanged: boolean;
  changes: TransactionChange[];
  annotations: Record<string, any>;
  effects: TransactionEffect[];
  selection: TransactionRange[];
  scrollIntoView?: boolean;
  filter?: boolean;
  sequential?: boolean;
  timestamp: number;
}

interface TransactionGroup {
  type: "individual" | "selection";
  transaction?: TransactionData;
  transactions?: TransactionData[];
}

interface TransactionViewerProps {
  onPluginCreate: (plugin: ViewPlugin<any>) => void;
}

export function TransactionViewer({onPluginCreate}: TransactionViewerProps) {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const nextIndexRef = useRef(0);

  useEffect(() => {
    const transactionsList: TransactionData[] = [];
    const listeners = new Set<(transactions: TransactionData[]) => void>();

    function notifyListeners() {
      listeners.forEach((fn) => fn([...transactionsList]));
    }

    function extractTransactionData(tr: CMTransaction, index: number): TransactionData {
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
        filter: tr.filter,
        sequential: tr.sequential,
        timestamp: Date.now(),
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
      const userEvent = tr.annotation(CMTransaction.userEvent);
      if (userEvent !== undefined) {
        data.annotations.userEvent = userEvent;
      }

      const remote = tr.annotation(CMTransaction.remote);
      if (remote !== undefined) {
        data.annotations.remote = remote;
      }

      const addToHistory = tr.annotation(CMTransaction.addToHistory);
      if (addToHistory !== undefined) {
        data.annotations.addToHistory = addToHistory;
      }

      // Extract effects
      for (const effect of tr.effects) {
        const effectData: TransactionEffect = {
          value: effect.value,
          type: "StateEffect",
        };

        if (effect.is(blockMetadataEffect)) {
          effectData.type = "blockMetadataEffect";
          effectData.blockMetadata = effect.value;
        }

        data.effects.push(effectData);
      }

      return data;
    }

    const plugin = ViewPlugin.fromClass(
      class {
        constructor(view: any) {
          const initialTr: TransactionData = {
            index: nextIndexRef.current++,
            docChanged: false,
            changes: [],
            annotations: {},
            effects: [],
            selection: view.state.selection.ranges.map((r: any) => ({
              from: r.from,
              to: r.to,
              anchor: r.anchor,
              head: r.head,
            })),
            timestamp: Date.now(),
          };
          transactionsList.push(initialTr);
          notifyListeners();
        }

        update(update: any) {
          update.transactions.forEach((tr: CMTransaction) => {
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

  const groupTransactions = (): TransactionGroup[] => {
    const groups: TransactionGroup[] = [];
    let currentGroup: TransactionGroup | null = null;

    for (let i = transactions.length - 1; i >= 0; i--) {
      const tr = transactions[i];
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
        });
        currentGroup = null;
      }
    }

    return groups;
  };

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
        </div>
      </div>
      <div ref={listRef} className="flex-1 overflow-y-auto p-2">
        {transactions.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-4">No transactions yet</div>
        ) : (
          groupTransactions().map((group, idx) =>
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

function TransactionItem({transaction: tr}: {transaction: TransactionData}) {
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

  let summaryLeft = `#${tr.index}`;
  if (tr.annotations.userEvent) {
    summaryLeft += ` [${tr.annotations.userEvent}]`;
  } else if (tr.annotations.remote) {
    summaryLeft += ` [remote: ${JSON.stringify(tr.annotations.remote)}]`;
  }
  if (tr.docChanged) {
    summaryLeft += ` 📝`;
  }

  return (
    <details
      open={isOpen}
      onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
      className={cn(
        "mb-2 border border-gray-200 rounded text-xs",
        tr.annotations.userEvent && "bg-blue-50",
        tr.docChanged && "border-l-4 border-l-blue-500",
      )}
    >
      <summary className="px-2 py-1.5 cursor-pointer hover:bg-gray-50 flex justify-between items-center">
        <span className="font-mono font-medium">{summaryLeft}</span>
        <span className="text-gray-500">{formatTime(tr.timestamp)}</span>
      </summary>
      <div className="px-2 py-2 space-y-2 bg-white border-t border-gray-200">
        <div>
          <strong>Doc Changed:</strong> {tr.docChanged.toString()}
        </div>

        {tr.changes.length > 0 ? (
          <div>
            <strong>Changes:</strong>
            {tr.changes.map((change, idx) => {
              const deleted = change.to - change.from;
              const inserted = change.insert.length;
              const sameLine = change.fromLine === change.toLine;

              let posInfo = `pos ${change.from}-${change.to}`;
              if (sameLine) {
                posInfo += ` (L${change.fromLine}:${change.fromCol}-${change.toCol})`;
              } else {
                posInfo += ` (L${change.fromLine}:${change.fromCol} to L${change.toLine}:${change.toCol})`;
              }

              return (
                <div key={idx} className="ml-2 mt-1 p-1 bg-gray-50 rounded">
                  <div>
                    Change {idx + 1}: {posInfo}
                  </div>
                  {deleted > 0 && <div className="text-red-600">Deleted {deleted} chars</div>}
                  {inserted > 0 && (
                    <div className="text-green-600">
                      Inserted: <code className="bg-gray-200 px-1 rounded">{change.insert}</code>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            <strong>Changes:</strong> none
          </div>
        )}

        {Object.keys(tr.annotations).length > 0 ? (
          <div>
            <strong>Annotations:</strong>
            {Object.entries(tr.annotations).map(([key, value]) => (
              <div key={key} className="ml-2">
                {key}: {JSON.stringify(value)}
              </div>
            ))}
          </div>
        ) : (
          <div>
            <strong>Annotations:</strong> none
          </div>
        )}

        {tr.effects.length > 0 ? (
          <div>
            <strong>Effects:</strong> {tr.effects.length}
            {tr.effects.map((effect, idx) => (
              <div key={idx} className="ml-2 mt-1">
                {effect.type === "blockMetadataEffect" && effect.blockMetadata ? (
                  <div className="p-1 bg-purple-50 rounded">
                    <div className="font-medium">
                      Effect {idx + 1}: blockMetadataEffect ({effect.blockMetadata.length} blocks)
                    </div>
                    {effect.blockMetadata.map((block: any, blockIdx: number) => (
                      <div key={blockIdx} className="ml-2 mt-1 text-xs">
                        <div className="font-medium">Block {blockIdx + 1}:</div>
                        <div>
                          {block.output !== null ? `Output: ${block.output.from}-${block.output.to}` : "Output: null"}
                        </div>
                        <div>
                          Source: {block.source.from}-{block.source.to}
                        </div>
                        {Object.keys(block.attributes).length > 0 && (
                          <div>Attributes: {JSON.stringify(block.attributes)}</div>
                        )}
                        {block.error && <div className="text-red-600">Error: true</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    Effect {idx + 1} ({effect.type}): {JSON.stringify(effect.value).substring(0, 100)}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div>
            <strong>Effects:</strong> none
          </div>
        )}

        <div>
          <strong>Selection:</strong>
          {tr.selection.map((range, idx) => {
            const isCursor = range.from === range.to;
            return (
              <div key={idx} className="ml-2">
                Range {idx + 1}: {isCursor ? `cursor at ${range.from}` : `${range.from}-${range.to}`}
                {!isCursor && ` (anchor: ${range.anchor}, head: ${range.head})`}
              </div>
            );
          })}
        </div>
      </div>
    </details>
  );
}

function SelectionGroupItem({transactions}: {transactions: TransactionData[]}) {
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
  const firstTr = transactions[0];
  const lastTr = transactions[transactions.length - 1];

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
