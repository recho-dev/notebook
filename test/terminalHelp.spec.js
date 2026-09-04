import path from "node:path";
import {describe, expect, it} from "vitest";
import {App} from "../terminal/app.ts";

const docsDir = path.join(process.cwd(), "app", "docs");

describe("terminal help", () => {
  it("opens tutorials from the docs outline", () => {
    const app = new App({initialPath: null, initialCode: "", examplesDir: null, docsDir});

    app.openHelp();

    expect(app.activeModal.type).toBe("help");
    expect(app.activeModal.helpSlug).toBe("introduction");
    expect(app.activeModal.help.entries.some((entry) => entry.title === "Features")).toBe(true);
    expect(app.activeModal.help.docsBySlug.get("getting-started")?.title).toBe("Getting Started");
  });

  it("selects another tutorial from the outline", () => {
    const app = new App({initialPath: null, initialCode: "", examplesDir: null, docsDir});
    app.openHelp();

    app.moveHelpSelection(1);

    expect(app.activeModal.helpSlug).toBe("getting-started");
    expect(app.activeModal.helpScroll).toBe(0);
  });
});
