import {cn} from "../cn.js";

const news = [
  {
    title: "A Lighter Way to Code with Creativity",
    publishedAt: "2025-10-01",
    summary: "Introducing Recho: a light learning and exploration environment.",
    link: "https://medium.com/@subairui/a-lighter-way-to-code-with-creativity-8c0ac739aa6f",
    author: "Bairui SU",
    image: "a-ligter-way-to-code-with-creativity.png",
  },
];

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
