import Link from "next/link";
import {cn} from "./cn.js";

export function Meta({example}) {
  return (
    <div className={cn("flex items-center gap-2 mb-3")}>
      <img
        src={`https://github.com/${example.github}.png`}
        alt={example.author}
        className={cn("w-8 h-8 rounded-full")}
      />
      <div>
        <div className={cn("flex items-center gap-2")}>
          <span>{example.author}</span>
          <span>/</span>
          <Link href={`/examples/${example.slug}`} className={cn("text-blue-500 hover:underline font-semibold")}>
            <span>{example.title}</span>
          </Link>
        </div>
        <div className={cn("text-sm text-gray-500")}>Created {example.created}</div>
      </div>
    </div>
  );
}
