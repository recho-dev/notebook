import {load} from "cheerio";
import {cn} from "./cn.js";
import {BASE_PATH} from "./shared.js";

function removeEmptyLines(string) {
  const [first, ...rest] = string.split("\n").filter((line) => line.trim() !== "");
  // If the first line ends with <code>, the code is already in the first line.
  if (first.endsWith("<code>")) return first + rest.join("\n");
  return first + "\n" + rest.join("\n");
}

export function Thumbnail({html, outputStartLine = null, snap = null}) {
  if (outputStartLine === null) return <div dangerouslySetInnerHTML={{__html: html}} />;
  const $ = load(html);
  const lines = $("span.line");
  for (let i = 0; i < lines.length; i++) {
    if (i < outputStartLine - 1) {
      $(lines[i]).remove();
    }
  }
  if (snap) {
    return (
      <div
        className={cn("w-full h-full bg-cover bg-center")}
        style={{backgroundImage: `url(${BASE_PATH}/examples/${snap})`}}
      />
    );
  }
  return <div dangerouslySetInnerHTML={{__html: removeEmptyLines($.html())}} className={cn("w-full h-full")} />;
}
