"use client";
import {useEffect, useRef, useState} from "react";
import {Play, Square} from "lucide-react";
import {createEditor} from "../editor/index.js";
import {cn} from "./cn.js";

const styles = {
  iconButton: "w-4 h-4 hover:scale-110 transition-transform duration-100",
};

export function Editor({
  initialCode,
  onUserInput = () => {},
  onBeforeEachRun = () => {},
  autoRun = true,
  toolBarStart = null,
}) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const [needRerun, setNeedRerun] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      editorRef.current = createEditor(containerRef.current, {code: initialCode});
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

  function onRun() {
    onBeforeEachRun();
    setNeedRerun(false);
    editorRef.current.run();
  }

  function onStop() {
    setNeedRerun(false);
    editorRef.current.stop();
  }

  return (
    <div className={cn("w-full border border-gray-200 rounded-md")}>
      <div className={cn("flex justify-between items-center p-2 border-b border-gray-200 bg-gray-100")}>
        {toolBarStart}
        <div className={cn("flex items-center gap-3")}>
          <button onClick={onRun}>
            <Play className={cn(styles.iconButton, needRerun && "fill-black")} />
          </button>
          <button onClick={onStop}>
            <Square className={cn(styles.iconButton)} />
          </button>
        </div>
      </div>
      <div ref={containerRef}>
        <pre>{initialCode}</pre>
      </div>
    </div>
  );
}
