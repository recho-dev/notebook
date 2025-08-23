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

  const [selected, setSelected] = useState(getInitialValue());

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
      <div style={{display: "flex"}}>
        <ul style={{width: "200px", margin: 0, height: "calc(100vh - 85px)", overflow: "auto"}}>
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
        <div style={{width: "calc(100% - 200px)"}}>
          <button style={{marginBottom: "10px"}} onClick={() => editorRef.current.run()}>
            Run
          </button>
          <div style={{height: "calc(100vh - 115px)", overflow: "auto"}}>
            <div ref={containerRef}></div>
          </div>
        </div>
      </div>
    </>
  );
}
