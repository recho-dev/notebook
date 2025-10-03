import {cn} from "../cn.js";
import {news} from "./data.js";

export default function News() {
  return (
    <div className={cn("max-w-screen-lg lg:mx-auto mx-4 lg:my-10 my-6 font-mono")}>
      {news.map((news) => (
        <a href={news.link} target="_blank" rel="noreferrer" key={news.title}>
          <div>
            <h2 className={cn("lg:text-3xl text-2xl font-bold mb-2")}>{news.title}</h2>
            <p className={cn("lg:text-lg text-base text-gray-500")}>
              <span>{news.author}</span> • <span>{news.publishedAt}</span>
            </p>
            <p className={cn("lg:text-lg text-base text-gray-600 mb-2")}>{news.summary}</p>
            <img src={`/news/${news.image}`} alt={news.title} className={cn("w-full h-auto")} />
          </div>
        </a>
      ))}
    </div>
  );
}
