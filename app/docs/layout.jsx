import {getAllJSDocs} from "../utils.js";
import {DocsLayoutClient} from "./DocsLayoutClient.jsx";

export const metadata = {
  title: "Docs | Recho Notebook",
  description: "Docs | Recho Notebook",
};

export default function Layout({children}) {
  const docs = getAllJSDocs();
  return <DocsLayoutClient docs={docs}>{children}</DocsLayoutClient>;
}
