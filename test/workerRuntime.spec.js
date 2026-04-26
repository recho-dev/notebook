import {describe, expect, it} from "vitest";
import {OUTPUT_PREFIX} from "../runtime/output.js";
import {createWorkerRuntime} from "../terminal/workerRuntime.ts";

function waitForChanges(runtime, predicate = () => true) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      runtime.onChanges(null);
      reject(new Error("timed out waiting for worker runtime changes"));
    }, 5000);

    runtime.onChanges((event) => {
      if (!predicate(event)) return;
      clearTimeout(timer);
      runtime.onChanges(null);
      resolve(event);
    });
  });
}

function hasOutput(event, value) {
  return event.changes?.some((change) => change.insert?.includes(`${OUTPUT_PREFIX} ${value}`));
}

describe("worker runtime", () => {
  it("emits inline output changes from a worker thread", async () => {
    const runtime = createWorkerRuntime("echo(1);", {cellTimeoutMs: 500, heartbeatGraceMs: 1000});
    try {
      const changes = waitForChanges(runtime, (event) => hasOutput(event, 1));
      runtime.run();
      expect(hasOutput(await changes, 1)).toBe(true);
    } finally {
      runtime.destroy();
    }
  });

  it("respawns on run after being terminated", async () => {
    const runtime = createWorkerRuntime("echo(1);", {cellTimeoutMs: 500, heartbeatGraceMs: 1000});
    try {
      const initialChanges = waitForChanges(runtime, (event) => hasOutput(event, 1));
      runtime.run();
      await initialChanges;

      runtime.terminate();
      expect(runtime.isAlive()).toBe(false);
      expect(runtime.isRunning()).toBe(false);

      runtime.setCode("echo(2);");
      const restartedChanges = waitForChanges(runtime, (event) => hasOutput(event, 2));
      runtime.run();

      expect(runtime.isAlive()).toBe(true);
      expect(hasOutput(await restartedChanges, 2)).toBe(true);
    } finally {
      runtime.destroy();
    }
  });
});
