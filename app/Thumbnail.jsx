import {codeToHtml} from "shiki";
import {load} from "cheerio";

function removeEmptyLines(string) {
  const [first, ...rest] = string.split("\n").filter((line) => line.trim() !== "");
  return first + rest.join("\n");
}

export async function Thumbnail({code, outputStartLine}) {
  const html = await codeToHtml(code, {
    lang: "javascript",
    theme: "github-light",
  });
  if (outputStartLine === null) return <div dangerouslySetInnerHTML={{__html: html}} />;
  const $ = load(html);
  const lines = $("span.line");
  for (let i = 0; i < lines.length; i++) {
    if (i < outputStartLine - 1) {
      $(lines[i]).remove();
    }
  }
  return <div dangerouslySetInnerHTML={{__html: removeEmptyLines($.html())}} />;
}
