import {defineConfig} from "vite";

export default defineConfig({
  root: "test",
  test: {
    environment: "jsdom",
  },
});
