"use client";
import {useEffect, useRef} from "react";
import {createEditor} from "../src/editor.js";

export function Editor({initialCode, onUserInput = () => {}}) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);

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
      editorRef.current.on("userInput", onUserInput);
    }
  }, [initialCode, onUserInput]);

  return (
    <div style={{height: "calc(100vh - 115px)"}}>
      <div>
        <button onClick={() => editorRef.current.run()}>Run</button>
        <button onClick={() => editorRef.current.stop()}>Stop</button>
      </div>
      <div ref={containerRef} style={{height: "100%", overflow: "auto"}}>
        <pre>{initialCode}</pre>
      </div>
    </div>
  );
}
