import {EditorSelection} from "@codemirror/state";
import {EditorView, ViewPlugin} from "@codemirror/view";
import {useEffect, useRef, useState} from "react";
import {blockMetadataField} from "../../editor/blockMetadata.ts";
import type {BlockData} from "./types.ts";
import {BlockItem} from "./BlockItem.tsx";

interface BlockViewerProps {
  onPluginCreate: (plugin: ViewPlugin<any>) => void;
}

export function BlockViewer({onPluginCreate}: BlockViewerProps) {
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    let currentBlocks: BlockData[] = [];
    const listeners = new Set<(blocks: BlockData[]) => void>();

    function notifyListeners() {
      listeners.forEach((fn) => fn([...currentBlocks]));
    }

    function extractBlockData(view: any): BlockData[] {
      const blockMetadata = view.state.field(blockMetadataField, false);
      if (!blockMetadata) return [];

      return blockMetadata.map((block: any, index: number) => ({
        name: block.name,
        index,
        sourceFrom: block.source.from,
        sourceTo: block.source.to,
        outputFrom: block.output?.from ?? null,
        outputTo: block.output?.to ?? null,
        hasError: block.error || false,
        attributes: block.attributes || {},
      }));
    }

    const plugin = ViewPlugin.fromClass(
      class {
        constructor(view: any) {
          viewRef.current = view;
          currentBlocks = extractBlockData(view);
          notifyListeners();
        }

        update(update: any) {
          viewRef.current = update.view;
          if (
            update.docChanged ||
            update.transactions.some((tr: any) => tr.effects.some((e: any) => e.is(blockMetadataField.init)))
          ) {
            currentBlocks = extractBlockData(update.view);
            notifyListeners();
          }
        }
      },
    );

    listeners.add((newBlocks) => {
      setBlocks(newBlocks);
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
  }, [blocks, autoScroll]);

  const handleLocateBlock = (block: BlockData) => {
    if (!viewRef.current) return;

    const view = viewRef.current;
    // The block starts at output.from (if output exists) or source.from
    // The block ends at source.to
    const from = block.outputFrom ?? block.sourceFrom;
    const to = block.sourceTo;

    // Scroll the block into view and select the range
    view.dispatch({
      effects: EditorView.scrollIntoView(from, {y: "center"}),
      selection: EditorSelection.range(from, to),
    });

    view.focus();
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Blocks ({blocks.length})</h3>
        <div className="flex items-center gap-3">
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
        {blocks.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-4">No blocks yet</div>
        ) : (
          blocks.map((block) => <BlockItem key={block.index} block={block} onLocate={handleLocateBlock} />)
        )}
      </div>
    </div>
  );
}
