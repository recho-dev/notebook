import {Suspense} from "react";
import {getAllJSExamples} from "../utils.js";
import {cn} from "../cn.js";
import {Meta} from "../Meta.js";
import {ThumbnailServer} from "../ThumbnailServer.js";
import {LabelFilters} from "./LabelFilters.jsx";

export const metadata = {
  title: "Examples | Recho Notebook",
  description: "Examples | Recho Notebook",
};

const examples = getAllJSExamples();

export default async function Page({searchParams}) {
  // Extract all unique labels from examples
  const allLabels = new Set();
  examples.forEach((example) => {
    if (example.label && Array.isArray(example.label)) {
      example.label.forEach((label) => allLabels.add(label));
    }
  });
  const sortedLabels = Array.from(allLabels).sort();

  // Get selected labels from searchParams (handle both Promise and non-Promise cases)
  const params = await searchParams;
  const selectedLabels = params?.labels ? (Array.isArray(params.labels) ? params.labels : [params.labels]) : [];

  // Filter examples based on selected labels
  // If no labels selected or "All" is selected, show all examples
  const filteredExamples =
    selectedLabels.length === 0 || selectedLabels.includes("All")
      ? examples
      : examples.filter((example) => {
          if (!example.label || !Array.isArray(example.label)) return false;
          return selectedLabels.some((selectedLabel) => example.label.includes(selectedLabel));
        });

  const sortedExamples = filteredExamples.sort((a, b) => new Date(b.created) - new Date(a.created));

  return (
    <div className={cn("max-w-screen-xl lg:mx-auto mx-4 my-4")}>
      <Suspense fallback={<div className={cn("flex flex-wrap gap-2 items-center")}>Loading filters...</div>}>
        <LabelFilters allLabels={sortedLabels} />
      </Suspense>
      <div className={cn("grid gap-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-10")}>
        {sortedExamples.map((example) => (
          <div key={example.slug}>
            <Meta example={example} />
            <div className={cn("w-full pt-[62.5%] relative  border border-gray-200 rounded-md overflow-hidden")}>
              <div className={cn("absolute inset-0 px-3")}>
                <ThumbnailServer code={example.content} outputStartLine={example.outputStartLine} snap={example.snap} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
