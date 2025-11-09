"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {cn} from "./cn.js";
import {useState} from "react";
import {ChevronRight} from "lucide-react";

function NavItem({doc, isActive, onClick}) {
  return (
    <Link
      href={`/docs/${doc.slug}`}
      className={cn("block px-3 py-2 rounded-md hover:bg-gray-100", isActive(doc.slug) && "bg-gray-100")}
      onClick={onClick}
    >
      <li>{doc.title}</li>
    </Link>
  );
}

function NavGroup({group, docsMap, isActive, onClick}) {
  // const pathname = usePathname();
  // const isGroupActive = group.slug === pathname.split("/docs/")[1] || group.items.some((item) => isActive(item.slug));
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <div className={cn(isActive(group.slug) && "bg-gray-100", "flex items-center rounded-md hover:bg-gray-100")}>
        {group.slug ? (
          <Link href={`/docs/${group.slug}`} className={cn("flex-1 px-3 py-2")} onClick={onClick}>
            <span className="font-medium">{group.title}</span>
          </Link>
        ) : (
          <span className="font-medium cursor-pointer px-3 py-2 flex-1" onClick={() => setIsOpen(!isOpen)}>
            {group.title}
          </span>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn("px-2 py-2 ")}
          aria-label={isOpen ? "Collapse section" : "Expand section"}
        >
          <ChevronRight className={cn("w-4 h-4 transition-transform", isOpen && "rotate-90")} />
        </button>
      </div>
      {isOpen && (
        <ul className="ml-4">
          {group.items.map((item) => {
            const doc = docsMap[item.slug];
            if (!doc) return null;
            return <NavItem key={doc.slug} doc={doc} isActive={isActive} onClick={onClick} />;
          })}
        </ul>
      )}
    </div>
  );
}

export function Sidebar({navStructure, docsMap, onLinkClick}) {
  const pathname = usePathname();
  const isActive = (slug) => pathname === `/docs/${slug}`;
  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };
  return (
    <ul className={cn("h-full", "overflow-auto px-4 w-full")}>
      {navStructure.map((item) => {
        if (item.type === "group") {
          return (
            <NavGroup
              key={item.slug || item.title}
              group={item}
              docsMap={docsMap}
              isActive={isActive}
              onClick={handleLinkClick}
            />
          );
        } else {
          const doc = docsMap[item.slug];
          if (!doc) return null;
          return <NavItem key={doc.slug} doc={doc} isActive={isActive} onClick={handleLinkClick} />;
        }
      })}
    </ul>
  );
}
