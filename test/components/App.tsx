import type {PluginValue, ViewPlugin} from "@codemirror/view";
import {useAtom} from "jotai";
import {useEffect, useState} from "react";
import {Panel, PanelGroup, PanelResizeHandle} from "react-resizable-panels";
import * as testSamples from "../js/index.js";
import {selectedTestAtom} from "../store.ts";
import {BlockViewer} from "./BlockViewer.tsx";
import {Editor} from "./Editor.tsx";
import {TestSelector} from "./TestSelector.tsx";
import {TransactionViewer} from "./TransactionViewer.tsx";

export function App() {
  const [selectedTest, setSelectedTest] = useAtom(selectedTestAtom);
  const [transactionViewerPlugin, setTransactionViewerPlugin] = useState<ViewPlugin<PluginValue> | undefined>();
  const [blockViewerPlugin, setBlockViewerPlugin] = useState<ViewPlugin<PluginValue> | undefined>();

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
        <PanelResizeHandle />
        <Panel minSize={10}>
          <PanelGroup direction="vertical">
            <Panel minSize={10}>
              <BlockViewer onPluginCreate={setBlockViewerPlugin} />
            </Panel>
            <PanelResizeHandle />
            <Panel minSize={10}>
              <TransactionViewer onPluginCreate={setTransactionViewerPlugin} />
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  );
}
