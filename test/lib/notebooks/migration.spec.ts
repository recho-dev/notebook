import {loadNotebooksFromStorage} from "../../../lib/notebooks/storage.ts";
import {RECHO_FILES_KEY} from "../../../lib/notebooks/utils.ts";
import {describe, it, expect} from "vitest";

describe("loadNotebooksFromStorage", () => {
  it("should be able to load old data from localStorage", () => {
    localStorage.setItem(RECHO_FILES_KEY, JSON.stringify(sampleData));

    const notebooks = loadNotebooksFromStorage();

    expect(notebooks).toHaveLength(sampleData.length);

    for (let i = 0, n = sampleData.length; i < n; i++) {
      const actual = notebooks[i];
      const expected = sampleData[i];
      expect(actual.id).toBe(expected.id);
      expect(actual.title).toBe(expected.title);
      expect(actual.created).toBe(expected.created);
      expect(actual.updated).toBe(expected.updated);
      expect(actual.autoRun).toBe(expected.autoRun);
      expect(actual.runtime).toBe(expected.runtime);
      expect(actual.snapshots).toHaveLength(1);
      expect(actual.snapshots[0].content).toBe(expected.content);
    }
  });
});

const sampleData = [
  {
    id: "5PW6twZuTgkWzMCY6q3Vmv",
    title: "w-a.js",
    created: "2025-12-20T13:45:25.050Z",
    updated: "2026-01-07T06:20:43.023Z",
    content: "const PLACEHOLDER = 42;",
    autoRun: true,
    runtime: "javascript@0.1.0",
  },
  {
    id: "dszL4HiSgYtWsEAccQfnhb",
    title: "v-s.js",
    created: "2025-12-22T12:31:02.947Z",
    updated: "2026-01-07T06:20:40.647Z",
    content: "const PLACEHOLDER = 42;",
    autoRun: true,
    runtime: "javascript@0.1.0",
  },
  {
    id: "bKjmrjw11aSPLAzZiYDHy4",
    title: "r-h.js",
    created: "2026-01-07T04:09:17.400Z",
    updated: "2026-01-07T06:20:35.027Z",
    content: "const PLACEHOLDER = 42;",
    autoRun: true,
    runtime: "javascript@0.1.0",
  },
  {
    id: "sYJTPySp4MZiKatDErSHMb",
    title: "s-n.js",
    created: "2025-12-20T17:24:43.604Z",
    updated: "2026-01-07T06:20:27.557Z",
    content: "const PLACEHOLDER = 42;",
    autoRun: true,
    runtime: "javascript@0.1.0",
  },
  {
    id: "vi5Ag14X3BH4d92EBiJJL7",
    title: "e-a.js",
    created: "2025-12-20T18:26:39.993Z",
    updated: "2026-01-07T06:20:23.621Z",
    content: "const PLACEHOLDER = 42;",
    autoRun: true,
    runtime: "javascript@0.1.0",
  },
  {
    id: "pcqVuHbiLtx14W8eQoSV24",
    title: "f-p.js",
    created: "2026-01-06T09:31:32.977Z",
    updated: "2026-01-06T09:31:32.977Z",
    content: "const PLACEHOLDER = 42;",
    autoRun: true,
    runtime: "javascript@0.1.0",
  },
  {
    id: "hCWCRqo1XVGYLth4Gsxavk",
    title: "e-v.js",
    created: "2025-12-20T13:44:23.250Z",
    updated: "2025-12-20T13:44:37.239Z",
    content: "const PLACEHOLDER = 42;",
    autoRun: true,
    runtime: "javascript@0.1.0",
  },
  {
    id: "d4Wjrx8d53nVoio4YnKHWw",
    title: "p-s.js",
    created: "2025-12-20T13:36:21.175Z",
    updated: "2025-12-20T13:43:19.175Z",
    content: "const PLACEHOLDER = 42;",
    autoRun: true,
    runtime: "javascript@0.1.0",
  },
  {
    id: "pgkVDcraor1D33bsZbfdwN",
    title: "c-s.js",
    created: "2025-12-05T14:36:03.366Z",
    updated: "2025-12-05T17:07:32.715Z",
    content: "const PLACEHOLDER = 42;",
    autoRun: true,
    runtime: "javascript@0.1.0",
  },
  {
    id: "9o9u6EUQcv3zmSvqhVm6RT",
    title: "s-k.js",
    created: "2025-12-05T08:14:26.335Z",
    updated: "2025-12-05T08:14:26.335Z",
    content: "const PLACEHOLDER = 42;",
    autoRun: true,
    runtime: "javascript@0.1.0",
  },
];
