import {it, expect, describe, afterEach} from "vitest";
import {createRuntime} from "../runtime/index.js";

const wait = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

describe("echo.dispose on invalidation", () => {
  let runtime;

  afterEach(async () => {
    runtime?.destroy();
    runtime = null;
    await wait(0);
    delete globalThis.__rechoEchoDispose;
    delete globalThis.__rechoUnrelated;
  });

  it("runs echo.dispose when a caller that never mentions echo is invalidated", async () => {
    globalThis.__rechoEchoDispose = {starts: 0, disposes: 0};
    runtime = createRuntime(`const [n, setN] = recho.state(0);
recho.button("Go", () => setN(n + 1));
go(n);
function go(n) {
  globalThis.__rechoEchoDispose.starts++;
  echo.dispose(() => {
    globalThis.__rechoEchoDispose.disposes++;
  });
}
`);
    runtime.onChanges(() => {});
    runtime.run();
    await wait();
    expect(globalThis.__rechoEchoDispose.starts).toBe(1);
    expect(globalThis.__rechoEchoDispose.disposes).toBe(0);

    runtime.buttonRegistry.executeCallback("Go");
    await wait();
    expect(globalThis.__rechoEchoDispose.disposes).toBe(1);
    expect(globalThis.__rechoEchoDispose.starts).toBe(2);
  });

  it("does not dispose unrelated cells when a button updates state", async () => {
    globalThis.__rechoUnrelated = {disposes: 0};
    runtime = createRuntime(`const [n, setN] = recho.state(0);
recho.button("Go", () => setN(n + 1));
echo(n);
{
  echo.dispose(() => {
    globalThis.__rechoUnrelated.disposes++;
  });
}
`);
    runtime.onChanges(() => {});
    runtime.run();
    await wait();

    runtime.buttonRegistry.executeCallback("Go");
    await wait();
    expect(globalThis.__rechoUnrelated.disposes).toBe(0);
  });
});
