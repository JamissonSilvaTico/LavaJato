import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Explicitly set the root to the current directory, where index.html is located.
  // This can resolve pathing issues in some CI/CD environments like Render.
  root: process.cwd(),
});
