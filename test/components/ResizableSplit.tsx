import { useState, useRef, useEffect, ReactNode } from "react";

interface ResizableSplitProps {
  top: ReactNode;
  bottom: ReactNode;
  defaultRatio?: number; // 0 to 1, representing top panel's height ratio
}

export function ResizableSplit({ top, bottom, defaultRatio = 0.5 }: ResizableSplitProps) {
  const [ratio, setRatio] = useState(defaultRatio);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const newRatio = Math.max(0.1, Math.min(0.9, y / rect.height));
      setRatio(newRatio);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  return (
    <div ref={containerRef} className="flex flex-col h-full w-full">
      {/* Top panel */}
      <div style={{ height: `${ratio * 100}%` }} className="overflow-hidden">
        {top}
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`h-1 bg-gray-200 hover:bg-blue-400 cursor-row-resize flex-shrink-0 transition-colors ${
          isDragging ? "bg-blue-400" : ""
        }`}
      >
        <div className="h-full w-full flex items-center justify-center">
          <div className="w-12 h-0.5 bg-gray-400 rounded"></div>
        </div>
      </div>

      {/* Bottom panel */}
      <div style={{ height: `${(1 - ratio) * 100}%` }} className="overflow-hidden">
        {bottom}
      </div>
    </div>
  );
}
