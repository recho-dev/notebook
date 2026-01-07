"use client";
import {useState, useEffect, useRef, useCallback} from "react";
import {notFound, useRouter} from "next/navigation";
import {Camera} from "lucide-react";
import {Editor} from "./Editor.jsx";
import {cn} from "./cn.js";
import {BASE_PATH} from "./shared.js";
import {SnapshotsDialog} from "../components/notebooks/SnapshotsDialog.tsx";
import {useNotebook} from "@/lib/notebooks/hooks.ts";
import {NotebookTitle} from "../components/notebooks/NotebookTitle.tsx";
import {EditorPageHero} from "../components/notebooks/EditorPageHero.tsx";

export function EditorPage({id: initialId}) {
  const router = useRouter();
  const {
    notebook,
    isDraft,
    isDirty,
    initialContent,
    saveNotebook,
    updateContent,
    updateTitle,
    createSnapshot,
    restoreContent,
  } = useNotebook(initialId);
  const [showSnapshotsDialog, setShowSnapshotsDialog] = useState(false);
  const timer = useRef(null);

  const onSave = useCallback(() => {
    if (notebook === null) return;
    saveNotebook();
    // Just update the url, no need to reload the page.
    const url = `${BASE_PATH}/works/${notebook.id}`;
    window.history.pushState(null, "", url);
  }, [notebook, saveNotebook]);

  useEffect(() => {
    // Use setTimeout to avoid changing to default title.
    if (notebook) {
      setTimeout(() => {
        document.title = `${isDirty ? "* " : ""}${isDraft ? "New" : notebook.title}| Recho Notebook`;
      }, 100);
    }
  }, [notebook, isDirty, isDraft]);

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

  if (!notebook) return notFound();

  // If long-running code is detected, set autoRun to false
  // to prevent the browser from freezing on infinite loops
  // and can't continue to edit the code.
  function onBeforeEachRun() {
    if (isDraft) return;
    if (timer.current) clearTimeout(timer.current);
    const newNotebook = {...notebook, autoRun: false};
    saveNotebook(newNotebook);
    timer.current = setTimeout(() => {
      const newNotebook = {...notebook, autoRun: true};
      saveNotebook(newNotebook);
      timer.current = null;
    }, 100);
  }

  function onDuplicate() {
    const duplicated = duplicateNotebook(notebook);
    addNotebook(duplicated);
    router.push(`/works/${duplicated.id}`);
  }

  function onRestoreSnapshot(snapshot) {
    restoreContent(snapshot.content);
  }

  return (
    <div>
      <EditorPageHero show={isDraft} />
      <div className={cn("max-w-screen-lg lg:mx-auto mx-4 lg:my-10 my-4 editor-page")}>
        <Editor
          initialCode={initialContent}
          key={notebook.id}
          onUserInput={updateContent}
          onBeforeEachRun={onBeforeEachRun}
          autoRun={notebook.autoRun}
          onDuplicate={isDraft ? onDuplicate : null}
          toolBarStart={
            <NotebookTitle
              title={notebook.title}
              setTitle={updateTitle}
              isDraft={isDraft}
              isDirty={isDirty}
              onCreate={onSave}
            />
          }
          toolBarEnd={
            isDraft ? null : (
              <button
                onClick={() => setShowSnapshotsDialog(true)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-200 transition-colors",
                )}
                data-tooltip-id="action-tooltip"
                data-tooltip-content="Manage Snapshots"
                data-tooltip-place="bottom"
              >
                <Camera className={cn("w-4 h-4")} />
                <span>Snapshots</span>
              </button>
            )
          }
        />
        <SnapshotsDialog
          notebook={notebook}
          open={showSnapshotsDialog}
          createSnapshot={createSnapshot}
          onOpenChange={setShowSnapshotsDialog}
          onRestore={onRestoreSnapshot}
        />
      </div>
    </div>
  );
}
