import { cpSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

/** Static export for GitHub Pages. Does not touch the live-preview Vite config. */
function pagesFallback(): Plugin {
  return {
    name: "valence-pages-fallback",
    apply: "build",
    closeBundle() {
      const index = fileURLToPath(new URL("./dist-pages/index.html", import.meta.url));
      const missing = fileURLToPath(new URL("./dist-pages/404.html", import.meta.url));
      cpSync(index, missing);
      writeFileSync(fileURLToPath(new URL("./dist-pages/.nojekyll", import.meta.url)), "");
    },
  };
}

export default defineConfig({
  root: fileURLToPath(new URL("./pages", import.meta.url)),
  base: "/valence-shells/",
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  plugins: [tailwindcss(), react(), pagesFallback()],
  resolve: {
    tsconfigPaths: true,
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: fileURLToPath(new URL("./dist-pages", import.meta.url)),
    emptyOutDir: true,
  },
});
