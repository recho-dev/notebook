import {useAtom} from "jotai";
import {selectedTestAtom, getTestSampleName} from "../store.ts";
import * as testSamples from "../js/index.js";

export function TestSelector() {
  const [selectedTest, setSelectedTest] = useAtom(selectedTestAtom);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTest = e.target.value;
    setSelectedTest(newTest);
    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set("test", newTest);
    window.history.pushState({}, "", url);
  };

  return (
    <select
      value={selectedTest}
      onChange={handleChange}
      className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {Object.keys(testSamples).map((key) => (
        <option key={key} value={key}>
          {getTestSampleName(key)}
        </option>
      ))}
    </select>
  );
}
