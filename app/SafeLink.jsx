"use client";
import {useSyncExternalStore} from "react";
import {useRouter} from "next/navigation";
import {editorStore} from "./store.js";

export function SafeLink({href, children}) {
  const router = useRouter();
  const store = useSyncExternalStore(editorStore.subscribe, editorStore.getSnapshot, editorStore.getServerSnapshot);

  const handleClick = (e) => {
    e.preventDefault();
    if (store.isDirty) {
      e.preventDefault();
      const confirmLeave = window.confirm("Your changes will be lost.");
      if (!confirmLeave) return;
    }
    if (href === "/") editorStore.increment();
    router.push(href);
  };

  return (
    <a href={href} onClick={handleClick}>
      {children}
    </a>
  );
}
