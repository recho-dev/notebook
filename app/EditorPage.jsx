"use client";
import {useState, useEffect, useRef, useCallback, useSyncExternalStore} from "react";
import {notFound} from "next/navigation";
import {Pencil} from "lucide-react";
import {Editor} from "./Editor.jsx";
import {getSketchById, createSketch, addSketch, saveSketch} from "./api.js";
import {isDirtyStore, countStore} from "./store.js";
import {cn} from "./cn.js";

const UNSET = Symbol("UNSET");

export function EditorPage({id: initialId}) {
  const [sketch, setSketch] = useState(UNSET);
  const [showInput, setShowInput] = useState(false);
  const [autoRun, setAutoRun] = useState(false);
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
  const timer = useRef(null);

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
    setAutoRun(initialSketch.autoRun);
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

  // If long-running code is detected, set autoRun to false
  // to prevent the browser from freezing on infinite loops
  // and can't continue to edit the code.
  function onBeforeEachRun() {
    if (!isAdded) return;
    if (timer.current) clearTimeout(timer.current);
    const newSketch = {...sketch, autoRun: false};
    saveSketch(newSketch);
    timer.current = setTimeout(() => {
      const newSketch = {...sketch, autoRun: true};
      saveSketch(newSketch);
      timer.current = null;
    }, 100);
  }

  return (
    <div className={cn("max-w-screen-lg mx-auto my-10 editor-page")}>
      <Editor
        initialCode={initialCode}
        key={sketch.id}
        onUserInput={onUserInput}
        onBeforeEachRun={onBeforeEachRun}
        autoRun={autoRun}
        toolBarStart={
          <div className={cn("flex items-center gap-2")}>
            {!isAdded && (
              <button
                onClick={onSave}
                className={cn("bg-green-700 text-white rounded-md px-3 py-1 text-sm hover:bg-green-800")}
              >
                Create
              </button>
            )}
            {!showInput && isAdded && (
              <button onClick={onRename}>
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {showInput || !isAdded ? (
              <input
                type="text"
                value={sketch.title}
                onChange={onTitleChange}
                onBlur={onTitleBlur}
                ref={titleRef}
                className={cn("border border-gray-200 rounded-md px-3 py-1 text-sm bg-white")}
              />
            ) : (
              <span className={cn("text-sm py-1 border border-gray-100 rounded-md")}>{sketch.title}</span>
            )}
          </div>
        }
      />
    </div>
  );
}
