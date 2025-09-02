import Link from "next/link";
import {cn} from "./cn.js";

export default function NotFound() {
  return (
    <div className={cn("text-center mt-20")}>
      <h1 className={cn("text-4xl font-bold")}>404</h1>
      <p className={cn("mt-4")}>This page could not be found.</p>
      <Link
        href="/"
        className={cn("mt-4", "inline-block bg-black text-white rounded-md px-3 py-1 text-sm hover:bg-gray-800")}
      >
        Go to home
      </Link>
    </div>
  );
}
