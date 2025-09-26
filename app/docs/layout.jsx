import {getAllJSDocs} from "../utils.js";
import {DocsLayoutClient} from "./DocsLayoutClient.jsx";

export const metadata = {
  title: "Docs | Recho",
  description: "Docs | Recho",
};

export default function Layout({children}) {
  const docs = getAllJSDocs();
  return <DocsLayoutClient docs={docs}>{children}</DocsLayoutClient>;
}
