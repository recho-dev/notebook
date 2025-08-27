import {SafeLink} from "./SafeLink.jsx";

export function Nav() {
  return (
    <header style={{display: "flex", gap: "10px", alignItems: "center"}}>
      <SafeLink href="/">
        <h1>Recho</h1>
      </SafeLink>
      <SafeLink href="/sketches">Sketches</SafeLink>
      <SafeLink href="/docs">Learn</SafeLink>
      <SafeLink href="/examples">Discover</SafeLink>
      <SafeLink href="/">New</SafeLink>
    </header>
  );
}
