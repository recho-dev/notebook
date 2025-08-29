"use client";
import {useSyncExternalStore} from "react";
import {useRouter} from "next/navigation";
import {isDirtyStore, countStore} from "./store.js";

export function SafeLink({href, children}) {
  const router = useRouter();
  const isDirty = useSyncExternalStore(
    isDirtyStore.subscribe,
    isDirtyStore.getSnapshot,
    isDirtyStore.getServerSnapshot,
  );

  const handleClick = (e) => {
    e.preventDefault();
    if (isDirty) {
      e.preventDefault();
      const confirmLeave = window.confirm("Your changes will be lost.");
      if (!confirmLeave) return;
    }
    if (href === "/") countStore.increment();
    router.push(href);
  };

  return (
    <a href={href} onClick={handleClick}>
      {children}
    </a>
  );
}
