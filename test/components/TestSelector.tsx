import {useAtom} from "jotai";
import {selectedTestAtom, getTestSampleName} from "../store.ts";
import * as testSamples from "../js/index.js";
import {ChevronLeftIcon, ChevronRightIcon} from "lucide-react";
import {useEffect, useMemo} from "react";

const tests = Object.keys(testSamples).toSorted();

export function TestSelector() {
  const [selectedTest, setSelectedTest] = useAtom(selectedTestAtom);

  const selectedIndex = useMemo(() => tests.indexOf(selectedTest), [selectedTest]);

  useEffect(() => {
    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set("test", selectedTest);
    window.history.pushState({}, "", url);
  }, [selectedTest]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTest = e.target.value;
    setSelectedTest(newTest);
  };

  const handlePrevious = () => {
    if (selectedIndex > 0) {
      setSelectedTest(tests[selectedIndex - 1]);
    }
  };

  const handleNext = () => {
    if (selectedIndex < tests.length - 1) {
      setSelectedTest(tests[selectedIndex + 1]);
    }
  };

  return (
    <div className="flex flex-row items-center gap-2">
      <button
        className="text-stone-900 disabled:text-stone-400"
        disabled={selectedIndex === 0}
        onClick={handlePrevious}
      >
        <ChevronLeftIcon className="w-4 h-4" />
      </button>
      <select
        value={selectedTest}
        onChange={handleChange}
        className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {tests.map((key) => (
          <option key={key} value={key}>
            {getTestSampleName(key)}
          </option>
        ))}
      </select>
      <button
        className="text-stone-900 disabled:text-stone-400"
        disabled={selectedIndex === tests.length - 1}
        onClick={handleNext}
      >
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
