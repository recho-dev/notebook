import {getAllJSDocs} from "../utils.js";
import {DocsLayoutClient} from "./DocsLayoutClient.jsx";
import {docsNavConfig} from "./nav.config.js";

export const metadata = {
  title: "Docs | Recho Notebook",
  description: "Docs | Recho Notebook",
};

export default function Layout({children}) {
  const docs = getAllJSDocs();

  // Create a map of slug -> doc for easy lookup
  const docsMap = docs.reduce((acc, doc) => {
    acc[doc.slug] = doc;
    return acc;
  }, {});

  return (
    <DocsLayoutClient navStructure={docsNavConfig} docsMap={docsMap}>
      {children}
    </DocsLayoutClient>
  );
}
