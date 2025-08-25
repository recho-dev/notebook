import {getAllJSDocs} from "../../utils.js";
import {Editor} from "../../Editor.jsx";
import {notFound} from "next/navigation";

export async function generateStaticParams() {
  return getAllJSDocs().map((doc) => ({slug: doc.slug}));
}

export default async function Page({params}) {
  const {slug} = await params;
  const doc = getAllJSDocs().find((doc) => doc.slug === slug);
  if (!doc) notFound();
  return <Editor code={doc.content} />;
}
