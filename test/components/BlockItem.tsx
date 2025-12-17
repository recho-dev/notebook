import {CircleXIcon, Locate, SquareTerminalIcon} from "lucide-react";
import {useState} from "react";
import type {BlockData} from "./block-data.ts";

export function BlockItem({block, onLocate}: {block: BlockData; onLocate: (from: number, to: number) => void}) {
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
      <summary className="px-2 py-1.5 cursor-pointer hover:bg-gray-50 flex justify-between items-center overflow-hidden">
        <section className="flex flex-row gap-1 items-center flex-shrink-0">
          <span className="font-mono font-medium">{block.index + 1}</span>
          {block.hasError && <CircleXIcon className="w-4 h-4" />}
          {hasOutput && !block.hasError && <SquareTerminalIcon className="w-4 h-4" />}
        </section>
        <div className="min-w-0 flex-1 flex flex-col gap-0 5 min-w-0 flex-1">
          <span className="font-mono truncate mx-2 font-semibold">{block.name}</span>
          <span className="font-mono truncate mx-2 text-stone-500 text-xs">{block.id}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-stone-600 text-xs font-mono">
            <span className="font-semibold text-stone-500">[</span>
            {block.sourceFrom},<span className="font-sans"> </span>
            {block.sourceTo}
            <span className="font-semibold text-stone-500">)</span>
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onLocate(block.outputFrom ?? block.sourceFrom, block.sourceTo);
            }}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Locate block in editor"
          >
            <Locate className="w-3 h-3" />
          </button>
        </div>
      </summary>
      <div className="px-2 py-2 space-y-2 bg-white border-t border-gray-200">
        {hasOutput ? (
          <div className="flex flex-row gap-2 items-center">
            <strong>Output Range:</strong> {block.outputFrom}-{block.outputTo}
            <span className="text-gray-500 ml-1">({block.outputTo! - block.outputFrom!} chars)</span>
            <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onLocate(block.outputFrom!, block.outputTo!);
            }}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Locate block in editor"
          >
            <Locate className="w-3 h-3" />
          </button>
          </div>
        ) : (
          <div className="flex flex-row gap-2 items-center">
            <strong>Output Range:</strong> <span className="text-gray-400">none</span>
            <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onLocate(block.outputFrom ?? block.sourceFrom, block.sourceTo);
            }}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Locate block in editor"
          >
            <Locate className="w-3 h-3" />
          </button>
          </div>
        )}

        <div className="flex flex-row gap-2 items-center">
          <strong>Source Range:</strong> {block.sourceFrom}-{block.sourceTo}
          <span className="text-gray-500 ml-1">({block.sourceTo - block.sourceFrom} chars)</span>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onLocate(block.sourceFrom, block.sourceTo);
            }}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Locate block in editor"
          >
            <Locate className="w-3 h-3" />
          </button>
        </div>


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
