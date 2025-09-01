"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {cn} from "./cn.js";

export function Sidebar({docs}) {
  const pathname = usePathname();
  const isActive = (slug) => pathname.startsWith(`/docs/${slug}`);
  return (
    <ul className={cn("h-full", "overflow-auto px-4 border-r border-gray-200 pt-2")} style={{width: "320px"}}>
      {docs
        .sort((a, b) => a.order - b.order)
        .map((doc) => (
          <Link
            href={`/docs/${doc.slug}`}
            key={doc.title}
            className={cn("block px-3 py-2 rounded-md hover:bg-gray-100", isActive(doc.slug) && "bg-gray-100")}
          >
            <li>{doc.title}</li>
          </Link>
        ))}
    </ul>
  );
}
