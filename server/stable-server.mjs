import fs from "node:fs";
import fsp from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");
const browserRunsDir = path.join(projectRoot, "browser-runs");

const PORT = Number(process.env.API_PORT || process.env.PORT || 8787);
const RUN_AGENT_MODE = process.env.RUN_AGENT_MODE || "placeholder";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.1";
const BROWSER_AUTOMATION_MODE = process.env.BROWSER_AUTOMATION_MODE || "off";
const BROWSER_ALLOWED_ORIGINS = (process.env.BROWSER_ALLOWED_ORIGINS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const BROWSER_REQUIRE_HUMAN_CONFIRMATION = (process.env.BROWSER_REQUIRE_HUMAN_CONFIRMATION || "true") !== "false";
const BROWSER_ALLOW_LOGINS = process.env.BROWSER_ALLOW_LOGINS === "true";
const BROWSER_ALLOW_PAYMENTS = process.env.BROWSER_ALLOW_PAYMENTS === "true";
const BROWSER_ALLOW_PUBLIC_POSTING = process.env.BROWSER_ALLOW_PUBLIC_POSTING === "true";
const BROWSER_ALLOW_TRADING = process.env.BROWSER_ALLOW_TRADING === "true";

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
};

function nowIso() {
  return new Date().toISOString();
}

function openAiConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

function hasFrontendBuild() {
  return fs.existsSync(path.join(distDir, "index.html"));
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function sendText(res, statusCode, body) {
  res.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (!chunks.length) return {};

  const raw = Buffer.concat(chunks).toString("utf8");
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("Request body must be valid JSON.");
  }
}

function extractResponseText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) return data.output_text;

  const chunks = [];
  for (const item of data?.output || []) {
    for (const part of item?.content || []) {
      if (typeof part?.text === "string") chunks.push(part.text);
    }
  }

  return chunks.join("\n").trim();
}

function browserSafetyGate(task = {}) {
  const url = String(task.url || "");
  const lowerTask = JSON.stringify(task).toLowerCase();

  if (BROWSER_AUTOMATION_MODE === "off") {
    return "Browser automation is off. Set BROWSER_AUTOMATION_MODE=dry-run first.";
  }

  if (BROWSER_AUTOMATION_MODE !== "dry-run" && BROWSER_AUTOMATION_MODE !== "playwright") {
    return "Unsupported BROWSER_AUTOMATION_MODE. Use off, dry-run, or playwright.";
  }

  if (!BROWSER_ALLOWED_ORIGINS.length) {
    return "No allowed origins configured. Set BROWSER_ALLOWED_ORIGINS before browser automation.";
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return "Task URL is missing or invalid.";
  }

  if (!BROWSER_ALLOWED_ORIGINS.includes(parsed.origin)) {
    return `Origin not allowed: ${parsed.origin}`;
  }

  if (!BROWSER_ALLOW_LOGINS && /login|password|otp|2fa|captcha|signin|sign in/.test(lowerTask)) {
    return "Login/OTP/CAPTCHA flow detected. Justin must handle this gate.";
  }

  if (!BROWSER_ALLOW_PAYMENTS && /pay|payment|checkout|card|subscribe|purchase|buy/.test(lowerTask)) {
    return "Payment/purchase flow detected. Justin approval required.";
  }

  if (!BROWSER_ALLOW_PUBLIC_POSTING && /post|publish|comment|send message|email|dm|tweet|reply/.test(lowerTask)) {
    return "Public posting/messaging flow detected. Justin approval required.";
  }

  if (!BROWSER_ALLOW_TRADING && /trade|order|buy stock|sell stock|option|forex|crypto|ibkr/.test(lowerTask)) {
    return "Trading/live-risk flow detected. Paper-only or Justin approval required.";
  }

  if (BROWSER_REQUIRE_HUMAN_CONFIRMATION && task.confirmed !== true) {
    return "Human confirmation required before browser automation.";
  }

  return null;
}

async function sendFile(res, filePath) {
  try {
    const data = await fsp.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
      "Content-Length": data.length,
    });
    res.end(data);
  } catch {
    sendText(res, 404, "Not found");
  }
}

function safeJoin(baseDir, unsafePath) {
  const resolved = path.resolve(baseDir, `.${unsafePath}`);
  if (!resolved.startsWith(baseDir)) return null;
  return resolved;
}

async function handleApi(req, res, pathname) {
  if (req.method === "GET" && pathname === "/api/health") {
    return sendJson(res, 200, {
      ok: true,
      service: "Project Calyx Stable Server",
      mode: RUN_AGENT_MODE,
      model: OPENAI_MODEL,
      openAiConfigured: openAiConfigured(),
      frontendAvailable: hasFrontendBuild(),
      timestamp: nowIso(),
      browserAutomation: {
        mode: BROWSER_AUTOMATION_MODE,
        allowedOrigins: BROWSER_ALLOWED_ORIGINS,
        requireHumanConfirmation: BROWSER_REQUIRE_HUMAN_CONFIRMATION,
      },
    });
  }

  if (req.method === "GET" && pathname === "/api/browser/health") {
    return sendJson(res, 200, {
      ok: true,
      mode: BROWSER_AUTOMATION_MODE,
      allowedOrigins: BROWSER_ALLOWED_ORIGINS,
      requireHumanConfirmation: BROWSER_REQUIRE_HUMAN_CONFIRMATION,
      permissions: {
        logins: BROWSER_ALLOW_LOGINS,
        payments: BROWSER_ALLOW_PAYMENTS,
        publicPosting: BROWSER_ALLOW_PUBLIC_POSTING,
        trading: BROWSER_ALLOW_TRADING,
      },
      implemented: BROWSER_AUTOMATION_MODE === "dry-run",
      note: BROWSER_AUTOMATION_MODE === "dry-run"
        ? "Dry-run Browser Ops is available on the stable server."
        : "Stable server exposes the safety harness but does not include full browser control.",
      timestamp: nowIso(),
    });
  }

  if (req.method === "GET" && pathname === "/api/browser/runs") {
    await fsp.mkdir(browserRunsDir, { recursive: true });
    const runs = (await fsp.readdir(browserRunsDir))
      .filter((name) => /\.png$/i.test(name))
      .map((name) => {
        const filePath = path.join(browserRunsDir, name);
        const stat = fs.statSync(filePath);
        return {
          name,
          url: `/browser-runs/${name}`,
          sizeBytes: stat.size,
          createdAt: stat.birthtime?.toISOString?.() || stat.mtime.toISOString(),
          modifiedAt: stat.mtime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt))
      .slice(0, 30);

    return sendJson(res, 200, {
      ok: true,
      runs,
      count: runs.length,
      timestamp: nowIso(),
    });
  }

  if (req.method === "POST" && pathname === "/api/browser/run") {
    const task = await readJsonBody(req);
    const gate = browserSafetyGate(task);

    if (gate) {
      return sendJson(res, 400, {
        ok: false,
        status: "blocked",
        mode: BROWSER_AUTOMATION_MODE,
        gate,
        task,
        timestamp: nowIso(),
      });
    }

    if (BROWSER_AUTOMATION_MODE === "dry-run") {
      return sendJson(res, 200, {
        ok: true,
        status: "dry-run",
        mode: BROWSER_AUTOMATION_MODE,
        result: [
          "Browser Ops dry run passed safety gates.",
          "No real browser was opened by the stable server.",
          "Use this path for safe flow validation while the full toolchain is being stabilized.",
        ].join("\n"),
        task,
        timestamp: nowIso(),
      });
    }

    return sendJson(res, 400, {
      ok: false,
      status: "blocked",
      mode: BROWSER_AUTOMATION_MODE,
      gate: "Stable server does not bundle live browser control. Use dry-run here or switch back to the full dev stack later.",
      task,
      timestamp: nowIso(),
    });
  }

  if (req.method === "POST" && pathname === "/api/run-agent") {
    const body = await readJsonBody(req);
    const {
      agent = "Unknown",
      quest = "Untitled quest",
      packet = "Work packet",
      prompt = "",
    } = body || {};

    if (RUN_AGENT_MODE === "placeholder") {
      const result = [
        "Backend placeholder reached in placeholder mode.",
        "No OpenAI key is used.",
        "Set RUN_AGENT_MODE=openai and OPENAI_API_KEY when ready to execute real calls.",
        "",
        `Agent: ${agent}`,
        `Quest: ${quest}`,
        `Packet: ${packet}`,
        prompt ? "Prompt received successfully." : "No prompt text was provided.",
      ].join("\n");

      return sendJson(res, 200, {
        ok: true,
        mode: RUN_AGENT_MODE,
        model: null,
        status: "done",
        agent,
        quest,
        packet,
        result,
        timestamp: nowIso(),
      });
    }

    if (RUN_AGENT_MODE !== "openai") {
      return sendJson(res, 400, {
        ok: false,
        mode: RUN_AGENT_MODE,
        model: OPENAI_MODEL,
        status: "blocked",
        error: "Unsupported RUN_AGENT_MODE. Use placeholder or openai.",
        agent,
        quest,
        packet,
        timestamp: nowIso(),
      });
    }

    if (!openAiConfigured()) {
      return sendJson(res, 400, {
        ok: false,
        mode: RUN_AGENT_MODE,
        model: OPENAI_MODEL,
        status: "blocked",
        error: "RUN_AGENT_MODE=openai but OPENAI_API_KEY is missing.",
        agent,
        quest,
        packet,
        timestamp: nowIso(),
      });
    }

    try {
      const input = [
        {
          role: "system",
          content: [
            "You are an execution agent inside Project Calyx.",
            "Return concise, usable results for the operator.",
            "Do not claim you performed external actions unless the prompt explicitly provided the needed data.",
            "Return sections: findings, blockers, decisions, next action.",
          ].join("\n"),
        },
        {
          role: "user",
          content: prompt || `Act as ${agent}. Execute packet: ${packet}. Quest: ${quest}.`,
        },
      ];

      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          input,
          store: false,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return sendJson(res, response.status, {
          ok: false,
          mode: RUN_AGENT_MODE,
          model: OPENAI_MODEL,
          status: "blocked",
          error: data?.error?.message || `OpenAI request failed with status ${response.status}`,
          agent,
          quest,
          packet,
          timestamp: nowIso(),
        });
      }

      const result = extractResponseText(data) || "OpenAI response completed but no output text was returned.";
      return sendJson(res, 200, {
        ok: true,
        mode: RUN_AGENT_MODE,
        model: OPENAI_MODEL,
        status: "done",
        agent,
        quest,
        packet,
        result,
        responseId: data?.id || null,
        timestamp: nowIso(),
      });
    } catch (error) {
      return sendJson(res, 500, {
        ok: false,
        mode: RUN_AGENT_MODE,
        model: OPENAI_MODEL,
        status: "blocked",
        error: error?.message || "OpenAI execution failed.",
        agent,
        quest,
        packet,
        timestamp: nowIso(),
      });
    }
  }

  return false;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const pathname = url.pathname;

    const apiHandled = await handleApi(req, res, pathname);
    if (apiHandled !== false) return;

    if (pathname.startsWith("/browser-runs/")) {
      const filePath = safeJoin(browserRunsDir, pathname.replace("/browser-runs", ""));
      if (!filePath) return sendText(res, 400, "Invalid path");
      return sendFile(res, filePath);
    }

    if (!hasFrontendBuild()) {
      return sendText(
        res,
        503,
        "Project Calyx stable build is missing. Copy a built frontend into /workspace/calyx-cloud/dist and restart the server.",
      );
    }

    if (pathname.startsWith("/assets/")) {
      const filePath = safeJoin(distDir, pathname);
      if (!filePath) return sendText(res, 400, "Invalid path");
      return sendFile(res, filePath);
    }

    if (pathname === "/" || pathname === "/index.html") {
      return sendFile(res, path.join(distDir, "index.html"));
    }

    const staticCandidate = safeJoin(distDir, pathname);
    if (staticCandidate && fs.existsSync(staticCandidate) && fs.statSync(staticCandidate).isFile()) {
      return sendFile(res, staticCandidate);
    }

    return sendFile(res, path.join(distDir, "index.html"));
  } catch (error) {
    return sendJson(res, 500, {
      ok: false,
      status: "blocked",
      error: error?.message || "Unknown server error",
      timestamp: nowIso(),
    });
  }
});

server.listen(PORT, () => {
  console.log(`Project Calyx stable server listening on http://localhost:${PORT}`);
  console.log(`Frontend build available: ${hasFrontendBuild()}`);
  console.log(`Backend mode: ${RUN_AGENT_MODE}`);
  console.log(`Browser mode: ${BROWSER_AUTOMATION_MODE}`);
});
