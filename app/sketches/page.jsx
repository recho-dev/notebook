"use client";
import {useState, useEffect} from "react";
import {getSketches, deleteSketch} from "../api.js";
import Link from "next/link";

export default function Page() {
  const [sketches, setSketches] = useState([]);

  useEffect(() => {
    const sketches = getSketches();
    setSketches(sketches);
  }, []);

  function onDelete(id) {
    deleteSketch(id);
    const newSketches = sketches.filter((sketch) => sketch.id !== id);
    setSketches(newSketches);
  }

  return (
    <div>
      {sketches.map((sketch) => (
        <div key={sketch.id}>
          <Link href={`/sketches/${sketch.id}`}>
            <span>{sketch.title}</span>
          </Link>
          &nbsp;
          <span>{new Date(sketch.createdAt).toLocaleDateString()}</span>
          &nbsp;
          <span>{new Date(sketch.updatedAt).toLocaleDateString()}</span>
          &nbsp;
          <button onClick={() => onDelete(sketch.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
