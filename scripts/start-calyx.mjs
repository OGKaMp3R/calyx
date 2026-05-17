import { spawn } from "node:child_process";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 8787);
const healthUrl = `http://127.0.0.1:${port}/api/health`;
const appUrl = `http://127.0.0.1:${port}`;
const shouldOpenBrowser = (process.env.CALYX_OPEN_BROWSER || "true") !== "false";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requestHealth() {
  return new Promise((resolve) => {
    const req = http.get(
      healthUrl,
      { timeout: 1000 },
      (res) => {
        res.resume();
        resolve(res.statusCode === 200);
      },
    );

    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForHealth(maxAttempts = 40) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (await requestHealth()) return true;
    await wait(250);
  }
  return false;
}

function openBrowser(url) {
  if (!shouldOpenBrowser) return;

  const platform = process.platform;
  const commands =
    platform === "win32"
      ? [["cmd", ["/c", "start", "", url]]]
      : platform === "darwin"
        ? [["open", [url]]]
        : [["xdg-open", [url]]];

  for (const [command, args] of commands) {
    const child = spawn(command, args, {
      cwd: projectRoot,
      detached: true,
      stdio: "ignore",
    });
    child.on("error", () => {});
    child.unref();
    return;
  }
}

const server = spawn(process.execPath, ["server/stable-server.mjs"], {
  cwd: projectRoot,
  env: { ...process.env, PORT: String(port) },
  stdio: "inherit",
});

const shutdown = (signal) => {
  if (!server.killed) {
    server.kill(signal);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

server.on("exit", (code, signal) => {
  if (signal) {
    process.exitCode = 0;
    return;
  }
  process.exitCode = code ?? 0;
});

const ready = await waitForHealth();
if (ready) {
  console.log(`Project Calyx is ready at ${appUrl}`);
  openBrowser(appUrl);
} else {
  console.warn(`Project Calyx did not report healthy at ${healthUrl} in time.`);
}
