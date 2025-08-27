"use client";
import {useRouter} from "next/navigation";
import {getDirty, getCount, setCount} from "./globals";

export function SafeLink({href, children}) {
  const router = useRouter();

  const handleClick = (e) => {
    e.preventDefault();
    const dirty = getDirty();
    if (dirty) {
      e.preventDefault();
      const confirmLeave = window.confirm("Your changes will be lost.");
      if (!confirmLeave) return;
    }
    if (href === "/") setCount(getCount() + 1);
    router.push(href);
  };

  return (
    <a href={href} onClick={handleClick}>
      {children}
    </a>
  );
}
