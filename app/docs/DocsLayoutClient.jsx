"use client";
import {Sidebar} from "../Sidebar.js";
import {cn} from "../cn.js";
import {useState, useEffect, useRef} from "react";
import {TableOfContents} from "lucide-react";

export function DocsLayoutClient({navStructure, docsMap, children}) {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const overlayRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (overlayRef.current && !overlayRef.current.contains(event.target)) {
        setOverlayOpen(false);
      }
    }
    if (overlayOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [overlayOpen]);

  useEffect(() => {
    setOverlayOpen(false);
  }, [children]);

  return (
    <div className={cn("flex", "h-[calc(100vh-65px)] overflow-auto")}>
      <div className={cn("hidden md:block")}>
        <div style={{width: "320px"}} className={cn("pt-4 h-full")}>
          <Sidebar navStructure={navStructure} docsMap={docsMap} />
        </div>
      </div>
      <div className={cn("flex-1", "overflow-auto relative")}>
        <div
          className={cn("md:hidden absolute top-0 left-0 z-10 w-full h-12 border-b border-gray-200 flex items-center")}
        >
          <button
            onClick={() => setOverlayOpen(true)}
            className={cn("bg-white rounded-md flex items-center gap-2 mx-4")}
            aria-label="Open navigation menu"
          >
            <TableOfContents className="w-5 h-5" />
            <span className="text-sm">Menu</span>
          </button>
        </div>
        <div className={cn("md:pt-0 pt-12")}>{children}</div>
        {overlayOpen && (
          <div className={cn("md:hidden fixed inset-0 z-50")} style={{background: "#0009"}}>
            <div className={cn("absolute inset-0 bg-black bg-opacity-50")} />
            <div ref={overlayRef} className={cn("absolute left-0 top-0 h-full w-80 bg-white shadow-xl overflow-auto")}>
              <div className={cn("pt-4")}>
                <Sidebar navStructure={navStructure} docsMap={docsMap} onLinkClick={() => setOverlayOpen(false)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
