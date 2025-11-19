import {useEffect, useState} from "react";
import {useAtom} from "jotai";
import {selectedTestAtom} from "../store";
import {TestSelector} from "./TestSelector";
import {Editor} from "./Editor";
import {TransactionViewer} from "./TransactionViewer";
import {BlockViewer} from "./BlockViewer";
import {ResizableSplit} from "./ResizableSplit";
import * as testSamples from "../js/index.js";
import type {ViewPlugin} from "@codemirror/view";

export function App() {
  const [selectedTest, setSelectedTest] = useAtom(selectedTestAtom);
  const [transactionViewerPlugin, setTransactionViewerPlugin] = useState<ViewPlugin<any> | undefined>();
  const [blockViewerPlugin, setBlockViewerPlugin] = useState<ViewPlugin<any> | undefined>();

  // Initialize from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const testFromUrl = params.get("test");
    if (testFromUrl && testFromUrl in testSamples) {
      setSelectedTest(testFromUrl);
    }
  }, [setSelectedTest]);

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

      {/* Main content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Editor panel */}
        <div className="flex-1 p-4 overflow-auto">
          <Editor
            key={selectedTest}
            code={currentCode}
            transactionViewerPlugin={transactionViewerPlugin}
            blockViewerPlugin={blockViewerPlugin}
          />
        </div>

        {/* Sidebar with blocks and transactions */}
        <aside className="w-96 bg-white overflow-hidden">
          <ResizableSplit
            top={<BlockViewer onPluginCreate={setBlockViewerPlugin} />}
            bottom={<TransactionViewer onPluginCreate={setTransactionViewerPlugin} />}
            defaultRatio={0.5}
          />
        </aside>
      </main>
    </div>
  );
}
