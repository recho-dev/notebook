import {notFound} from "next/navigation";
import {getAllJSDocs, removeJSMeta} from "../../utils.js";
import {Editor} from "../../Editor.jsx";
import {cn} from "../../cn.js";

export async function generateStaticParams() {
  return getAllJSDocs().map((doc) => ({slug: doc.slug}));
}

export async function generateMetadata({params}) {
  const {slug} = await params;
  const doc = getAllJSDocs().find((doc) => doc.slug === slug);
  if (!doc) notFound();
  return {
    title: `${doc.title} | Recho`,
  };
}

export default async function Page({params}) {
  const {slug} = await params;
  const doc = getAllJSDocs().find((doc) => doc.slug === slug);
  if (!doc) notFound();
  return (
    <div className={cn("mx-4 my-4")}>
      <Editor initialCode={removeJSMeta(doc.content)} pinToolbar={true} />
    </div>
  );
}
