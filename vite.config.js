import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "test",
  plugins: [react()],
  test: {
    environment: "jsdom",
  },
});
