"use client";
import {useState, useEffect} from "react";
import Link from "next/link";
import {Trash} from "lucide-react";
import {ThumbnailClient} from "../ThumbnailClient.js";
import {getSketches, deleteSketch} from "../api.js";
import {findFirstOutputRange} from "../shared.js";
import {cn} from "../cn.js";

export default function Page() {
  const [sketches, setSketches] = useState([]);
  const isEmpty = sketches.length === 0;

  useEffect(() => {
    const sketches = getSketches();
    setSketches(sketches);
  }, []);

  useEffect(() => {
    document.title = "Sketches | Recho";
  }, []);

  function onDelete(id) {
    deleteSketch(id);
    const newSketches = sketches.filter((sketch) => sketch.id !== id);
    setSketches(newSketches);
  }

  if (isEmpty) {
    return (
      <div className={cn("text-center mt-20")}>
        <p className={cn("mt-4")}>No sketches found.</p>
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
    <div className={cn("max-w-screen-lg mx-auto my-10")}>
      {sketches.map((sketch) => (
        <div key={sketch.id} className={cn("mt-10")}>
          <div className={cn("flex items-center justify-between mb-2")}>
            <div>
              <Link href={`/sketches/${sketch.id}`} className={cn("font-semibold hover:underline text-blue-500")}>
                <span>{sketch.title}</span>
              </Link>
              <div className={cn("text-sm text-gray-500")}>Created {new Date(sketch.created).toLocaleDateString()}</div>
            </div>
            <button
              onClick={() => onDelete(sketch.id)}
              className={cn("hover:scale-110 transition-transform duration-100")}
            >
              <Trash className={cn("w-4 h-4")} />
            </button>
          </div>
          <div className={cn("w-full  border border-gray-200 rounded-md overflow-hidden max-h-[180px] px-3")}>
            <ThumbnailClient code={sketch.content} outputStartLine={findFirstOutputRange(sketch.content).startLine} />
          </div>
        </div>
      ))}
    </div>
  );
}
