import {useState, useEffect, useRef} from "react";
import {ViewPlugin, EditorView} from "@codemirror/view";
import {EditorSelection} from "@codemirror/state";
import {blockMetadataField} from "../../editor/blockMetadata.ts";
import {Locate} from "lucide-react";

interface BlockData {
  index: number;
  sourceFrom: number;
  sourceTo: number;
  outputFrom: number | null;
  outputTo: number | null;
  hasError: boolean;
  attributes: Record<string, any>;
}

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

function BlockItem({block, onLocate}: {block: BlockData; onLocate: (block: BlockData) => void}) {
  const [isOpen, setIsOpen] = useState(false);

  const hasOutput = block.outputFrom !== null && block.outputTo !== null;
  const hasAttributes = Object.keys(block.attributes).length > 0;

  return (
    <details
      open={isOpen}
      onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
      className={`mb-2 border rounded text-xs ${
        block.hasError
          ? "border-red-300 bg-red-50"
          : hasOutput
            ? "border-green-300 bg-green-50"
            : "border-gray-200 bg-white"
      }`}
    >
      <summary className="px-2 py-1.5 cursor-pointer hover:bg-gray-50 flex justify-between items-center">
        <span className="font-mono font-medium">
          Block {block.index + 1}
          {block.hasError && " ✗"}
          {hasOutput && !block.hasError && " ➜"}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onLocate(block);
            }}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Locate block in editor"
          >
            <Locate className="w-3 h-3" />
          </button>
          <span className="text-stone-600 text-xs font-mono">
            <span className="font-semibold text-stone-500">[</span>
            {block.sourceFrom},<span class="font-sans"> </span>
            {block.sourceTo}
            <span className="font-semibold text-stone-500">)</span>
          </span>
        </div>
      </summary>
      <div className="px-2 py-2 space-y-2 bg-white border-t border-gray-200">
        <div>
          <strong>Source Range:</strong> {block.sourceFrom}-{block.sourceTo}
          <span className="text-gray-500 ml-1">({block.sourceTo - block.sourceFrom} chars)</span>
        </div>

        {hasOutput ? (
          <div>
            <strong>Output Range:</strong> {block.outputFrom}-{block.outputTo}
            <span className="text-gray-500 ml-1">({block.outputTo! - block.outputFrom!} chars)</span>
          </div>
        ) : (
          <div>
            <strong>Output Range:</strong> <span className="text-gray-400">none</span>
          </div>
        )}

        <div>
          <strong>Total Range:</strong> {hasOutput ? block.outputFrom : block.sourceFrom}-{block.sourceTo}
          <span className="text-gray-500 ml-1">
            ({block.sourceTo - (hasOutput ? block.outputFrom! : block.sourceFrom)} chars)
          </span>
        </div>

        {block.hasError && <div className="text-red-600 font-medium">✗ Has Error</div>}

        {hasAttributes && (
          <div>
            <strong>Attributes:</strong>
            <div className="ml-2 mt-1 p-1 bg-gray-50 rounded font-mono text-xs">
              {JSON.stringify(block.attributes, null, 2)}
            </div>
          </div>
        )}
      </div>
    </details>
  );
}
