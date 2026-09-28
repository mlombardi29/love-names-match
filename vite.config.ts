import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

const THEME_COLOR = "#e8304f";
const BACKGROUND_COLOR = "#ffffff";

const manifest = {
  id: "/",
  name: "Baby Tinder",
  short_name: "Baby Tinder",
  description:
    "Baby Tinder is a beautiful app for couples to discover and choose baby names together.",
  start_url: "/",
  scope: "/",
  display: "standalone" as const,
  background_color: BACKGROUND_COLOR,
  theme_color: THEME_COLOR,
  lang: "en",
  icons: [
    {
      src: "/pwa-192x192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/pwa-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/pwa-maskable-192x192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "maskable",
    },
    {
      src: "/pwa-maskable-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
};

/** Serve the manifest in dev without registering a service worker. */
function devManifestPlugin(): Plugin {
  return {
    name: "baby-tinder-dev-manifest",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0];
        if (url !== "/manifest.webmanifest") {
          next();
          return;
        }
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/manifest+json");
        res.setHeader("Cache-Control", "no-cache");
        res.end(JSON.stringify(manifest));
      });
    },
  };
}

/**
 * vite-plugin-pwa injects its own manifest link. index.html already has one,
 * so drop the duplicate after the plugin runs.
 */
function dedupeManifestLink(): Plugin {
  const pattern = /<link rel="manifest" href="\/manifest\.webmanifest"\s*\/?>/g;
  return {
    name: "dedupe-manifest-link",
    enforce: "post",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html) {
        let seen = false;
        return html.replace(pattern, (match) => {
          if (seen) return "";
          seen = true;
          return match;
        });
      },
    },
  };
}

function babyTinderPwa(): Plugin[] {
  return [
    ...VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "favicon-32x32.png",
        "apple-touch-icon.png",
        "pwa-192x192.png",
        "pwa-512x512.png",
        "pwa-maskable-192x192.png",
        "pwa-maskable-512x512.png",
      ],
      manifest,
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,woff2}"],
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/api\//],
        // Precache the app shell only. Cross-origin Supabase auth and data
        // requests are not listed here, so they stay network-only.
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: false,
      },
    }),
    dedupeManifestLink(),
  ];
}

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    devManifestPlugin(),
    ...(command === "build" ? babyTinderPwa() : []),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
