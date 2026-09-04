// Headless TUI performance test. Boots the real App with the real worker
// runtime, loads an animated example, lets it run, and measures the whole
// change→render pipeline: worker change throughput, render cadence and
// cost, and bytes written to the terminal. Fails (exit 1) if the animation
// stalls, drops below the example's tick rate, or renders get expensive.
//
//   pnpm perf                 # matrix-rain, 5 seconds
//   pnpm perf donut 10        # another example / longer run
//
// Not part of `pnpm test` — timings are load-dependent and would flake in
// CI; run it manually when touching the render loop or the worker pipeline.
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import {fileURLToPath} from "node:url";
import {App} from "../../terminal/app.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const exampleName = process.argv[2] || "matrix-rain";
const seconds = Number(process.argv[3]) || 5;
const examplesDir = path.resolve(__dirname, "..", "..", "app", "examples");
const examplePath = path.join(examplesDir, `${exampleName}.recho.js`);
const code = fs.readFileSync(examplePath, "utf8");

// A fixed headless viewport, sized like a real terminal.
process.stdout.columns = 120;
process.stdout.rows = 40;

const app = new App({initialPath: examplePath, initialCode: code, examplesDir, docsDir: null});

// -- Instrumentation ---------------------------------------------------------

// Swallow terminal escape output, but keep counting it: bytes written per
// second is renderDiff's efficiency (a full repaint would be ~cols*rows).
const realWrite = process.stdout.write.bind(process.stdout);
let bytesWritten = 0;
process.stdout.write = (chunk) => {
  bytesWritten += typeof chunk === "string" ? chunk.length : chunk.byteLength;
  return true;
};
const restoreStdout = () => {
  process.stdout.write = realWrite;
};

let renderCount = 0;
let renderMsTotal = 0;
let renderMsMax = 0;
const origRender = app.render.bind(app);
app.render = () => {
  const t0 = performance.now();
  origRender();
  const dt = performance.now() - t0;
  renderCount++;
  renderMsTotal += dt;
  if (dt > renderMsMax) renderMsMax = dt;
};

// Count worker change batches by wrapping the buffer they're applied to.
let changeCount = 0;
const origApply = app.buffer.applyChanges.bind(app.buffer);
app.buffer.applyChanges = (changes) => {
  changeCount++;
  return origApply(changes);
};

// -- Run ---------------------------------------------------------------------

app.initRuntime();
app.loop();
app.runNow();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Let the worker boot and the notebook settle before sampling.
await sleep(2000);

const samples = [];
const snapshots = [];
for (let s = 0; s < seconds; s++) {
  const c0 = changeCount;
  const r0 = renderCount;
  const b0 = bytesWritten;
  const m0 = renderMsTotal;
  await sleep(1000);
  samples.push({
    changes: changeCount - c0,
    renders: renderCount - r0,
    kib: (bytesWritten - b0) / 1024,
    avgMs: renderCount - r0 > 0 ? (renderMsTotal - m0) / (renderCount - r0) : 0,
  });
  snapshots.push(app.buffer.text);
}

if (app.tickTimer) clearTimeout(app.tickTimer);
app.runtime?.destroy?.();
restoreStdout();

// -- Report ------------------------------------------------------------------

console.log(
  `example: ${exampleName} · ${seconds}s sampled after 2s warmup · ${process.stdout.columns}x${process.stdout.rows}`,
);
console.log("sec  changes/s  renders/s  avg render  KiB/s");
samples.forEach((s, i) => {
  console.log(
    String(i + 1).padStart(3) +
      String(s.changes).padStart(10) +
      String(s.renders).padStart(11) +
      (s.avgMs.toFixed(2) + "ms").padStart(11) +
      s.kib.toFixed(1).padStart(8),
  );
});
const total = samples.reduce((a, s) => ({changes: a.changes + s.changes, renders: a.renders + s.renders}), {
  changes: 0,
  renders: 0,
});
const avgChanges = total.changes / seconds;
const avgRenders = total.renders / seconds;
const avgRenderMs = renderCount > 0 ? renderMsTotal / renderCount : 0;
console.log(
  `avg: ${avgChanges.toFixed(1)} changes/s · ${avgRenders.toFixed(1)} renders/s · ` +
    `render ${avgRenderMs.toFixed(2)}ms avg / ${renderMsMax.toFixed(2)}ms max`,
);

const errors = app.console.filter((m) => m.level === "error");
if (errors.length) {
  console.log(`console errors (${errors.length}):`);
  for (const e of errors.slice(0, 5)) console.log("  " + e.text.split("\n")[0]);
}

// -- Sanity gates (generous — this guards against regressions in kind, not
// against machine-load noise) ------------------------------------------------

const failures = [];
// The animation must actually move: consecutive snapshots should differ.
const moving = snapshots.slice(1).filter((text, i) => text !== snapshots[i]).length;
if (moving < Math.max(1, snapshots.length - 2))
  failures.push(`animation barely moving (${moving}/${snapshots.length - 1} intervals changed)`);
// matrix-rain ticks at 15fps; anything animated should stream several changes/s.
if (avgChanges < 5) failures.push(`change stream too slow: ${avgChanges.toFixed(1)}/s`);
// Adaptive loop should render at least at the change cadence (it may render
// more due to the spinner, or slightly fewer if bursts coalesce in a tick).
if (avgRenders < avgChanges * 0.75)
  failures.push(`renders lag changes: ${avgRenders.toFixed(1)}/s vs ${avgChanges.toFixed(1)}/s`);
if (avgRenderMs > 5) failures.push(`render too slow: ${avgRenderMs.toFixed(2)}ms avg`);
if (errors.length) failures.push(`${errors.length} console errors during run`);

if (failures.length) {
  console.log("FAIL:\n  " + failures.join("\n  "));
  process.exit(1);
}
console.log("PASS");
process.exit(0);
