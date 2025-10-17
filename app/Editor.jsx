"use client";
import {useEffect, useRef, useState} from "react";
import {Play, Square, RefreshCcw, Copy} from "lucide-react";
import {Tooltip} from "react-tooltip";
import {createEditor} from "../editor/index.js";
import {cn} from "./cn.js";

const styles = {
  iconButton: "w-4 h-4 hover:scale-110 transition-transform duration-100",
};

function debounce(fn, delay = 0) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

const onDefaultError = debounce(() => {
  setTimeout(() => {
    alert("Something unexpected happened. Please check the console for details.");
  }, 100);
}, 0);

export function Editor({
  initialCode,
  onUserInput = () => {},
  onBeforeEachRun = () => {},
  autoRun = true,
  toolBarStart = null,
  pinToolbar = true,
  onDuplicate = null,
  onError = onDefaultError,
}) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const [needRerun, setNeedRerun] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      editorRef.current = createEditor(containerRef.current, {code: initialCode, onError});
      if (autoRun) onRun();
    }
    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  useEffect(() => {
    const onInput = (code) => {
      onUserInput(code);
      setNeedRerun(true);
    };

    if (editorRef.current) {
      editorRef.current.on("userInput", onInput);
    }
  }, [initialCode, onUserInput]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.metaKey && e.key === "s") setNeedRerun(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function onRun() {
    onBeforeEachRun();
    setNeedRerun(false);
    editorRef.current.run();
  }

  function onStop() {
    setNeedRerun(false);
    editorRef.current.stop();
  }

  function onRerun() {
    setNeedRerun(false);
    editorRef.current.stop();
    editorRef.current.run();
  }

  function metaKey() {
    return typeof navigator !== "undefined" || navigator.userAgent.includes("Mac") ? "cmd" : "ctrl";
  }

  return (
    <div className={cn("w-full border border-gray-200 rounded-md")}>
      <div
        className={cn(
          "flex justify-between items-center p-2 border-b border-gray-200 bg-gray-100",
          pinToolbar && "sticky top-0 z-10",
        )}
      >
        {toolBarStart}
        <div className={cn("flex items-center gap-3")}>
          <button
            onClick={onRun}
            data-tooltip-id="action-tooltip"
            data-tooltip-content={`Run Updated Code (${metaKey()}+s)`}
            data-tooltip-place="bottom"
          >
            <Play className={cn(styles.iconButton, needRerun && "fill-black")} />
          </button>
          <button
            onClick={onRerun}
            data-tooltip-id="action-tooltip"
            data-tooltip-content="Re-run Notebook"
            data-tooltip-place="bottom"
          >
            <RefreshCcw className={cn(styles.iconButton)} />
          </button>
          <button
            onClick={onStop}
            data-tooltip-id="action-tooltip"
            data-tooltip-content="Stop Updating"
            data-tooltip-place="bottom"
          >
            <Square className={cn(styles.iconButton)} />
          </button>
          {onDuplicate && (
            <button
              onClick={onDuplicate}
              data-tooltip-id="action-tooltip"
              data-tooltip-content="Duplicate Notebook"
              data-tooltip-place="bottom"
            >
              <Copy className={cn(styles.iconButton)} />
            </button>
          )}
        </div>
      </div>
      <div ref={containerRef}>
        <pre className={cn("text-sm hidden")}>{initialCode}</pre>
      </div>
      <Tooltip id="action-tooltip" className={cn("z-999")} />
    </div>
  );
}
