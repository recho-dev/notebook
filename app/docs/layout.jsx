import Link from "next/link";
import {getAllJSDocs} from "../utils.js";

export default function Layout({children}) {
  const docs = getAllJSDocs();
  return (
    <div style={{display: "flex"}}>
      <ul style={{width: "200px", margin: 0, height: "calc(100vh - 85px)", overflow: "auto"}}>
        {docs
          .sort((a, b) => a.order - b.order)
          .map((doc) => (
            <Link href={`/docs/${doc.slug}`} key={doc.title}>
              <li>{doc.title}</li>
            </Link>
          ))}
      </ul>
      <div style={{width: "calc(100% - 200px)"}}>{children}</div>
    </div>
  );
}
