import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");
const publicDir = path.join(projectRoot, "public");
const srcDir = path.join(projectRoot, "src");
const assetImportPattern =
  /^import\s+([A-Za-z_$][\w$]*)\s+from\s+["'](.+\.(?:png|jpe?g|gif|svg|webp))["'];?\s*$/gm;

function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function posixJoin(...parts) {
  return parts.join("/").replace(/\/+/g, "/");
}

async function copyAssetImport(fileName, importPath) {
  const sourcePath = path.resolve(path.dirname(fileName), importPath);
  const targetName = path.basename(importPath);
  const distRelativePath = posixJoin("assets", "imported", targetName);
  const targetPath = path.join(distDir, distRelativePath);
  await mkdir(path.dirname(targetPath), { recursive: true });
  await cp(sourcePath, targetPath, { force: true });
  return `./${distRelativePath}`;
}

async function transformAppSource() {
  const appPath = path.join(srcDir, "App.jsx");
  let appSource = stripBom(await readFile(appPath, "utf8"));
  const assetDeclarations = [];

  const assetMatches = [...appSource.matchAll(assetImportPattern)];
  for (const match of assetMatches) {
    const [, variableName, importPath] = match;
    const distAssetPath = await copyAssetImport(appPath, importPath);
    assetDeclarations.push(`const ${variableName} = ${JSON.stringify(distAssetPath)};`);
  }

  appSource = appSource
    .replace(assetImportPattern, "")
    .replace(/^import\s+React,\s*\{([^}]+)\}\s+from\s+["']react["'];?\s*$/m, (_full, hooks) => {
      const names = hooks
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean)
        .join(", ");
      return `const { ${names} } = React;`;
    })
    .replace(/^import\s+React\s+from\s+["']react["'];?\s*$/m, "")
    .replace(/^export\s+default\s+/m, "");

  return [assetDeclarations.join("\n"), appSource].filter(Boolean).join("\n\n").trim();
}

async function buildStyles() {
  const stylesPath = path.join(srcDir, "styles.css");
  const stylesSource = stripBom(await readFile(stylesPath, "utf8")).replace(
    /^@import\s+["']tailwindcss["'];\s*$/m,
    "",
  );
  await writeFile(path.join(distDir, "styles.css"), stylesSource.trimStart(), "utf8");
}

async function buildHtml(appScript) {
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Project Calyx</title>
    <link rel="stylesheet" href="./styles.css" />
    <script src="https://cdn.tailwindcss.com"></script>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="text/babel" data-presets="react">
${appScript}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
    </script>
  </body>
</html>
`;
  await writeFile(path.join(distDir, "index.html"), html, "utf8");
}

async function copyPublicAssets() {
  try {
    await cp(publicDir, distDir, { recursive: true, force: true });
  } catch (error) {
    if (error && error.code !== "ENOENT") {
      throw error;
    }
  }
}

async function main() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });
  await copyPublicAssets();
  await buildStyles();
  const appScript = await transformAppSource();
  await buildHtml(appScript);
  console.log(`Static build written to ${distDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
