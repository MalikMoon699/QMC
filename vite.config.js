import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true, 
    minify: "esbuild",
    target: ["es2020", "edge88", "firefox78", "chrome87", "safari14"],
    optimizeDeps: {
      include: ["@emotion/react", "@emotion/styled", "@mui/styled-engine"], 
    },
  },
});
