import {EditorView, ViewPlugin, ViewUpdate, type PluginValue} from "@codemirror/view";
import {useAtom} from "jotai";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Panel, PanelGroup, PanelResizeHandle} from "react-resizable-panels";
import * as testSamples from "../js/index.js";
import {selectedTestAtom} from "../store.ts";
import {BlockViewer} from "./BlockViewer.tsx";
import {Editor} from "./Editor.tsx";
import {TestSelector} from "./TestSelector.tsx";
import {TransactionViewer} from "./TransactionViewer.tsx";
import { type TransactionData, extractTransactionData } from "./transaction-data.ts";
import { List } from "immutable";
import { extractBlockData, type BlockData } from "./block-data.ts";
import { EditorSelection } from "@codemirror/state";

export function App() {
  const [selectedTest, setSelectedTest] = useAtom(selectedTestAtom);
  const [transactions, setTransactions] = useState<List<TransactionData>>(List);
  const [blocks, setBlocks] = useState<List<BlockData>>(List);
  const viewRef = useRef<EditorView | null>(null);

  const transactionViewerPlugin: ViewPlugin<PluginValue> = useMemo(() => {
    let nextIndex = 0;
    // Maximum number of transactions to keep in history
    const MAX_HISTORY = 100;

    const plugin = ViewPlugin.fromClass(
      class {
        update(update: ViewUpdate) {
          if (update.transactions.length > 0) {
            setTransactions(oldTransactions => {
              const transactionData = update.transactions.map(tr => extractTransactionData(tr, nextIndex++));
              const newTransactions = oldTransactions.concat(transactionData);
              if (newTransactions.size > MAX_HISTORY) {
                return newTransactions.slice(newTransactions.size - MAX_HISTORY);
              }
              return newTransactions;
            });
          }
        }
      },
    );

    return plugin;
  }, []);

  const blockViewerPlugin: ViewPlugin<PluginValue> = useMemo(() => {
    return ViewPlugin.fromClass(
      class {
        update(update: ViewUpdate) {
          viewRef.current = update.view;
          setBlocks(List(extractBlockData(update.view)));
        }
      },
    );
  }, []);

  // Initialize from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const testFromUrl = params.get("test");
    if (testFromUrl && testFromUrl in testSamples) {
      setSelectedTest(testFromUrl);
    }
  }, [setSelectedTest]);

  const onLocateBlock = useCallback((from: number, to: number) => {
    if (!viewRef.current) return;

    const view = viewRef.current;

    // Scroll the block into view and select the range
    view.dispatch({
      effects: EditorView.scrollIntoView(from, {y: "center"}),
      selection: EditorSelection.range(from, to),
    });

    view.focus();
  }, []);

  // Get the current test code
  const currentCode = (testSamples as Record<string, string>)[selectedTest] || testSamples.helloWorld;

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Recho Playground</h1>
          <TestSelector />
        </div>
      </header>

      <PanelGroup direction="horizontal">
        <Panel minSize={25} defaultSize={75}>
          <div className="w-full h-full p-4 overflow-auto">
            <Editor
              className="shadow-xl"
              key={selectedTest}
              code={currentCode}
              transactionViewerPlugin={transactionViewerPlugin}
              blockViewerPlugin={blockViewerPlugin}
            />
          </div>
        </Panel>
        <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-blue-400 data-[resize-handle-state=drag]:bg-blue-400 transition-colors cursor-col-resize relative before:absolute before:inset-y-0 before:-inset-x-1 before:content-['']" />
        <Panel minSize={10}>
          <PanelGroup direction="vertical">
            <Panel minSize={10}>
              <BlockViewer blocks={blocks} onLocateBlock={onLocateBlock} />
            </Panel>
            <PanelResizeHandle className="h-1 bg-gray-200 hover:bg-blue-400 data-[resize-handle-state=drag]:bg-blue-400 transition-colors cursor-row-resize relative before:absolute before:inset-x-0 before:-inset-y-1 before:content-['']" />
            <Panel minSize={10}>
              <TransactionViewer transactions={transactions} onClear={() => setTransactions(List())} />
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  );
}
