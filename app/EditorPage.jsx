"use client";
import {useState, useEffect, useRef, useCallback, useSyncExternalStore} from "react";
import {notFound} from "next/navigation";
import {Editor} from "./Editor.jsx";
import {getSketchById, createSketch, addSketch, saveSketch} from "./api.js";
import {isDirtyStore, countStore} from "./store.js";

const UNSET = Symbol("UNSET");

export function EditorPage({id: initialId}) {
  const [sketch, setSketch] = useState(UNSET);
  const [showInput, setShowInput] = useState(false);
  const [id, setId] = useState(initialId);
  const [initialCode, setInitialCode] = useState(null);
  const titleRef = useRef(null);
  const count = useSyncExternalStore(countStore.subscribe, countStore.getSnapshot, countStore.getServerSnapshot);
  const isDirty = useSyncExternalStore(
    isDirtyStore.subscribe,
    isDirtyStore.getSnapshot,
    isDirtyStore.getServerSnapshot,
  );
  const prevCount = useRef(id ? count : null); // Last saved count.
  const isAdded = prevCount.current === count; // Whether the sketch is added to the storage.

  const onSave = useCallback(() => {
    isDirtyStore.setDirty(false);
    if (isAdded) {
      saveSketch(sketch);
    } else {
      addSketch(sketch);
      prevCount.current = count;
      const id = sketch.id;
      setId(id); // Force re-render.
      window.history.pushState(null, "", `/sketches/${id}`); // Just update the url, no need to reload the page.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sketch]);

  // This effect is triggered when the count changes,
  // which happens when user clicks the "New" nav link.
  useEffect(() => {
    const initialSketch = isAdded ? getSketchById(id) : createSketch();
    setSketch(initialSketch);
    setInitialCode(initialSketch.content);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (isDirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.metaKey && e.key === "s") onSave();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onSave]);

  useEffect(() => {
    if (showInput) titleRef.current.focus();
  }, [showInput]);

  if (sketch === UNSET) return <div>Loading...</div>;
  if (!sketch) return notFound();

  function onUserInput(code) {
    const newSketch = {...sketch, content: code};
    if (isAdded) {
      saveSketch(newSketch);
      setSketch(newSketch);
    } else {
      setSketch(newSketch);
      isDirtyStore.setDirty(true);
    }
  }

  function onRename() {
    setShowInput(true);
  }

  function onTitleBlur() {
    setShowInput(false);
  }

  function onTitleChange(e) {
    const newSketch = {...sketch, title: e.target.value};
    setSketch(newSketch);
    if (isAdded) saveSketch(newSketch);
    else isDirtyStore.setDirty(true);
  }

  return (
    <div>
      <div>
        <button onClick={onSave}>{isAdded ? "Save" : "Create"}</button>
        {!showInput && <button onClick={onRename}>Rename</button>}
        <span>
          {showInput ? (
            <input type="text" value={sketch.title} onChange={onTitleChange} onBlur={onTitleBlur} ref={titleRef} />
          ) : (
            sketch.title
          )}
        </span>
      </div>
      <Editor initialCode={initialCode} key={sketch.id} onUserInput={onUserInput} />
    </div>
  );
}
