import {useLatestNotebooks} from "@/lib/notebooks/hooks.ts";
import {SafeLink} from "../SafeLink.tsx";
import {cn} from "../../app/cn.js";

export type EditorPageHeroProps = {
  show: boolean;
};

export function EditorPageHero({show}: EditorPageHeroProps) {
  const latestNotebooks = useLatestNotebooks(4);
  if (!show) return null;
  if (latestNotebooks.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-[72px] mt-6 mb-10 lg:mb-0")}>
        <p className={cn("text-3xl text-gray-800 font-light text-center mx-10")}>
          Explore code and art with instant feedback.
        </p>
      </div>
    );
  }
  return (
    <div className={cn("flex h-[72px] bg-gray-100 p-2 w-full border-b border-gray-200")}>
      <div
        className={cn(
          "items-center justify-between gap-2 h-full max-w-screen-lg lg:mx-auto mx-4 w-full hidden md:flex",
        )}
      >
        {latestNotebooks.map((notebook) => (
          <div key={notebook.id} className={cn("flex items-start flex-col gap-1")}>
            <SafeLink
              href={`/works/${notebook.id}`}
              className={cn(
                "font-semibold hover:underline text-blue-500 whitespace-nowrap line-clamp-1 max-w-[150px] text-ellipsis",
              )}
            >
              {notebook.title}
            </SafeLink>
            <span className={cn("text-xs text-gray-500 line-clamp-1 whitespace-nowrap max-w-[150px] text-ellipsis")}>
              Created {new Date(notebook.created).toLocaleDateString()}
            </span>
          </div>
        ))}
        <SafeLink href="/works" className={cn("font-semibold text-blue-500 hover:underline")}>
          View your notebooks
        </SafeLink>
      </div>
      <div
        className={cn(
          "flex items-center justify-between gap-2 h-full max-w-screen-lg lg:mx-auto mx-4 w-full md:hidden",
        )}
      >
        <SafeLink
          href="/works"
          className={cn(
            "font-medium w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-center hover:bg-gray-200",
          )}
        >
          View your notebooks
        </SafeLink>
      </div>
    </div>
  );
}
