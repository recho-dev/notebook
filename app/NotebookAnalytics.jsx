"use client";

import {Analytics} from "@vercel/analytics/next";
import {BASE_PATH} from "./shared.js";

function prefixNotebookPath(event) {
  const url = new URL(event.url);
  if (url.pathname === BASE_PATH || url.pathname.startsWith(`${BASE_PATH}/`)) {
    return event;
  }
  url.pathname = `${BASE_PATH}${url.pathname === "/" ? "" : url.pathname}`;
  return {...event, url: url.toString()};
}

export function NotebookAnalytics() {
  return <Analytics beforeSend={prefixNotebookPath} />;
}
