import {codeToHtml} from "shiki";
import {useState, useEffect} from "react";
import {Thumbnail} from "./Thumbnail.jsx";

export function ThumbnailClient({code, outputStartLine = null}) {
  const [html, setHtml] = useState(null);
  useEffect(() => {
    codeToHtml(code, {
      lang: "javascript",
      theme: "github-light",
    }).then((html) => {
      setHtml(html);
    });
  }, [code]);
  return <Thumbnail html={html} outputStartLine={outputStartLine} />;
}
