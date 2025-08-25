"use client";
import {useEffect, useRef} from "react";
import {createEditor} from "../src/editor.js";

export function Editor({code}) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      editorRef.current = createEditor(containerRef.current, {code});
    }
    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
      }
    };
  }, [code]);

  return (
    <div style={{height: "calc(100vh - 115px)"}}>
      <button style={{marginBottom: "10px"}} onClick={() => editorRef.current.run()}>
        Run
      </button>
      <div ref={containerRef} style={{height: "calc(100vh - 115px)", overflow: "auto"}}>
        <pre>{code}</pre>
      </div>
    </div>
  );
}
