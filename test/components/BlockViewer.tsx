import {useEffect, useRef, useState} from "react";
import type {BlockData} from "./block-data.ts";
import {BlockItem} from "./BlockItem.tsx";
import type { List } from "immutable";

interface BlockViewerProps {
  blocks: List<BlockData>;
  onLocateBlock: (from: number, to: number) => void;
}

export function BlockViewer({blocks, onLocateBlock}: BlockViewerProps) {
  const [autoScroll, setAutoScroll] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [blocks, autoScroll]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Blocks ({blocks.size})</h3>
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
        {blocks.size === 0 ? (
          <div className="text-sm text-gray-500 text-center py-4">No blocks yet</div>
        ) : (
          blocks.toSeq().map((block) => <BlockItem key={block.index} block={block} onLocate={onLocateBlock} />).toArray()
        )}
      </div>
    </div>
  );
}
