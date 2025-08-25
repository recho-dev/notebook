import {Editor} from "./Editor.jsx";

export default function Page() {
  const code = `doc("Hello, world!")`;
  return (
    <div>
      <Editor code={code} />
    </div>
  );
}
