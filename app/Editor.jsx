"use client";
import {useEffect, useRef, useState} from "react";
import {createEditor} from "../src/editor.js";

export function Editor({initialCode, onUserInput = () => {}}) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const [needRerun, setNeedRerun] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      editorRef.current = createEditor(containerRef.current, {code: initialCode});
      editorRef.current.run();
    }
    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
      }
    };
  }, [initialCode]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.on("userInput", onInput);
    }
  }, [initialCode, onUserInput]);

  function onInput(code) {
    onUserInput(code);
    setNeedRerun(true);
  }

  function onRun() {
    setNeedRerun(false);
    editorRef.current.run();
  }

  function onStop() {
    setNeedRerun(false);
    editorRef.current.stop();
  }

  return (
    <div style={{height: "calc(100vh - 115px)"}}>
      <div>
        <button onClick={onRun}>{needRerun ? "Run (Updated)" : "Run"}</button>
        <button onClick={onStop}>Stop</button>
      </div>
      <div ref={containerRef} style={{height: "100%", overflow: "auto"}}>
        <pre>{initialCode}</pre>
      </div>
    </div>
  );
}
