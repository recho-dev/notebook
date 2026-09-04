import {it, expect, describe, afterEach} from "vitest";
import {createRuntime} from "../runtime/index.js";

describe("echo.dispose on invalidation", () => {
  afterEach(() => {
    delete globalThis.__rechoEchoDispose;
    delete globalThis.__rechoUnrelated;
  });

  it("runs echo.dispose when a caller that never mentions echo is invalidated", async () => {
    globalThis.__rechoEchoDispose = {starts: 0, disposes: 0};
    const runtime = createRuntime(`const [n, setN] = recho.state(0);
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
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(globalThis.__rechoEchoDispose.starts).toBe(1);
    expect(globalThis.__rechoEchoDispose.disposes).toBe(0);

    runtime.buttonRegistry.executeCallback("Go");
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(globalThis.__rechoEchoDispose.disposes).toBe(1);
    expect(globalThis.__rechoEchoDispose.starts).toBe(2);

    runtime.destroy();
  });

  it("does not dispose unrelated cells when a button updates state", async () => {
    globalThis.__rechoUnrelated = {disposes: 0};
    const runtime = createRuntime(`const [n, setN] = recho.state(0);
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
    await new Promise((resolve) => setTimeout(resolve, 150));

    runtime.buttonRegistry.executeCallback("Go");
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(globalThis.__rechoUnrelated.disposes).toBe(0);

    runtime.destroy();
  });
});
