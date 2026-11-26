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
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  realpathSync,
} from "node:fs";
import { dirname, join, extname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const publicRoot = realpathSync(join(root, "public"));
const out = process.argv[2] ?? join(root, ".lab/RoomPair-Lab.html");
const mime = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
};
const ALLOWED_PUBLIC_EXT = new Set(Object.keys(mime));
const dataUri = (file) =>
  `data:${mime[extname(file).toLowerCase()]};base64,${readFileSync(file).toString("base64")}`;

function resolvePublicAsset(urlPath) {
  const candidate = realpathSync(join(publicRoot, urlPath));
  const rel = relative(publicRoot, candidate);
  if (
    rel.startsWith("..") ||
    rel.includes(`..${sep}`) ||
    !ALLOWED_PUBLIC_EXT.has(extname(candidate).toLowerCase())
  ) {
    throw new Error(`Refusing asset outside public/: ${urlPath}`);
  }
  return candidate;
}

function walkImages(dir, prefix = "/images") {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    const webPath = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) return walkImages(full, webPath);
    if (
      entry.isFile() &&
      ALLOWED_PUBLIC_EXT.has(extname(entry.name).toLowerCase())
    ) {
      return [{ webPath, full }];
    }
    return [];
  });
}

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
  define: {
    "process.env.NODE_ENV": '"production"',
    "process.env.NEXT_PUBLIC_SUPABASE_URL": '""',
    "process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY": '""',
  },
  logLevel: "warning",
  plugins: [
    {
      name: "lab",
      setup(b) {
        b.onResolve({ filter: /^next\/font\/google$/ }, () => ({
          path: join(root, "lab/next-font-shim.ts"),
        }));
        // url("/fonts/..") and url("/images/..") in CSS: inline them safely.
        b.onResolve({ filter: /^\/(fonts|images)\// }, (a) => ({
          path: resolvePublicAsset(a.path),
          namespace: "public-file",
        }));
        b.onLoad({ filter: /.*/, namespace: "public-file" }, (a) => ({
          contents: readFileSync(a.path),
          loader: "dataurl",
        }));
      },
    },
  ],
  loader: { ".ttf": "dataurl", ".jpg": "dataurl", ".webp": "dataurl" },
});

let js = "",
  css = "";
for (const f of result.outputFiles)
  if (f.path.endsWith(".js")) js = f.text;
  else if (f.path.endsWith(".css")) css = f.text;

// Image paths written as strings in data and components ("/images/x.jpg", "/images/onboarding/x.webp").
for (const { webPath, full } of walkImages(join(publicRoot, "images")))
  js = js.split(webPath).join(dataUri(full));
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
