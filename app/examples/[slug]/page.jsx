import {getAllJSExamples} from "../../utils.js";
import {Editor} from "../../Editor.jsx";
import {notFound} from "next/navigation";

export async function generateStaticParams() {
  return getAllJSExamples().map((example) => ({slug: example.slug}));
}

export default async function Page({params}) {
  const {slug} = await params;
  const example = getAllJSExamples().find((example) => example.slug === slug);
  if (!example) notFound();
  return (
    <div>
      <a href={`https://github.com/recho-dev/recho/pull/${example.pull_request}`} target="_blank">
        Comment
      </a>
      <Editor initialCode={example.content} />
    </div>
  );
}
