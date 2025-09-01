import {codeToHtml} from "shiki";
import {Thumbnail} from "./Thumbnail.jsx";

export async function ThumbnailServer({code, ...rest}) {
  const html = await codeToHtml(code, {
    lang: "javascript",
    theme: "github-light",
  });
  return <Thumbnail html={html} {...rest} />;
}
