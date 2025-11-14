"use client";

import {useRouter, useSearchParams} from "next/navigation";
import {cn} from "../cn.js";

export function LabelFilters({allLabels}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get selected labels from URL searchParams
  const currentLabels = searchParams.getAll("labels");
  const selectedLabels = currentLabels.length > 0 ? currentLabels : [];

  function toggleLabel(label) {
    const params = new URLSearchParams(searchParams.toString());
    const currentLabels = params.getAll("labels");
    
    if (label === "All") {
      // If "All" is clicked, clear all labels
      params.delete("labels");
    } else {
      // Remove "All" if it exists
      const filteredLabels = currentLabels.filter((l) => l !== "All");
      
      // Toggle the clicked label
      if (filteredLabels.includes(label)) {
        // Remove the label
        const newLabels = filteredLabels.filter((l) => l !== label);
        if (newLabels.length === 0) {
          // If no labels remain, show all (remove params)
          params.delete("labels");
        } else {
          params.delete("labels");
          newLabels.forEach((l) => params.append("labels", l));
        }
      } else {
        // Add the label
        params.delete("labels");
        [...filteredLabels, label].forEach((l) => params.append("labels", l));
      }
    }
    
    router.push(`/examples?${params.toString()}`);
  }

  const isAllSelected = selectedLabels.length === 0 || selectedLabels.includes("All");
  const isLabelSelected = (label) => selectedLabels.includes(label);

  return (
    <div className={cn("flex flex-wrap gap-2 items-center")}>
      <button
        onClick={() => toggleLabel("All")}
        className={cn(
          "px-4 py-2 rounded-md text-sm font-medium transition-colors",
          isAllSelected
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        )}
      >
        All
      </button>
      {allLabels.map((label) => (
        <button
          key={label}
          onClick={() => toggleLabel(label)}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
            isLabelSelected(label)
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

