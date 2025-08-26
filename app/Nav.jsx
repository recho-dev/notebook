import Link from "next/link";

export function Nav() {
  return (
    <header style={{display: "flex", gap: "10px", alignItems: "center"}}>
      <h1>Recho</h1>
      <Link href="/">Editor</Link>
      <Link href="/docs">Docs</Link>
      <Link href="/examples">Examples</Link>
    </header>
  );
}
