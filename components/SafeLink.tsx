"use client";

import {useRouter} from "next/navigation";
import Link, {type LinkProps} from "next/link";
import { useIsDirty } from "@/lib/notebooks/storage.ts";

export type SafeLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
} & LinkProps;

export function SafeLink({href, children, className, onClick = () => {}, ...props}: SafeLinkProps) {
  const router = useRouter();
  const [isDirty, setIsDirty] = useIsDirty();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isDirty && !window.confirm("Your changes will be lost.")) return;
    setIsDirty(false);
    // If the link is to the new notebook page, we need to renew the notebook.
    if (href === "/") window.dispatchEvent(new Event("renew-notebook"));
    router.push(href);
    onClick?.();
  };

  return (
    <Link href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </Link>
  );
}
