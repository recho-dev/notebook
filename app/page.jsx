"use client";
import {useSyncExternalStore} from "react";
import {EditorPage} from "./EditorPage.jsx";
import {editorStore} from "./store.js";

export default function Page() {
  const store = useSyncExternalStore(editorStore.subscribe, editorStore.getSnapshot, editorStore.getServerSnapshot);
  return <EditorPage key={store.count} />;
}
