import Link from "next/link";
import {getAllJSExamples} from "../utils.js";

export default function Page() {
  const examples = getAllJSExamples();
  return (
    <ul>
      {examples.map((example) => (
        <Link href={`/examples/${example.slug}`} key={example.slug}>
          <li>{example.title}</li>
        </Link>
      ))}
    </ul>
  );
}
