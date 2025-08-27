"use client";
import {useRouter} from "next/navigation";
import {getDirty} from "./dirty";

export function SafeLink({href, children}) {
  const router = useRouter();

  const handleClick = (e) => {
    const dirty = getDirty();
    if (dirty) {
      e.preventDefault();
      const confirmLeave = window.confirm("Your changes will be lost.");
      if (!confirmLeave) return;
    }
    router.push(href);
  };

  return (
    <a href={href} onClick={handleClick}>
      {children}
    </a>
  );
}
