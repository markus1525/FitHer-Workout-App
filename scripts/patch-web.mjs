/**
 * patch-web.mjs
 * Run after `expo export --platform web` to inject PWA manifest link
 * and fix iOS/Android standalone meta tags into every generated HTML file.
 */

import { readFileSync, writeFileSync, readdirSync, statSync, copyFileSync, existsSync } from "fs";
import { join, extname } from "path";

const DIST = "./dist";
const BASE = "/FitHer-Workout-App";

// Inject into <head> right before the first <meta charSet>
const INJECT = [
  `<link rel="manifest" href="${BASE}/manifest.json"/>`,
  `<meta name="mobile-web-app-capable" content="yes"/>`,
].join("");

function patchHtml(html) {
  // 1. Inject manifest link + Android capable tag
  if (!html.includes('rel="manifest"')) {
    html = html.replace('<meta charSet="utf-8"', `${INJECT}<meta charSet="utf-8"`);
  }

  // 2. iOS status bar: change "default" → "black-translucent" (content goes edge-to-edge)
  html = html.replace(
    /apple-mobile-web-app-status-bar-style" content="default"/g,
    'apple-mobile-web-app-status-bar-style" content="black-translucent"'
  );

  // 3. Viewport: add viewport-fit=cover so content fills the full screen (notch safe)
  html = html.replace(
    "width=device-width, initial-scale=1, shrink-to-fit=no",
    "width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
  );

  return html;
}

function walkDir(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      walkDir(full);
    } else if (extname(name) === ".html") {
      const original = readFileSync(full, "utf8");
      const patched = patchHtml(original);
      if (patched !== original) {
        writeFileSync(full, patched, "utf8");
        console.log("patched:", full.replace(DIST + "/", ""));
      }
    }
  }
}

// Copy static public/ files → dist/
const PUBLIC_COPY = ["manifest.json", "sw.js", "offline.html"];
for (const file of PUBLIC_COPY) {
  const src = `./public/${file}`;
  const dst = join(DIST, file);
  if (existsSync(src)) {
    copyFileSync(src, dst);
    console.log("copied:", file);
  }
}

walkDir(DIST);
console.log("patch-web done.");
