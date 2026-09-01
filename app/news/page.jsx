import {cn} from "../cn.js";
import {BASE_PATH} from "../shared.js";
import {news} from "./data.js";

export const metadata = {
  title: "News | Recho Notebook",
  description: "News | Recho Notebook",
};

export default function Page() {
  const items = [...news].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  return (
    <div className={cn("max-w-screen-lg lg:mx-auto mx-4 my-6 lg:my-10 font-mono")}>
      {items.map((item) => (
        <article className={cn("py-4 mb-16")} key={item.title}>
          <a href={item.link} target="_blank" rel="noreferrer" className={cn("block hover:underline")}>
            <h2 className={cn("text-2xl lg:text-3xl font-bold mb-4")}>{item.title}</h2>
          </a>
          <p className={cn("text-base lg:text-lg text-gray-500 mb-1")}>
            <span>{item.author}</span> • <span>{item.publishedAt}</span>
          </p>
          <p className={cn("text-base lg:text-lg text-gray-600 mb-4")}>{item.summary}</p>
          <img src={`${BASE_PATH}/news/${item.image}`} alt={item.title} className={cn("w-full h-auto block")} />
        </article>
      ))}
    </div>
  );
}
