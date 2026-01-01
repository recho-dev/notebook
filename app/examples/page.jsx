import {Suspense} from "react";
import {getAllJSExamples} from "../utils.js";
import {cn} from "../cn.js";
import {LabelFilters} from "./LabelFilters.jsx";
import {ExamplesClient} from "./ExamplesClient.jsx";

export const metadata = {
  title: "Examples | Recho Notebook",
  description: "Examples | Recho Notebook",
};

// Cache examples at module level - Node.js module cache ensures this only runs once per process
// This keeps the page static and fast
const examples = getAllJSExamples();

// Extract all unique labels from examples (done once at module level)
const allLabels = (() => {
  const labelSet = new Set();
  examples.forEach((example) => {
    if (example.label && Array.isArray(example.label)) {
      example.label.forEach((label) => labelSet.add(label));
    }
  });
  return Array.from(labelSet).sort();
})();

export default function Page() {
  // Page is static - no searchParams usage here!
  // All filtering happens client-side via ExamplesClient component
  return (
    <div className={cn("max-w-screen-xl lg:mx-auto mx-4 my-4")}>
      <Suspense fallback={<div className={cn("flex flex-wrap gap-2 items-center")}>Loading filters...</div>}>
        <LabelFilters allLabels={allLabels} />
      </Suspense>
      <ExamplesClient examples={examples} />
    </div>
  );
}
