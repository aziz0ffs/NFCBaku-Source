import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  base: "/themes/identity/build/",
  build: { outDir: "../../themes/identity/build", emptyOutDir: true, manifest: true },
});
