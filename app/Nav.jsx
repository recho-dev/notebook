import Link from "next/link";

export function Nav() {
  return (
    <header style={{display: "flex", gap: "10px", alignItems: "center"}}>
      <Link href="/">
        <h1>Recho</h1>
      </Link>
      <Link href="/sketches">Sketches</Link>
      <Link href="/docs">Learn</Link>
      <Link href="/examples">Discover</Link>
      <Link href="/">New</Link>
    </header>
  );
}
