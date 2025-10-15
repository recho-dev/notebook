import {getAllJSExamples} from "../utils.js";
import {cn} from "../cn.js";
import {Meta} from "../Meta.js";
import {ThumbnailServer} from "../ThumbnailServer.js";

export const metadata = {
  title: "Examples | Recho Notebook",
  description: "Examples | Recho Notebook",
};

export default function Page() {
  const examples = getAllJSExamples();
  const sortedExamples = examples.sort((a, b) => new Date(b.created) - new Date(a.created));
  return (
    <div className={cn("max-w-screen-xl lg:mx-auto mx-4 lg:my-12 my-4")}>
      <div className={cn("grid gap-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-3")}>
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
