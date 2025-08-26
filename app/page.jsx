"use client";
import {useState, useRef, useMemo, useEffect} from "react";
import {Editor} from "./Editor.jsx";

function isDev() {
  return process.env.NODE_ENV === "development";
}

function createDefaultFile() {
  return {
    id: uid(),
    title: "Hello, world!",
    created: new Date().toISOString(),
    content: `doc("Hello, world!");`,
  };
}

function getFilesFromLocalStorage() {
  const files = localStorage.getItem("obs-files");
  if (!files) {
    const newFiles = [createDefaultFile()];
    saveFilesToLocalStorage(newFiles);
    saveActiveIdToLocalStorage(newFiles[0].id);
    return newFiles;
  }
  return JSON.parse(files).sort((a, b) => new Date(b.created) - new Date(a.created));
}

function getActiveIdFromLocalStorage() {
  const activeId = localStorage.getItem("obs-activeId");
  return activeId ?? null;
}

function saveFilesToLocalStorage(files) {
  localStorage.setItem("obs-files", JSON.stringify(files));
}

function saveActiveIdToLocalStorage(activeId) {
  localStorage.setItem("obs-activeId", activeId);
}

function clearFilesFromLocalStorage() {
  localStorage.removeItem("obs-files");
  localStorage.removeItem("obs-activeId");
}

function uid() {
  return Math.random().toString(36).substring(2, 15);
}

export default function Page() {
  const [files, setFiles] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [renameTitle, setRenameTitle] = useState(null);
  const [open, setOpen] = useState(false);
  const initialCode = useMemo(() => files.find((f) => f.id === activeId)?.content ?? null, [activeId, files]);
  const activeFile = useMemo(() => files.find((f) => f.id === activeId), [activeId, files]);
  const inputRef = useRef(null);

  // To prevent hydration error, we need to load the files from localStorage in useEffect.
  useEffect(() => {
    const savedFiles = getFilesFromLocalStorage();
    const savedActiveId = getActiveIdFromLocalStorage();
    setFiles(savedFiles);
    setActiveId(savedActiveId || savedFiles[0]?.id || null);
  }, []);

  function setAndSaveFiles(files) {
    setFiles(files);
    saveFilesToLocalStorage(files);
  }

  function setAndSaveActiveId(activeId) {
    setActiveId(activeId);
    saveActiveIdToLocalStorage(activeId);
  }

  function onDelete(id) {
    if (confirm("Are you sure you want to delete this file?")) {
      const index = files.findIndex((f) => f.id === id);
      const nextActiveId = files[index + 1]?.id ?? files[index - 1]?.id ?? null;
      const newFiles = files.filter((f) => f.id !== id);
      setAndSaveFiles(newFiles);
      setAndSaveActiveId(nextActiveId);
    }
  }

  function onNew() {
    const newFile = createDefaultFile();
    setAndSaveFiles([newFile, ...files]);
    setAndSaveActiveId(newFile.id);
  }

  function onSelect(id) {
    setAndSaveActiveId(id);
    setRenameTitle(null);
    setOpen(false);
  }

  function onSelectRename(title) {
    setRenameTitle(title);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }

  function onRename(title) {
    setRenameTitle(title);
  }

  function onCancelRename() {
    // Blur event will be triggered after clicking the OK button as well,
    // so wait for 100ms to handle rename before removing the OK button.
    setTimeout(() => {
      setRenameTitle(null);
    }, 100);
  }

  function onSubmitRename() {
    const newFiles = files.map((f) => (f.id === activeId ? {...f, title: renameTitle} : f));
    setAndSaveFiles(newFiles);
    setRenameTitle(null);
  }

  function onUserInput(code) {
    const newFiles = files.map((f) => (f.id === activeId ? {...f, content: code} : f));
    setAndSaveFiles(newFiles);
  }

  function onKeyDown(e) {
    if (e.key === "Enter") onSubmitRename();
  }

  return (
    <div>
      {open ? (
        <div>
          <button onClick={() => setOpen(false)}>Close</button>
          {files.map((f) => (
            <div key={f.id} style={{display: "flex"}}>
              <span style={{cursor: "pointer"}} onClick={() => onSelect(f.id)}>
                {f.title}
              </span>
              <span>{new Date(f.created).toLocaleDateString()}</span>
              <button onClick={() => onDelete(f.id)}>Delete</button>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div style={{display: "flex"}}>
            <button onClick={() => setOpen(true)}>Open</button>
            <button onClick={onNew}>New</button>
            {isDev() && <button onClick={clearFilesFromLocalStorage}>Clear</button>}
            {renameTitle === null ? (
              <>
                <button onClick={() => onSelectRename(activeFile?.title)}>Rename</button>
                <span>{activeFile?.title}</span>
              </>
            ) : (
              <>
                <button onClick={onSubmitRename}>OK</button>
                <input
                  type="text"
                  value={renameTitle}
                  onChange={(e) => onRename(e.target.value)}
                  onKeyDown={onKeyDown}
                  onBlur={onCancelRename}
                  ref={inputRef}
                />
              </>
            )}
          </div>
          {initialCode && <Editor initialCode={initialCode} onUserInput={onUserInput} />}
        </div>
      )}
    </div>
  );
}
