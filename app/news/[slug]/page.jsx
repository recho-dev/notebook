import {notFound, redirect} from "next/navigation";
import {news} from "../data.js";

function toKebabCase(str) {
  return str.toLowerCase().replace(/ /g, "-");
}

function slugof(news) {
  return news.slug || toKebabCase(news.title);
}

export async function generateStaticParams() {
  return news.map((news) => ({slug: slugof(news)}));
}

export async function generateMetadata({params}) {
  const {slug} = await params;
  const blog = news.find((news) => slugof(news) === slug);
  if (!blog) notFound();
  return {
    title: `${blog.title} | Recho Notebook`,
  };
}

export default async function Page({params}) {
  const {slug} = await params;
  const blog = news.find((news) => slugof(news) === slug);
  if (!blog) notFound();
  redirect(blog.link);
}
