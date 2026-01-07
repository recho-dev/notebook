import {defineConfig} from "vite";
import {fileURLToPath} from "url";
import {dirname} from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
  },
  resolve: {
    alias: {
      "@": dirname(fileURLToPath(import.meta.url)),
    },
  },
});
