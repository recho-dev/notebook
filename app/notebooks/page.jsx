"use client";
import {useState, useEffect} from "react";
import Link from "next/link";
import {Trash} from "lucide-react";
import {ThumbnailClient} from "../ThumbnailClient.js";
import {getNotebooks, deleteNotebook} from "../api.js";
import {findFirstOutputRange} from "../shared.js";
import {cn} from "../cn.js";

export default function Page() {
  const [notebooks, setNotebooks] = useState([]);
  const isEmpty = notebooks.length === 0;

  useEffect(() => {
    const notebooks = getNotebooks();
    setNotebooks(notebooks);
  }, []);

  useEffect(() => {
    document.title = "Notebooks | Recho Notebook";
  }, []);

  function onDelete(id) {
    deleteNotebook(id);
    const newNotebooks = notebooks.filter((notebook) => notebook.id !== id);
    setNotebooks(newNotebooks);
  }

  if (isEmpty) {
    return (
      <div className={cn("text-center mt-20")}>
        <p className={cn("mt-4")}>No notebooks found.</p>
        <Link
          href="/"
          className={cn("mt-4", "inline-block bg-black text-white rounded-md px-3 py-1 text-sm hover:bg-gray-800")}
        >
          New
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("max-w-screen-lg lg:mx-auto mx-4 my-10")}>
      {notebooks.map((notebook) => (
        <div key={notebook.id} className={cn("mt-10")}>
          <div className={cn("flex items-center justify-between mb-2")}>
            <div>
              <Link href={`/notebooks/${notebook.id}`} className={cn("font-semibold hover:underline text-blue-500")}>
                <span>{notebook.title}</span>
              </Link>
              <div className={cn("text-sm text-gray-500")}>
                Created {new Date(notebook.created).toLocaleDateString()}
              </div>
            </div>
            <button
              onClick={() => onDelete(notebook.id)}
              className={cn("hover:scale-110 transition-transform duration-100")}
            >
              <Trash className={cn("w-4 h-4")} />
            </button>
          </div>
          <div className={cn("w-full  border border-gray-200 rounded-md overflow-hidden max-h-[180px] px-3")}>
            <ThumbnailClient
              code={notebook.content}
              outputStartLine={findFirstOutputRange(notebook.content).startLine}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
