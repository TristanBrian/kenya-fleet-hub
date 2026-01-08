import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // Backwards-compatible support for older env var name used in some deployments.
  const anonKey =
    env.VITE_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    "";

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: [
        // Override the generated client import to avoid blank-screens when only
        // VITE_SUPABASE_PUBLISHABLE_KEY is available.
        {
          find: /^@\/integrations\/supabase\/client$/,
          replacement: path.resolve(
            __dirname,
            "./src/integrations/supabase/client-compat.ts"
          ),
        },
        {
          find: "@",
          replacement: path.resolve(__dirname, "./src"),
        },
      ],
    },
    define: {
      // Ensure any direct reads still work in environments that only provide
      // VITE_SUPABASE_PUBLISHABLE_KEY.
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(anonKey),
    },
  };
});
