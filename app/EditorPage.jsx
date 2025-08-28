"use client";
import {useState, useEffect, useRef, useCallback, useSyncExternalStore} from "react";
import {notFound, useRouter} from "next/navigation";
import {Editor} from "./Editor.jsx";
import {getSketchById, createSketch, addSketch, saveSketch} from "./api.js";
import {editorStore} from "./store.js";

const UNSET = Symbol("UNSET");

export function EditorPage({id}) {
  const router = useRouter();
  const [sketch, setSketch] = useState(UNSET);
  const [showInput, setShowInput] = useState(false);
  const [isAdded, setIsAdded] = useState(id);
  const [initialCode, setInitialCode] = useState(null);
  const titleRef = useRef(null);
  const store = useSyncExternalStore(editorStore.subscribe, editorStore.getSnapshot, editorStore.getServerSnapshot);

  const onSave = useCallback(() => {
    editorStore.setDirty(false);
    if (isAdded) {
      saveSketch(sketch);
    } else {
      addSketch(sketch);
      setIsAdded(true);
      router.replace(`/sketches/${sketch.id}`);
    }
  }, [sketch, isAdded, router]);

  useEffect(() => {
    const initialSketch = isAdded ? getSketchById(id) : createSketch();
    setSketch(initialSketch);
    setInitialCode(initialSketch.content);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.count]);

  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (store.isDirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [store.isDirty]);

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
      editorStore.setDirty(true);
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
    else editorStore.setDirty(true);
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
