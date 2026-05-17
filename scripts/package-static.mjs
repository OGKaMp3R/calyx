import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const outputDir = path.resolve(projectRoot, "..", "..", "output");
const archivePath = path.join(outputDir, "project-calyx-hosted-baseline.zip");

function run(command, args, cwd = projectRoot) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: "inherit", env: process.env });
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} exited with code ${code ?? "unknown"}`));
    });
    child.on("error", reject);
  });
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  await rm(archivePath, { force: true });
  await run(process.execPath, ["scripts/build-static.mjs"]);
  await run("zip", ["-qr", archivePath, "."], projectRoot);
  console.log(`Packaged hosted baseline at ${archivePath}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
