import {notFound, redirect} from "next/navigation";
import {news} from "../data.js";

function toKebabCase(str) {
  return str.toLowerCase().replace(/ /g, "-");
}

function slugof(item) {
  return item.slug || toKebabCase(item.title);
}

export async function generateStaticParams() {
  return news.map((item) => ({slug: slugof(item)}));
}

export async function generateMetadata({params}) {
  const {slug} = await params;
  const blog = news.find((item) => slugof(item) === slug);
  if (!blog) notFound();
  return {
    title: `${blog.title} | Recho Notebook`,
  };
}

export default async function Page({params}) {
  const {slug} = await params;
  const blog = news.find((item) => slugof(item) === slug);
  if (!blog) notFound();
  redirect(blog.link);
}
