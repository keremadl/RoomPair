#!/usr/bin/env node
/**
 * Builds the RoomPair lab: one self-contained HTML page (an artifact) with
 * the app inside an iPhone 16 Pro frame and the design-system library.
 * Everything is inlined (JS, CSS, images, fonts) because the artifact host
 * blocks other files.
 *
 *   node lab/build.mjs [out.html]
 */
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join, extname } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const out = process.argv[2] ?? join(root, ".lab/RoomPair-Lab.html");
const mime = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
};
const dataUri = (file) =>
  `data:${mime[extname(file)]};base64,${readFileSync(file).toString("base64")}`;

const result = await build({
  entryPoints: [join(root, "lab/entry.tsx")],
  bundle: true,
  minify: true,
  write: false,
  outdir: "lab-out",
  format: "iife",
  jsx: "automatic",
  target: "es2020",
  tsconfig: join(root, "tsconfig.json"),
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "warning",
  plugins: [
    {
      name: "lab",
      setup(b) {
        b.onResolve({ filter: /^next\/font\/google$/ }, () => ({
          path: join(root, "lab/next-font-shim.ts"),
        }));
        // url("/fonts/..") and url("/images/..") in CSS: inline them.
        b.onResolve({ filter: /^\/(fonts|images)\// }, (a) => ({
          path: join(root, "public", a.path),
          namespace: "public-file",
        }));
        b.onLoad({ filter: /.*/, namespace: "public-file" }, (a) => ({
          contents: readFileSync(a.path),
          loader: "dataurl",
        }));
      },
    },
  ],
  loader: { ".ttf": "dataurl", ".jpg": "dataurl" },
});

let js = "",
  css = "";
for (const f of result.outputFiles)
  if (f.path.endsWith(".js")) js = f.text;
  else if (f.path.endsWith(".css")) css = f.text;

// Image paths written as strings in data and components ("/images/x.jpg").
const images = readdirSync(join(root, "public/images"));
for (const name of images)
  js = js
    .split(`/images/${name}`)
    .join(dataUri(join(root, "public/images", name)));
const app = { js, css };

const shell = readFileSync(join(root, "lab/shell.html"), "utf8");
const html = shell
  .replace("/*__APP_CSS__*/", () => JSON.stringify(app.css))
  .replace("/*__APP_JS__*/", () =>
    JSON.stringify(app.js.replace(/<\/script/gi, "<\\/script")),
  );
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html);
console.log(`lab: ${out} (${(html.length / 1e6).toFixed(2)} MB)`);
