import path from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "lib/main.ts"),
      name: "StateManager",
      fileName: (format) => `state-manager.${format}.js`
    }
  },
  plugins: [
    dts({
      insertTypesEntry: true
    })
  ]
});
