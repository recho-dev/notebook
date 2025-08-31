import {notFound} from "next/navigation";
import {getAllJSExamples} from "../../utils.js";
import {Editor} from "../../Editor.jsx";
import {cn} from "../../cn.js";
import {Meta} from "../../Meta.js";

export async function generateStaticParams() {
  return getAllJSExamples().map((example) => ({slug: example.slug}));
}

export default async function Page({params}) {
  const {slug} = await params;
  const example = getAllJSExamples().find((example) => example.slug === slug);
  if (!example) notFound();
  return (
    <div className={cn("max-w-screen-lg mx-auto my-10")}>
      <div className={cn("mb-6")}>
        <Meta example={example} />
      </div>
      <Editor
        initialCode={example.content}
        toolBarStart={
          <div className={cn("flex items-center")}>
            <a
              href={`https://github.com/recho-dev/recho/pull/${example.pull_request}`}
              target="_blank"
              rel="noreferrer"
              className={cn("bg-green-700 text-white rounded-md px-3 py-1 text-sm hover:bg-green-800")}
            >
              Comment
            </a>
          </div>
        }
      />
    </div>
  );
}
