import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import {fileURLToPath} from "url";

export default defineConfig({
  root: "./test/playground",
  plugins: [react()],
  define: {
    "process.env.NODE_ENV": JSON.stringify("test"),
  },
  test: {
    environment: "jsdom",
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("../../", import.meta.url)),
    },
  },
});
