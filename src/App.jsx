import {useMemo, useRef, useState, useEffect} from "react";
import {examples} from "../examples/index.js";
import {createEditor} from "./editor.js";

function getInitialValue() {
  const initialValue = new URL(location).searchParams.get("name");
  if (initialValue && examples.find(({name}) => name === initialValue)) {
    return initialValue;
  }
  const name = examples[0].name;
  history.pushState(null, "", `?name=${name}`);
  return name;
}

export default function App() {
  const containerRef = useRef(null);
  const editorRef = useRef(null);

  const [selected, setSelected] = useState(getInitialValue);

  const code = useMemo(() => {
    return examples.find(({name}) => name === selected).code;
  }, [selected]);

  function onSelect(name) {
    setSelected(name);
    history.pushState(null, "", `?name=${name}`);
  }

  useEffect(() => {
    if (containerRef.current) {
      const preEditor = editorRef.current;
      if (preEditor) preEditor.destroy();
      containerRef.current.innerHTML = "";
      const editor = createEditor(containerRef.current, {code});
      editorRef.current = editor;
    }
  }, [code]);

  return (
    <>
      <h1>Observable Script</h1>
      <div
        style={{
          display: "grid",
          width: "100%",
          gridTemplateColumns: "200px minmax(0, 1fr)",
          minHeight: "0",
          flex: "1",
        }}
      >
        <ul style={{margin: 0}}>
          {examples.map(({name}) => (
            <li
              key={name}
              style={{textDecoration: selected === name ? "underline" : "none", cursor: "pointer"}}
              onClick={() => onSelect(name)}
            >
              {name}
            </li>
          ))}
        </ul>
        <div
          style={{
            width: "100%",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            boxSizing: "border-box",
          }}
        >
          <nav style={{display: "flex", flexDirection: "row", alignItems: "center", gap: "0.5rem"}}>
            <button style={{}} onClick={() => editorRef.current.runtime.run()}>
              Run
            </button>
          </nav>
          <div ref={containerRef} style={{width: "100%", minHeight: "0", flex: "1"}}></div>
        </div>
      </div>
    </>
  );
}
