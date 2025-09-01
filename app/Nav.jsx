"use client";

import {usePathname} from "next/navigation";
import {SafeLink} from "./SafeLink.jsx";
import {cn} from "./cn.js";
import {Plus, Share, Github} from "lucide-react";
import {Tooltip} from "react-tooltip";

const styles = {
  linkIcon: "w-5 h-5",
  link: "hover:bg-gray-100 px-3 rounded-md text-sm h-8 font-medium inline-flex items-center",
  selectedLink: "bg-gray-100",
  tooltip: "text-sm z-999",
};

export function Nav() {
  const pathname = usePathname();

  function handleUpload(e) {
    e.preventDefault();
    const confirm = window.confirm(
      `Make a Pull Request to share your sketch to Examples!\n- Input the filename\n- Copy the code\n- Click the "Commit changes" button`,
    );
    if (confirm) window.open("https://github.com/recho-dev/recho/new/main/app/examples", "_blank");
  }

  function isSelected(path) {
    return pathname.startsWith(path);
  }

  return (
    <header className={cn("flex justify-between items-center p-4 border-b border-gray-200")}>
      <div className={cn("flex gap-2 items-center")}>
        <SafeLink href="/">
          <h1 className={cn("text-2xl font-bold")}>Recho</h1>
        </SafeLink>
        <SafeLink href="/docs" className={cn(styles.link, isSelected("/docs") && styles.selectedLink, "ml-3")}>
          Docs
        </SafeLink>
        <SafeLink href="/examples" className={cn(styles.link, isSelected("/examples") && styles.selectedLink)}>
          Examples
        </SafeLink>
        <SafeLink href="/sketches" className={cn(styles.link, isSelected("/sketches") && styles.selectedLink)}>
          Sketches
        </SafeLink>
      </div>
      <div className={cn("flex gap-2 items-center")}>
        <SafeLink
          href="/"
          className={cn(styles.link, pathname === "/" && styles.selectedLink)}
          data-tooltip-id="nav-tooltip"
          data-tooltip-content="Create new sketch"
        >
          <Plus className={cn(styles.linkIcon)} />
        </SafeLink>
        <a
          href="https://github.com/recho-dev/recho/new/main/app/examples"
          onClick={handleUpload}
          target="_blank"
          rel="noreferrer"
          className={cn(styles.link)}
          data-tooltip-id="nav-tooltip"
          data-tooltip-content="Share to Examples"
        >
          <Share className={cn(styles.linkIcon)} />
        </a>
        <a
          href="https://github.com/recho-dev/recho"
          target="_blank"
          rel="noreferrer"
          className={cn(styles.link)}
          data-tooltip-id="nav-tooltip"
          data-tooltip-content="Contribute to Recho"
          data-tooltip-place="bottom-end"
        >
          <Github className={cn(styles.linkIcon)} />
        </a>
      </div>
      <Tooltip id="nav-tooltip" className={cn(styles.tooltip)} />
    </header>
  );
}
