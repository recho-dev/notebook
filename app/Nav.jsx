"use client";
import {SafeLink} from "./SafeLink.jsx";

export function Nav() {
  function handleUpload(e) {
    e.preventDefault();
    const confirm = window.confirm(
      `Make a Pull Request to upload your sketch!\n- Input the filename\n- Copy the code\n- Click the "Commit changes" button`,
    );
    if (confirm) {
      window.open("https://github.com/recho-dev/recho/new/main/app/examples", "_blank");
    }
  }
  return (
    <header style={{display: "flex", gap: "10px", alignItems: "center"}}>
      <SafeLink href="/">
        <h1>Recho</h1>
      </SafeLink>
      <SafeLink href="/sketches">Sketches</SafeLink>
      <SafeLink href="/docs">Docs</SafeLink>
      <SafeLink href="/examples">Examples</SafeLink>
      <a href="https://github.com/recho-dev/recho" target="_blank">
        GitHub
      </a>
      <a href="https://github.com/recho-dev/recho/new/main/app/examples" onClick={handleUpload} target="_blank">
        Share
      </a>
      <SafeLink href="/">New</SafeLink>
    </header>
  );
}
