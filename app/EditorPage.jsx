"use client";
import {useState, useEffect, useRef, useCallback, useSyncExternalStore} from "react";
import {notFound} from "next/navigation";
import {Pencil} from "lucide-react";
import {Editor} from "./Editor.jsx";
import {getNotebookById, createNotebook, addNotebook, saveNotebook, getNotebooks} from "./api.js";
import {isDirtyStore, countStore} from "./store.js";
import {cn} from "./cn.js";
import {SafeLink} from "./SafeLink.jsx";

const UNSET = Symbol("UNSET");

export function EditorPage({id: initialId}) {
  const [notebook, setNotebook] = useState(UNSET);
  const [notebookList, setNotebookList] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [autoRun, setAutoRun] = useState(false);
  const [id, setId] = useState(initialId);
  const [initialCode, setInitialCode] = useState(null);
  const [title, setTitle] = useState("");
  const titleRef = useRef(null);
  const count = useSyncExternalStore(countStore.subscribe, countStore.getSnapshot, countStore.getServerSnapshot);
  const isDirty = useSyncExternalStore(
    isDirtyStore.subscribe,
    isDirtyStore.getSnapshot,
    isDirtyStore.getServerSnapshot,
  );
  const prevCount = useRef(id ? count : null); // Last saved count.
  const isAdded = prevCount.current === count; // Whether the notebook is added to the storage.
  const timer = useRef(null);

  const onSave = useCallback(() => {
    isDirtyStore.setDirty(false);
    if (isAdded) {
      saveNotebook(notebook);
    } else {
      addNotebook(notebook);
      prevCount.current = count;
      const id = notebook.id;
      setId(id); // Force re-render.
      window.history.pushState(null, "", `/notebooks/${id}`); // Just update the url, no need to reload the page.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notebook]);

  // This effect is triggered when the count changes,
  // which happens when user clicks the "New" nav link.
  useEffect(() => {
    const initialNotebook = isAdded ? getNotebookById(id) : createNotebook();
    setNotebook(initialNotebook);
    setInitialCode(initialNotebook.content);
    setAutoRun(initialNotebook.autoRun);
    setTitle(initialNotebook.title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  useEffect(() => {
    // Use setTimeout to avoid changing to default title.
    setTimeout(() => {
      document.title = `${isAdded ? notebook.title : "New"} | Recho`;
    }, 100);
  }, [notebook, isAdded]);

  useEffect(() => {
    const notebooks = getNotebooks();
    setNotebookList(notebooks.slice(0, 4));
  }, [isAdded]);

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

  if (notebook === UNSET) return <div className={cn("max-w-screen-lg mx-auto my-10 editor-page")}>Loading...</div>;

  if (!notebook) return notFound();

  function onUserInput(code) {
    const newNotebook = {...notebook, content: code};
    if (isAdded) {
      saveNotebook(newNotebook);
      setNotebook(newNotebook);
    } else {
      setNotebook(newNotebook);
      isDirtyStore.setDirty(true);
    }
  }

  function onRename() {
    setShowInput(true);
    setTitle(notebook.title);
  }

  // Only submit rename when blur with valid title.
  function onTitleBlur() {
    setShowInput(false);
    // The title can't be empty.
    if (!title) return setTitle(notebook.title);
    const newNotebook = {...notebook, title};
    setNotebook(newNotebook);
    if (isAdded) saveNotebook(newNotebook);
    else isDirtyStore.setDirty(true);
  }

  function onTitleChange(e) {
    setTitle(e.target.value);
  }

  function onTitleKeyDown(e) {
    if (e.key === "Enter") {
      onTitleBlur();
      titleRef.current.blur();
    }
  }

  // If long-running code is detected, set autoRun to false
  // to prevent the browser from freezing on infinite loops
  // and can't continue to edit the code.
  function onBeforeEachRun() {
    if (!isAdded) return;
    if (timer.current) clearTimeout(timer.current);
    const newNotebook = {...notebook, autoRun: false};
    saveNotebook(newNotebook);
    timer.current = setTimeout(() => {
      const newNotebook = {...notebook, autoRun: true};
      saveNotebook(newNotebook);
      timer.current = null;
    }, 100);
  }

  return (
    <div>
      {!isAdded && notebookList.length > 0 && (
        <div className={cn("flex h-[72px] bg-gray-100 p-2 w-full border-b border-gray-200")}>
          <div
            className={cn(
              "flex items-center justify-between gap-2 h-full max-w-screen-lg lg:mx-auto mx-4 w-full hidden md:flex",
            )}
          >
            {notebookList.map((notebook) => (
              <div key={notebook.id} className={cn("flex items-start flex-col gap-1")}>
                <SafeLink
                  href={`/notebooks/${notebook.id}`}
                  key={notebook.id}
                  className={cn(
                    "font-semibold hover:underline text-blue-500 whitespace-nowrap line-clamp-1 max-w-[150px] text-ellipsis",
                  )}
                >
                  {notebook.title}
                </SafeLink>
                <span
                  className={cn("text-xs text-gray-500 line-clamp-1 whitespace-nowrap max-w-[150px] text-ellipsis")}
                >
                  Created {new Date(notebook.created).toLocaleDateString()}
                </span>
              </div>
            ))}
            <SafeLink href="/notebooks" className={cn("font-semibold text-blue-500 hover:underline")}>
              View your notebooks
            </SafeLink>
          </div>
          <div
            className={cn(
              "flex items-center justify-between gap-2 h-full max-w-screen-lg lg:mx-auto mx-4 w-full md:hidden",
            )}
          >
            <SafeLink
              href="/notebooks"
              className={cn(
                "font-medium w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-center hover:bg-gray-200",
              )}
            >
              View your notebooks
            </SafeLink>
          </div>
        </div>
      )}
      {!isAdded && notebookList.length === 0 && (
        <div className={cn("flex items-center justify-center h-[72px] mt-6 mb-10 lg:mb-0")}>
          <p className={cn("text-3xl text-gray-800 font-light text-center mx-10")}>
            Explore code and art with instant feedback.
          </p>
        </div>
      )}
      <div className={cn("max-w-screen-lg lg:mx-auto mx-4 lg:my-10 my-4 editor-page")}>
        <Editor
          initialCode={initialCode}
          key={notebook.id}
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
                  value={title}
                  onChange={onTitleChange}
                  onBlur={onTitleBlur}
                  onKeyDown={onTitleKeyDown}
                  ref={titleRef}
                  className={cn("border border-gray-200 rounded-md px-3 py-1 text-sm bg-white")}
                />
              ) : (
                <span className={cn("text-sm py-1 border border-gray-100 rounded-md")}>{notebook.title}</span>
              )}
            </div>
          }
        />
      </div>
    </div>
  );
}
