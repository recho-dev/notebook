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
  return <Editor code={example.content} />;
}
