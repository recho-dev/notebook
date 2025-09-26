"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {cn} from "./cn.js";

export function Sidebar({docs, onLinkClick}) {
  const pathname = usePathname();
  const isActive = (slug) => pathname.startsWith(`/docs/${slug}`);
  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };
  return (
    <ul className={cn("h-full", "overflow-auto px-4 w-full")}>
      {docs
        .sort((a, b) => a.order - b.order)
        .map((doc) => (
          <Link
            href={`/docs/${doc.slug}`}
            key={doc.title}
            className={cn("block px-3 py-2 rounded-md hover:bg-gray-100", isActive(doc.slug) && "bg-gray-100")}
            onClick={handleLinkClick}
          >
            <li>{doc.title}</li>
          </Link>
        ))}
    </ul>
  );
}
