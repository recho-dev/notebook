"use client";
import {useRouter} from "next/navigation";
import {Editor} from "../Editor.jsx";
import {cn} from "../cn.js";
import {duplicateNotebook, addNotebook} from "../api.js";

export function ExampleEditor({example, initialCode}) {
  const router = useRouter();

  function onDuplicate() {
    const sourceNotebook = {
      title: example.title,
      content: initialCode,
      autoRun: true,
    };
    const duplicated = duplicateNotebook(sourceNotebook);
    addNotebook(duplicated);
    router.push(`/notebooks/${duplicated.id}`);
  }

  return (
    <Editor
      initialCode={initialCode}
      key={example.title}
      onDuplicate={onDuplicate}
      toolBarStart={
        <div className={cn("flex items-center")} key={example.slug}>
          <a
            href={`https://github.com/recho-dev/recho/pull/${example.pull_request}`}
            target="_blank"
            rel="noreferrer"
            className={cn("bg-green-700 text-white rounded-md px-3 py-1 text-sm hover:bg-green-800")}
          >
            Comment
          </a>
        </div>
      }
    />
  );
}

