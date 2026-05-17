import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || process.env.PORT || 8787;
const RUN_AGENT_MODE = process.env.RUN_AGENT_MODE || "placeholder";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.1";
const BROWSER_AUTOMATION_MODE = process.env.BROWSER_AUTOMATION_MODE || "off";
const BROWSER_ALLOWED_ORIGINS = (process.env.BROWSER_ALLOWED_ORIGINS || "")
  .split(",")
  .map((x) => x.trim())
  .filter(Boolean);
const BROWSER_REQUIRE_HUMAN_CONFIRMATION = (process.env.BROWSER_REQUIRE_HUMAN_CONFIRMATION || "true") !== "false";
const BROWSER_ALLOW_LOGINS = process.env.BROWSER_ALLOW_LOGINS === "true";
const BROWSER_ALLOW_PAYMENTS = process.env.BROWSER_ALLOW_PAYMENTS === "true";
const BROWSER_ALLOW_PUBLIC_POSTING = process.env.BROWSER_ALLOW_PUBLIC_POSTING === "true";
const BROWSER_ALLOW_TRADING = process.env.BROWSER_ALLOW_TRADING === "true";

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/browser-runs", express.static("browser-runs"));

function nowIso() {
  return new Date().toISOString();
}

function openAiConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
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

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "Project Calyx API",
    mode: RUN_AGENT_MODE,
    model: OPENAI_MODEL,
    openAiConfigured: openAiConfigured(),
    timestamp: nowIso(),
    browserAutomation: {
      mode: BROWSER_AUTOMATION_MODE,
      allowedOrigins: BROWSER_ALLOWED_ORIGINS,
      requireHumanConfirmation: BROWSER_REQUIRE_HUMAN_CONFIRMATION,
    },
  });
});

app.post("/api/run-agent", async (req, res) => {
  const { agent = "Unknown", quest = "Untitled quest", packet = "Work packet", prompt = "" } = req.body || {};

  if (RUN_AGENT_MODE === "placeholder") {
    const result = [
      "Backend placeholder reached in placeholder mode.",
      "No OpenAI key is used.",
      "Set RUN_AGENT_MODE=openai and OPENAI_API_KEY in .env when ready to execute real calls.",
      "",
      `Agent: ${agent}`,
      `Quest: ${quest}`,
      `Packet: ${packet}`,
      prompt ? "Prompt received successfully." : "No prompt text was provided.",
    ].join("\n");

    return res.json({
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
    return res.status(400).json({
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
    return res.status(400).json({
      ok: false,
      mode: RUN_AGENT_MODE,
      model: OPENAI_MODEL,
      status: "blocked",
      error: "RUN_AGENT_MODE=openai but OPENAI_API_KEY is missing. Add it to .env on the server only, then restart npm run dev.",
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
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
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
      return res.status(response.status).json({
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

    return res.json({
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
  } catch (err) {
    return res.status(500).json({
      ok: false,
      mode: RUN_AGENT_MODE,
      model: OPENAI_MODEL,
      status: "blocked",
      error: err?.message || "OpenAI execution failed.",
      agent,
      quest,
      packet,
      timestamp: nowIso(),
    });
  }
});

async function runPlaywrightReadOnly(task = {}) {
  let playwright;
  try {
    playwright = await import("playwright");
  } catch {
    return {
      ok: false,
      status: "blocked",
      gate: "Playwright is not installed. Run: npm install",
    };
  }

  const runsDir = path.join(process.cwd(), "browser-runs");
  fs.mkdirSync(runsDir, { recursive: true });

  const browser = await playwright.chromium.launch({
    headless: false,
    slowMo: 100,
  });

  const page = await browser.newPage({ viewport: { width: 1365, height: 768 } });

  try {
    await page.goto(task.url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(1500);

    const title = await page.title().catch(() => "");
    const finalUrl = page.url();
    const visibleText = await page.locator("body").innerText({ timeout: 5000 }).catch(() => "");
    const screenshotName = `browser-run-${Date.now()}.png`;
    const screenshotFile = path.join(runsDir, screenshotName);
    await page.screenshot({ path: screenshotFile, fullPage: true }).catch(() => null);

    return {
      ok: true,
      status: "inspected",
      title,
      finalUrl,
      excerpt: visibleText.slice(0, 4000),
      screenshotPath: `/browser-runs/${screenshotName}`,
      note: "Read-only inspection completed. Browser was closed automatically.",
    };
  } finally {
    await browser.close().catch(() => null);
  }
}

app.get("/api/browser/runs", (_req, res) => {
  const runsDir = path.join(process.cwd(), "browser-runs");

  try {
    fs.mkdirSync(runsDir, { recursive: true });
    const runs = fs.readdirSync(runsDir)
      .filter((name) => /\.png$/i.test(name))
      .map((name) => {
        const file = path.join(runsDir, name);
        const stat = fs.statSync(file);
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

    res.json({
      ok: true,
      runs,
      count: runs.length,
      timestamp: nowIso(),
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err?.message || "Could not list browser runs.",
      runs: [],
      timestamp: nowIso(),
    });
  }
});

app.get("/api/browser/health", (_req, res) => {
  res.json({
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
    implemented: false,
    note: "Browser Ops safety harness is installed. Real browser control is not wired yet.",
    timestamp: nowIso(),
  });
});

app.post("/api/browser/run", async (req, res) => {
  const task = req.body || {};
  const gate = browserSafetyGate(task);

  if (gate) {
    return res.status(400).json({
      ok: false,
      status: "blocked",
      mode: BROWSER_AUTOMATION_MODE,
      gate,
      task,
      timestamp: nowIso(),
    });
  }

  if (BROWSER_AUTOMATION_MODE === "dry-run") {
    return res.json({
      ok: true,
      status: "dry-run",
      mode: BROWSER_AUTOMATION_MODE,
      result: [
        "Browser Ops dry run passed safety gates.",
        "No real browser was opened.",
        "Set BROWSER_AUTOMATION_MODE=playwright after installing Playwright to run visible read-only inspection.",
      ].join("\n"),
      task,
      timestamp: nowIso(),
    });
  }

  try {
    const inspected = await runPlaywrightReadOnly(task);
    if (!inspected.ok) {
      return res.status(400).json({
        ...inspected,
        mode: BROWSER_AUTOMATION_MODE,
        task,
        timestamp: nowIso(),
      });
    }

    return res.json({
      ok: true,
      status: inspected.status,
      mode: BROWSER_AUTOMATION_MODE,
      result: [
        "Browser Ops read-only inspection completed.",
        `Title: ${inspected.title || "n/a"}`,
        `URL: ${inspected.finalUrl || task.url}`,
        inspected.screenshotPath ? `Screenshot: ${inspected.screenshotPath}` : "Screenshot: n/a",
        "",
        "Visible text excerpt:",
        inspected.excerpt || "No visible text captured.",
      ].join("\n"),
      ...inspected,
      task,
      timestamp: nowIso(),
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      status: "blocked",
      mode: BROWSER_AUTOMATION_MODE,
      gate: err?.message || "Browser read-only inspection failed.",
      task,
      timestamp: nowIso(),
    });
  }
});


app.use((err, _req, res, _next) => {
  res.status(500).json({
    ok: false,
    mode: RUN_AGENT_MODE,
    model: OPENAI_MODEL,
    status: "blocked",
    error: err?.message || "Unknown server error",
    timestamp: nowIso(),
  });
});

app.listen(PORT, () => {
  console.log(`Project Calyx API listening on http://localhost:${PORT}`);
  console.log(`Backend mode: ${RUN_AGENT_MODE}`);
  console.log(`OpenAI model: ${OPENAI_MODEL}`);
});
