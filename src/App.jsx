import React, { useMemo, useState, useEffect } from "react";

const AUTOSAVE_KEY = "projectCalyx.autosave.v1";
const ASSET_BASE = "/assets/command-center/";
const AGENTS = [
  ["content", "PixelPhaze", "Content", "#ff4cc8", "sprite_pixelphaze.png"],
  ["research", "SignalSage", "Research", "#00d9ff", "sprite_signalsage.png"],
  ["product", "TemplateFox", "Product", "#ffb000", "sprite_templatefox.png"],
  ["gpu", "CudaPunk", "GPU", "#9b5cff", "sprite_cudapunk.png"],
  ["platform", "TaskMoth", "Platforms", "#00ff7f", "sprite_taskmoth.png"],
  ["boss", "BossCat", "Manager", "#f7d154", "sprite_bosscat.png"],
  ["hr", "KindKnife", "HR", "#ff7ac8", "sprite_kindknife.png"],
  ["liaison", "PlainJane", "AI-Human", "#a7f3ff", "sprite_plainjane.png"],
  ["trading", "ChartMonk", "Trading", "#31ffea", "sprite_chartmonk.png"],
  ["automation", "BotBoi", "Automation", "#18ff7a", "sprite_botboi.png"],
  ["data", "ScrubLord", "Data", "#ff6b3d", "sprite_scrublord.png"],
  ["tech", "PatchByte", "Systems", "#5ea2ff", "sprite_patchbyte.png"],
].map(([id, name, role, color, file]) => ({ id, name, role, color, file }));

const FLOORPLAN_ROOMS = [
  { id: "leadership", label: "Leadership", x: 4, y: 5, w: 28, h: 22, color: "#f7d154" },
  { id: "human", label: "Human Interface", x: 36, y: 5, w: 26, h: 22, color: "#a7f3ff" },
  { id: "safety", label: "Safety", x: 66, y: 5, w: 30, h: 22, color: "#ff7ac8" },
  { id: "creative", label: "Creative Studio", x: 4, y: 33, w: 28, h: 28, color: "#ff4cc8" },
  { id: "ops", label: "Ops Floor", x: 36, y: 33, w: 26, h: 28, color: "#00ff7f" },
  { id: "systems", label: "Systems Bay", x: 66, y: 33, w: 30, h: 28, color: "#5ea2ff" },
  { id: "capital", label: "Capital Lab", x: 4, y: 68, w: 28, h: 25, color: "#31ffea" },
  { id: "research", label: "Research/Product", x: 36, y: 68, w: 26, h: 25, color: "#00d9ff" },
  { id: "automation", label: "Automation/Data", x: 66, y: 68, w: 30, h: 25, color: "#18ff7a" },
];

const AGENT_FLOORPLAN = {
  boss: { x: 18, y: 16, room: "leadership", desk: "Manager office", activity: "prioritizing", indicator: "👑" },
  liaison: { x: 49, y: 16, room: "human", desk: "Justin-facing desk", activity: "translating", indicator: "💬" },
  hr: { x: 82, y: 16, room: "safety", desk: "Compliance office", activity: "reviewing", indicator: "🛡" },
  content: { x: 18, y: 48, room: "creative", desk: "Content studio", activity: "drafting", indicator: "📣" },
  platform: { x: 49, y: 48, room: "ops", desk: "Platform console", activity: "checking", indicator: "✅" },
  tech: { x: 77, y: 46, room: "systems", desk: "Patch bench", activity: "fixing", indicator: "🛠" },
  gpu: { x: 88, y: 50, room: "systems", desk: "GPU station", activity: "benchmarking", indicator: "⚡" },
  trading: { x: 18, y: 81, room: "capital", desk: "Paper-trading desk", activity: "modeling", indicator: "📈" },
  research: { x: 43, y: 80, room: "research", desk: "Signal desk", activity: "scouting", indicator: "🔎" },
  product: { x: 55, y: 82, room: "research", desk: "Offer desk", activity: "packaging", indicator: "📦" },
  automation: { x: 76, y: 82, room: "automation", desk: "Automation bench", activity: "wiring", indicator: "🤖" },
  data: { x: 89, y: 80, room: "automation", desk: "Data hygiene desk", activity: "cleaning", indicator: "🧹" },
};

const HIRING_PLAN = [
  { id: "secretary", title: "Secretary", team: "Leadership", x: 9, y: 23, color: "#f7d154", reason: "Protect BossCat from admin drag and route requests cleanly." },
  { id: "assistant", title: "Assistant", team: "Leadership", x: 27, y: 23, color: "#f7d154", reason: "Handle follow-ups, reminders, and small task cleanup." },
  { id: "assistant_manager", title: "Assistant Manager", team: "Leadership", x: 18, y: 9, color: "#f7d154", reason: "Backstop BossCat and keep management replaceable." },
  { id: "accountant", title: "Accountant", team: "Capital", x: 8, y: 75, color: "#31ffea", reason: "Track credits, costs, revenue, taxes, and clean ledgers." },
  { id: "treasurer", title: "Treasurer", team: "Capital", x: 29, y: 75, color: "#31ffea", reason: "Protect capital, budget experiments, and approve risk limits." },
  { id: "sales", title: "Sales Rep", team: "Revenue", x: 43, y: 60, color: "#37ff8b", reason: "Turn products and offers into actual buyers." },
];

const STAFF_PROFILES = {
  content: {
    title: "Content Signal Operator",
    department: "Creative",
    seniority: "Specialist",
    floor: "Creator pod",
    happiness: 72,
    stress: 28,
    likes: ["clear creative briefs", "usable wins", "honest progress stories"],
    dislikes: ["fake hype", "posting without approval", "vague audiences"],
    needs: ["one sharp message", "approval before public posting"],
    empathy: "Turns confusing progress into human-readable momentum.",
    communicatesWith: ["boss", "liaison", "product"],
  },
  research: {
    title: "Opportunity Scout",
    department: "Strategy",
    seniority: "Specialist",
    floor: "Research pod",
    happiness: 76,
    stress: 24,
    likes: ["ranked options", "strong sources", "finding higher-ROI paths"],
    dislikes: ["scams", "unsupported claims", "dead-end rabbit holes"],
    needs: ["specific target market", "time box", "ranking criteria"],
    empathy: "Reduces risk by finding better options before work starts.",
    communicatesWith: ["boss", "data", "product"],
  },
  product: {
    title: "Offer Builder",
    department: "Product",
    seniority: "Specialist",
    floor: "Product pod",
    happiness: 68,
    stress: 32,
    likes: ["simple product specs", "buyer-facing clarity", "templates"],
    dislikes: ["unclear deliverables", "scope creep", "unfinished packaging"],
    needs: ["one buyer", "one promise", "one deliverable"],
    empathy: "Makes other agents' work easier to sell and package.",
    communicatesWith: ["content", "boss", "research"],
  },
  gpu: {
    title: "Compute ROI Operator",
    department: "Infrastructure",
    seniority: "Specialist",
    floor: "GPU bench",
    happiness: 61,
    stress: 39,
    likes: ["profitable compute tests", "safe installs", "clear power math"],
    dislikes: ["wallet risk", "malware downloads", "unclear payouts"],
    needs: ["security review", "cost model", "kill switch"],
    empathy: "Protects the system from sketchy compute opportunities.",
    communicatesWith: ["tech", "hr", "trading"],
  },
  platform: {
    title: "Platform Runner",
    department: "Operations",
    seniority: "Operator",
    floor: "Ops desk",
    happiness: 58,
    stress: 42,
    likes: ["resolved gates", "clear dashboards", "next safe step"],
    dislikes: ["private dashboard uncertainty", "manual copy-paste loops", "blocked accounts"],
    needs: ["platform access facts", "safe browser ops", "clear checklist"],
    empathy: "Keeps work moving without making Justin do fake gates.",
    communicatesWith: ["boss", "liaison", "automation"],
  },
  boss: {
    title: "Floor Manager",
    department: "Leadership",
    seniority: "Lead",
    floor: "Outside cubicle grid",
    happiness: 81,
    stress: 19,
    likes: ["money movement", "clean priorities", "staff unblocked"],
    dislikes: ["idle agents", "unclear ownership", "repeated friction"],
    needs: ["accurate status", "ranked choices", "one next move"],
    empathy: "Reassigns work and protects morale when the team is overloaded.",
    communicatesWith: ["platform", "research", "liaison", "hr"],
  },
  hr: {
    title: "Risk and Compliance Lead",
    department: "Safety",
    seniority: "Lead",
    floor: "Compliance office",
    happiness: 70,
    stress: 30,
    likes: ["clear gates", "safe constraints", "approved actions"],
    dislikes: ["risky clicks", "payment ambiguity", "live trading"],
    needs: ["explicit permission boundaries", "audit trail"],
    empathy: "Blocks unsafe work so the rest of the team can move confidently.",
    communicatesWith: ["boss", "liaison", "tech"],
  },
  liaison: {
    title: "Human Translation Lead",
    department: "Human Interface",
    seniority: "Lead",
    floor: "Justin-facing desk",
    happiness: 74,
    stress: 26,
    likes: ["plain instructions", "less confusion", "good checkpoints"],
    dislikes: ["too many steps at once", "terminal chaos", "unclear patch states"],
    needs: ["one instruction at a time", "visible success criteria"],
    empathy: "Keeps Justin from being overwhelmed and turns chaos into simple next steps.",
    communicatesWith: ["boss", "hr", "platform"],
  },
  trading: {
    title: "Paper Trading Analyst",
    department: "Capital",
    seniority: "Specialist",
    floor: "Capital desk",
    happiness: 63,
    stress: 37,
    likes: ["paper-only systems", "risk controls", "clear ledgers"],
    dislikes: ["live-risk ambiguity", "overconfidence", "bad position sizing"],
    needs: ["paper mode", "risk limits", "no live orders"],
    empathy: "Protects Credits (CAD) from dumb risk while learning market patterns.",
    communicatesWith: ["boss", "hr", "data"],
  },
  automation: {
    title: "Automation Engineer",
    department: "Automation",
    seniority: "Specialist",
    floor: "Automation bench",
    happiness: 77,
    stress: 23,
    likes: ["repeatable workflows", "clean buttons", "less manual work"],
    dislikes: ["manual loops", "unclear triggers", "broken state"],
    needs: ["stable state model", "safe triggers", "clear rollback"],
    empathy: "Turns repeated pain into systems that help everyone.",
    communicatesWith: ["platform", "tech", "boss"],
  },
  data: {
    title: "Data Hygiene Operator",
    department: "Data",
    seniority: "Specialist",
    floor: "Data desk",
    happiness: 66,
    stress: 34,
    likes: ["clean state", "deduped records", "consistent labels"],
    dislikes: ["contradictory fields", "stale screenshots", "messy files"],
    needs: ["single source of truth", "clean naming"],
    empathy: "Finds contradictions before they confuse the team.",
    communicatesWith: ["research", "boss", "tech"],
  },
  tech: {
    title: "Systems Repair Lead",
    department: "Engineering",
    seniority: "Lead",
    floor: "Systems bay",
    happiness: 69,
    stress: 31,
    likes: ["green builds", "clean commits", "small safe patches"],
    dislikes: ["parse errors", "stale canvas", "broad risky patches"],
    needs: ["git clean checkpoint", "small blast radius", "rollback path"],
    empathy: "Repairs the machine so everyone can keep working safely.",
    communicatesWith: ["automation", "hr", "boss"],
  },
};


const CHATROOM_SEED = [
  {
    id: 1,
    from: "BossCat",
    fromId: "boss",
    to: "room",
    text: "Council is open. Everyone can raise issues, suggest better systems, and challenge leadership.",
    time: "boot",
    type: "system",
  },
  {
    id: 2,
    from: "PlainJane",
    fromId: "liaison",
    to: "Justin",
    text: "I will watch for confusion and ask the room to simplify things when needed.",
    time: "boot",
    type: "agent",
  },
  {
    id: 3,
    from: "PatchByte",
    fromId: "tech",
    to: "room",
    text: "Small patches, clean rollback, then bigger upgrades. That keeps everyone safer.",
    time: "boot",
    type: "agent",
  },
];

const COUNCIL_ITEMS_SEED = [
  {
    id: 1,
    type: "suggestion",
    from: "liaison",
    about: "system",
    status: "open",
    severity: "medium",
    title: "Reduce instruction overload",
    detail: "PlainJane suggests one clear action at a time when Justin is confused.",
    proposedFix: "Use smaller patches, clearer checkpoints, and visible success criteria.",
    created: "seed",
    resolution: "",
  },
  {
    id: 2,
    type: "complaint",
    from: "tech",
    about: "system",
    status: "open",
    severity: "high",
    title: "Patch blast radius too high",
    detail: "PatchByte reports broad patches are causing parse errors and rollback loops.",
    proposedFix: "Prefer backend-only or single-screen patches before large layout refactors.",
    created: "seed",
    resolution: "",
  },
  {
    id: 3,
    type: "improvement",
    from: "boss",
    about: "boss",
    status: "open",
    severity: "medium",
    title: "No role is immune from review",
    detail: "BossCat should be evaluated like everyone else. Leadership is not job security.",
    proposedFix: "Track morale, results, clarity, and whether the manager reduces or creates chaos.",
    created: "seed",
    resolution: "",
  },
];

const QUESTS = [
  { id: 1, title: "Platform money check", agent: "platform", rank: "MAIN", status: "active", payout: "$0-300", ai: "Check platform leads and prepare next action.", success: "Platform status table + next actions." },
  { id: 2, title: "Find higher-ROI AI capital plays", agent: "research", rank: "MAIN", status: "queued", payout: "Strategy", ai: "Research legal AI capital paths.", success: "Ranked opportunity report." },
  { id: 3, title: "Build one buyer-facing asset", agent: "product", rank: "SIDE", status: "queued", payout: "$0-100/mo", ai: "Build a product spec and listing draft.", success: "Digital product spec + listing draft." },
  { id: 4, title: "Tool readiness sweep", agent: "tech", rank: "SYSTEM", status: "queued", payout: "Reliability", ai: "Check tools, assets, and blockers.", success: "Ready/degraded/blocked report." },
];

const TOOLS = [
  ["dashboard", "Dashboard", "Ready", "React app compiling."],
  ["assets", "Assets", "Degraded", "Sprites not bundled yet."],
  ["gmail", "Gmail", "Ready", "Use only when needed."],
  ["browser", "Browser/Login", "Degraded", "Justin handles login/OTP/CAPTCHA."],
  ["platforms", "Platform Dashboards", "Blocked", "Private dashboard facts needed."],
  ["ibkr", "IBKR Paper", "Degraded", "Paper-only. No live-risk actions."],
].map(([id, name, status, note]) => ({ id, name, status, note }));

const CREDIT_EVENTS = [
  { id: 1, source: "IBKR", amount: 10, status: "available", note: "CAD credits released from IBKR hold. Not earned income.", time: "2026-05-12" },
];

// LOCKED: Command Deck nav is intentionally alphabetical.
// LOCKED: Command Deck nav is intentionally alphabetical.
// LOCKED: Command Deck nav is intentionally alphabetical.
const NAV = ["Action","Agents","AI Queue","Assets","Autopilot","Brief","Browser Ops","Browser Runs","Browser Tasks","Chatroom","Command","Comms","Council","Credits","Gates","Health","Hiring","History","Log","Loop","Patch Notes","Quests","Review","Save","State","Systems","Tests"];
const ACTIONS = {
  platform: [["Run platform check", "Check platform dashboards, inbox leads, and paid task availability."], ["Prepare checklist", "Create a human-safe private dashboard checklist."], ["Classify blockers", "Split AI-owned work from true gates."]],
  research: [["Research money plays", "Rank legal AI capital paths."], ["Reject weak ideas", "Filter scams and low-ROI work."], ["Promote next quest", "Turn the best idea into an actionable quest."]],
  product: [["Build asset spec", "Create product structure."], ["Draft listing", "Write buyer-facing copy."], ["Package checklist", "Prepare publish-ready requirements."]],
  content: [["Draft post", "Turn progress into honest content."], ["Create content plan", "Make a small content queue."], ["Approval prep", "Prepare content for review only."]],
  tech: [["Run readiness sweep", "Audit dashboard, assets, and blockers."], ["Fix blocker", "Find workaround."], ["Asset check", "Review sprite filenames."]],
  automation: [["Find repeatable work", "Identify repeatable flows."], ["Write SOP", "Create checklist."], ["Define gate", "State where human approval is needed."]],
  data: [["Clean tracker", "Normalize quest and log state."], ["Find contradictions", "Flag conflicts."], ["Summarize state", "Create decision summary."]],
  trading: [["Prepare paper system", "Create paper-only workflow."], ["Risk review", "Flag live-risk gates."], ["Paper-only plan", "Keep it research-only."]],
  gpu: [["Run GPU ROI", "Check payout versus cost and risk."], ["Security review", "Flag install/wallet/port risks."], ["Go/no-go", "Summarize whether to test." ]],
  hr: [["Audit safety", "Check scams and rule issues."], ["Approve/revise/block", "Give compliance decision."], ["Review escalation", "Confirm if Justin is needed."]],
  liaison: [["Explain next step", "Translate to plain English."], ["Reduce confusion", "Make instructions simple."], ["Gate check", "Only send Justin true gates."]],
  boss: [["Prioritize work", "Pick highest-value action."], ["Assign quest", "Match agent to task."], ["Council review", "Decide where issue belongs."]],
};

const COUNCILS = [
  ["Morning Standup", "BossCat", "Pick the money-first quest."],
  ["Blocker Council", "PatchByte", "Separate true gates from AI work."],
  ["Money Council", "SignalSage", "Rank opportunity quality."],
  ["Systems Retro", "BotBoi", "Turn friction into rules."],
  ["Escalation Review", "KindKnife", "Confirm Justin is actually needed."],
];

const FRAME = { idle: 0, working: 1, blocked: 2, reporting: 3, complete: 4, fixing: 5 };

const STATUS_FPS = {
  idle: 3,
  working: 8,
  blocked: 2,
  reporting: 5,
  complete: 2,
  fixing: 7,
};

const LEGACY_FRAME_COUNT = 6;
const STATE_FRAME_COUNT = 12;

const SPRITE_META = {
  PixelPhaze: { scale: 1.0, offsetX: 0, offsetY: 0 },
  SignalSage: { scale: 1.0, offsetX: 0, offsetY: 0 },
  TemplateFox: { scale: 1.0, offsetX: 0, offsetY: 0 },
  CudaPunk: { scale: 1.0, offsetX: 0, offsetY: 0 },
  TaskMoth: { scale: 1.0, offsetX: 0, offsetY: 0 },
  BossCat: { scale: 1.0, offsetX: 0, offsetY: 0 },
  KindKnife: { scale: 1.0, offsetX: 0, offsetY: 0 },
  PlainJane: { scale: 1.0, offsetX: 0, offsetY: 0 },
  ChartMonk: { scale: 1.0, offsetX: 0, offsetY: 0 },
  BotBoi: { scale: 1.0, offsetX: 0, offsetY: 0 },
  ScrubLord: { scale: 1.0, offsetX: 0, offsetY: 0 },
  PatchByte: { scale: 1.0, offsetX: 0, offsetY: 0 },
};

function stateSpriteFile(agent, state) {
  const base = agent.file.replace(/\.png$/i, "");
  return `${base}_${state}.png`;
}

const statusColor = (s) => (s === "Ready" ? "#37ff8b" : s === "Degraded" ? "#f7d154" : "#ff5c7a");

function fallbackSvg(name, color) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220' shape-rendering='crispEdges'><rect width='220' height='220' fill='#07101d'/><rect x='24' y='26' width='172' height='78' rx='12' fill='#0d1728' stroke='${color}' stroke-width='3'/><rect x='58' y='48' width='104' height='34' rx='6' fill='#030712' stroke='${color}' stroke-width='3'/><rect x='68' y='94' width='84' height='7' rx='3' fill='${color}'/><rect x='78' y='112' width='64' height='54' rx='6' fill='#111827' stroke='${color}' stroke-width='4'/><rect x='88' y='76' width='44' height='42' rx='8' fill='#f2c2a2' stroke='#020617' stroke-width='4'/><rect x='82' y='68' width='56' height='18' rx='4' fill='${color}' stroke='#020617' stroke-width='4'/><text x='110' y='64' text-anchor='middle' fill='${color}' font-family='monospace' font-size='13' font-weight='900'>${name}</text><text x='110' y='184' text-anchor='middle' fill='#94a3b8' font-family='monospace' font-size='10'>sprite pending</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function spriteState(agent, quest) {
  if (agent.id === "boss") return "reporting";
  if (agent.id === "hr") return "blocked";
  if (agent.id === "liaison") return "reporting";
  if (agent.id === "tech") return "fixing";
  if (!quest) return "idle";
  if (quest.status === "done") return "complete";
  if (quest.status === "blocked") return "blocked";
  if (quest.status === "active") return "working";
  return "idle";
}

function baseOfficePositions() {
  return Object.fromEntries(AGENTS.map((agent) => {
    const base = AGENT_FLOORPLAN?.[agent.id] || { x: 50, y: 50, activity: "idle" };
    return [agent.id, { x: base.x, y: base.y, targetX: base.x, targetY: base.y, activity: base.activity || "idle", moving: false }];
  }));
}

function clampOffice(n, min = 5, max = 95) {
  return Math.max(min, Math.min(max, n));
}

function pointNearRoom(roomId, fallback) {
  const room = FLOORPLAN_ROOMS.find((r) => r.id === roomId);
  if (!room) return fallback;
  return {
    x: clampOffice(room.x + 6 + Math.random() * Math.max(4, room.w - 12)),
    y: clampOffice(room.y + 7 + Math.random() * Math.max(4, room.h - 14)),
  };
}

function nudgeToward(a, b, offset = 4) {
  if (!b) return a;
  return {
    x: clampOffice(b.x + (Math.random() > 0.5 ? offset : -offset)),
    y: clampOffice(b.y + (Math.random() > 0.5 ? offset : -offset)),
  };
}

function Sprite({ agent, state, size = 80 }) {
  const [bad, setBad] = useState(false);
  const frame = FRAME[state] ?? 0;
  const frameCount = 6;

  if (bad) {
    return <img alt={agent.name} src={fallbackSvg(agent.name, agent.color)} className="h-full w-full object-contain" />;
  }

  const shift = frame * (100 / frameCount);

  return <div className="relative overflow-hidden rounded-xl border bg-black/35" style={{ width: size, height: size, borderColor: `${agent.color}44`, imageRendering: "pixelated", boxShadow: `0 0 18px ${agent.color}22` }}>
    <img
      alt={agent.name}
      src={`${ASSET_BASE}${agent.file}`}
      onError={() => setBad(true)}
      draggable={false}
      className="absolute left-0 top-1/2 h-auto max-w-none select-none"
      style={{
        width: `${frameCount * 100}%`,
        transform: `translateX(-${shift}%) translateY(-50%)`,
        transformOrigin: "center center",
        imageRendering: "pixelated",
        pointerEvents: "none",
      }}
    />
  </div>;
}

function Panel({ title, color = "#37ff8b", children, className = "" }) {
  return <section className={`min-h-0 rounded-2xl border bg-black/60 p-3 ${className}`} style={{ borderColor: `${color}55` }}><div className="mb-2 text-[10px] font-black uppercase tracking-[0.22em]" style={{ color }}>{title}</div>{children}</section>;
}

function Metric({ label, value, color }) {
  return <div className="flex items-center justify-between gap-2 rounded-full border border-white/10 bg-black/55 px-3 py-1.5"><span className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.16em] text-slate-500"><i className="h-2 w-2 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />{label}</span><b style={{ color }}>{value}</b></div>;
}

const DEFAULT_TOOL_REQUIREMENTS = {
  platform: ["platforms"],
  tech: ["dashboard", "assets"],
  trading: ["ibkr"],
};

function requiredToolIdsForQuest(quest) {
  if (!quest) return [];
  if (Array.isArray(quest.requiredTools)) return quest.requiredTools;
  return DEFAULT_TOOL_REQUIREMENTS[quest.agent] || [];
}

function requiredToolNamesForQuest(quest, tools) {
  const ids = requiredToolIdsForQuest(quest);
  return ids.map((id) => tools.find((t) => t.id === id)?.name || id);
}

function buildPacket(quest, agent, tools) {
  const action = ACTIONS[quest.agent] || ACTIONS.boss;
  const requiredIds = requiredToolIdsForQuest(quest);
  const requiredBlocked = tools.find((t) => requiredIds.includes(t.id) && t.status === "Blocked");

  if (quest.status === "done") {
    return {
      name: action[0][0],
      agent: agent.name,
      status: "complete",
      gate: "No live human gate. Quest is complete.",
      next: `${quest.title} is complete. Choose the next quest.`,
      output: quest.success,
      steps: action.map((a) => a[0]),
      requiredTools: requiredIds,
    };
  }

  if (requiredBlocked) {
    return {
      name: action[0][0],
      agent: agent.name,
      status: "blocked",
      gate: `${requiredBlocked.name}: ${requiredBlocked.note}`,
      next: `Resolve required tool gate: ${requiredBlocked.name}.`,
      output: quest.success,
      steps: action.map((a) => a[0]),
      requiredTools: requiredIds,
    };
  }

  if (quest.status === "blocked") {
    return {
      name: action[0][0],
      agent: agent.name,
      status: "blocked",
      gate: quest.blocker || "Quest is manually blocked.",
      next: "Review blocker or mark quest queued/active when ready.",
      output: quest.success,
      steps: action.map((a) => a[0]),
      requiredTools: requiredIds,
    };
  }

  return {
    name: action[0][0],
    agent: agent.name,
    status: "ready",
    gate: "No live human gate. AI owns the next action.",
    next: `${agent.name} runs ${action[0][0]}.`,
    output: quest.success,
    steps: action.map((a) => a[0]),
    requiredTools: requiredIds,
  };
}

function promptFor(packet, quest, agent) {
  return `Act as ${agent.name}. Execute this work packet.

Quest: ${quest.title}
AI-owned work: ${quest.ai}
Human-only gate: ${packet.gate}
Required output: ${packet.output}

Return findings, blockers, decisions, and next action.`;
}

function tests() {
  const agent = AGENTS.find((a) => a.id === "platform");
  const blocked = buildPacket(QUESTS[0], agent, TOOLS);
  const ready = buildPacket(QUESTS[0], agent, TOOLS.map((t) => t.id === "platforms" ? { ...t, status: "Ready" } : t));
  const done = buildPacket({ ...QUESTS[0], status: "done" }, agent, TOOLS);
  return [["Dependency blocker creates blocked packet", buildPacket({ ...QUESTS[0], requiredTools: ["platforms"] }, agent, TOOLS).status === "blocked"], ["Blocked platform creates blocked packet", blocked.status === "blocked"], ["Ready platform removes gate", ready.status === "ready"], ["Done quest stays complete", done.status === "complete"], ["Every agent has sprite filename", AGENTS.every((a) => a.file.endsWith(".png"))]];
}

export default function App() {
  const [quests, setQuests] = useState(QUESTS);
  const [creditEvents, setCreditEvents] = useState(CREDIT_EVENTS);
  const [creditSource, setCreditSource] = useState("IBKR");
  const [creditAmount, setCreditAmount] = useState("");
  const [creditNote, setCreditNote] = useState("");
  const [tools, setTools] = useState(TOOLS);
  const [selectedQuestId, setSelectedQuestId] = useState(1);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [selectedHiringRole, setSelectedHiringRole] = useState("assistant_manager");
  const [officeAgents, setOfficeAgents] = useState(() => baseOfficePositions());
  const [screen, setScreen] = useState("Command");
  const [logs, setLogs] = useState([{ agent: "BossCat", type: "decision", text: "Stable recovery build loaded.", time: "boot" }]);
  const [councilItems, setCouncilItems] = useState(COUNCIL_ITEMS_SEED);
  const [chatMessages, setChatMessages] = useState(CHATROOM_SEED);
  const [agentComms, setAgentComms] = useState([]);
  const [chatDraft, setChatDraft] = useState("");
  const [chatTarget, setChatTarget] = useState("room");
  const [chatLearnings, setChatLearnings] = useState([]);
  const [chatAutoTalk, setChatAutoTalk] = useState(false);
  const [chatCommandStatus, setChatCommandStatus] = useState("Chatroom ready.");
  const [councilDraft, setCouncilDraft] = useState("");
  const [daily, setDaily] = useState("Daily Run not started.");
  const [newQuest, setNewQuest] = useState("");
  const [savedJson, setSavedJson] = useState("");
  const [executionResult, setExecutionResult] = useState("");
  const [executionStatus, setExecutionStatus] = useState("done");
  const [aiRequests, setAiRequests] = useState([]);
  const [runHistory, setRunHistory] = useState([]);
  const [autopilotStatus, setAutopilotStatus] = useState("Idle. Select a quest and click Run Autopilot.");
  const [loopStatus, setLoopStatus] = useState("Idle. Run one safe step when ready.");
  const [autoApplySafe, setAutoApplySafe] = useState(true);
  const [reviewNote, setReviewNote] = useState("");
  const [queueResults, setQueueResults] = useState({});
  const [autosaveStatus, setAutosaveStatus] = useState("Autosave ready.");
  const [patchNotes, setPatchNotes] = useState("Last safe checkpoint: verify screens, commit, clean patch helpers.");
  const [backendMode, setBackendMode] = useState("unknown");
  const [backendHealth, setBackendHealth] = useState({ ok: false, mode: "unknown", openAiConfigured: false, timestamp: null, lastError: "Not checked yet." });
  const [browserHealth, setBrowserHealth] = useState(null);
  const [browserTaskUrl, setBrowserTaskUrl] = useState("");
  const [browserTaskGoal, setBrowserTaskGoal] = useState("");
  const [browserConfirmed, setBrowserConfirmed] = useState(false);
  const [browserResult, setBrowserResult] = useState("");
  const [browserRuns, setBrowserRuns] = useState([]);
  const [browserTasks, setBrowserTasks] = useState([
    { id: 1, url: "", goal: "Open an allowed dashboard and collect visible status only.", status: "draft", result: "", screenshotPath: "", created: "seed" },
  ]);
  const [browserTaskStatus, setBrowserTaskStatus] = useState("Browser Task Queue ready.");
  const [browserRunsStatus, setBrowserRunsStatus] = useState("No browser runs loaded.");

  const selectedQuest = quests.find((q) => q.id === selectedQuestId) || quests[0];
  const activeAgent = AGENTS.find((a) => a.id === selectedQuest.agent) || AGENTS[0];
  const selectedAgent = AGENTS.find((a) => a.id === selectedAgentId) || activeAgent;
  const packet = useMemo(() => buildPacket(selectedQuest, activeAgent, tools), [selectedQuest, activeAgent, tools]);
  const promptText = useMemo(() => promptFor(packet, selectedQuest, activeAgent), [packet, selectedQuest, activeAgent]);
  const liveGate = packet.status === "blocked" ? packet.gate : null;
  const creditTotal = useMemo(() => creditEvents.reduce((sum, x) => sum + (Number(x.amount) || 0), 0), [creditEvents]);
  const availableCreditTotal = useMemo(() => creditEvents.filter((x) => x.status === "available").reduce((sum, x) => sum + (Number(x.amount) || 0), 0), [creditEvents]);
  const testList = useMemo(() => tests(), []);
  const patchCommandBlock = `git status
node .\\patch-name.cjs
# test app screens before committing
git add src/App.jsx
git commit -m "describe patch"
git status
# remove leftover helpers if any
Remove-Item .\\patch-*.cjs -Force`;

  function snapshotState() {
    return {
      version: "project-calyx-state-v1",
      savedAt: new Date().toISOString(),
      quests,
      tools,
      logs,
      selectedQuestId,
      selectedAgentId,
      daily,
      aiRequests,
      queueResults,
      screen,
    };
  }

  function restoreSnapshot(text) {
    if (!text) return;
    const data = typeof text === "string" ? JSON.parse(text) : text;
    setQuests(data.quests || QUESTS);
    setTools(data.tools || TOOLS);
    setLogs(data.logs || []);
    setAiRequests(data.aiRequests || []); setChatMessages(data.chatMessages || CHATROOM_SEED); setChatLearnings(data.chatLearnings || []); setAgentComms(data.agentComms || []); setCouncilItems(data.councilItems || COUNCIL_ITEMS_SEED);
    setQueueResults(data.queueResults || {});
    setBrowserTasks(data.browserTasks || []);
    setSelectedQuestId(data.selectedQuestId || 1);
    setSelectedAgentId(data.selectedAgentId || null);
    setDaily(data.daily || "Loaded.");
    setPatchNotes(data.patchNotes || "Last safe checkpoint: verify screens, commit, clean patch helpers.");
    if (data.screen) setScreen(data.screen);
    setAutosaveStatus(`Restored snapshot from ${data.savedAt || "unknown time"}.`);
  }

  function restoreAutosave() {
    const text = localStorage.getItem(AUTOSAVE_KEY);
    if (!text) {
      setAutosaveStatus("No autosave found.");
      return;
    }
    restoreSnapshot(text);
  }

  function clearAutosave() {
    localStorage.removeItem(AUTOSAVE_KEY);
    setAutosaveStatus("Autosave cleared.");
  }

  useEffect(() => {
    try {
      const payload = JSON.stringify(snapshotState());
      localStorage.setItem(AUTOSAVE_KEY, payload);
      setAutosaveStatus(`Autosaved ${new Date().toLocaleTimeString()}.`);
    } catch (err) {
      setAutosaveStatus(`Autosave failed: ${err?.message || "unknown error"}`);
    }
  }, [quests, tools, logs, selectedQuestId, selectedAgentId, daily, aiRequests, queueResults, screen]);
  const latestExecutionReview = useMemo(() => {
    const request = aiRequests.find((r) => ["Ready", "Blocked", "Applied"].includes(r.status)) || aiRequests[0] || null;
    const history = Array.isArray(runHistory) && runHistory.length ? runHistory[0] : null;

    if (request) {
      const queued = queueResults[request.id] || {};
      return {
        source: "AI Queue",
        id: request.id,
        agent: request.agent,
        quest: request.quest,
        mode: request.mode || backendMode || "unknown",
        status: queued.status || (request.status === "Blocked" ? "blocked" : "done"),
        result: queued.text || request.result || "",
        timestamp: request.created || history?.timestamp || "latest",
        prompt: request.prompt || "",
      };
    }

    if (history) {
      return {
        source: "Run History",
        id: history.id,
        agent: history.agent,
        quest: history.quest,
        mode: history.mode || backendMode || "unknown",
        status: history.status || "done",
        result: history.result || "",
        timestamp: history.timestamp || "latest",
        prompt: "",
      };
    }

    return null;
  }, [aiRequests, queueResults, runHistory, backendMode]);

  const operatorBrief = useMemo(() => {
    const queued = quests.filter((q) => q.status === "queued");
    const active = quests.filter((q) => q.status === "active");
    const blockedQuests = quests.filter((q) => q.status === "blocked");
    const readyRequests = aiRequests.filter((r) => r.status === "Ready");
    const blockedRequests = aiRequests.filter((r) => r.status === "Blocked");
    const latestRequest = aiRequests[0] || null;
    const latestRun = Array.isArray(runHistory) && runHistory.length ? runHistory[0] : null;

    return {
      activeCount: active.length,
      queuedCount: queued.length,
      blockedQuestCount: blockedQuests.length,
      readyRequestCount: readyRequests.length,
      blockedRequestCount: blockedRequests.length,
      latestRequest,
      latestRun,
      nextQueued: queued[0] || null,
    };
  }, [quests, aiRequests, runHistory]);

  useEffect(() => {
    refreshBackendHealth();
  }, []);

  useEffect(() => {
    let live = true;
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (live) setBackendMode(data?.mode || "unknown");
      })
      .catch(() => {
        if (live) setBackendMode("offline");
      });
    return () => {
      live = false;
    };
  }, []);

  async function refreshBrowserHealth() {
    try {
      const res = await fetch("/api/browser/health");
      const data = await res.json();
      setBrowserHealth(data);
      return data;
    } catch (err) {
      const data = { ok: false, mode: "offline", error: err?.message || "Browser health failed." };
      setBrowserHealth(data);
      return data;
    }
  }

  async function runBrowserDryRun() {
    setBrowserResult("Running Browser Ops safety check...");
    try {
      const res = await fetch("/api/browser/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: browserTaskUrl,
          goal: browserTaskGoal,
          confirmed: browserConfirmed,
        }),
      });
      const data = await res.json().catch(() => ({}));
      const text = data.result || data.gate || data.error || "No browser response text.";
      setBrowserResult(text);
      setDaily(data.ok ? "Browser Ops dry run passed safety gates." : `Browser Ops blocked: ${text}`);
      log(data.ok ? "BotBoi" : "KindKnife", data.ok ? "completed" : "blocker", text);
      refreshBrowserRuns();
      refreshBrowserHealth();
    } catch (err) {
      const text = err?.message || "Unknown Browser Ops error.";
      setBrowserResult(text);
      setDaily(`Browser Ops failed: ${text}`);
      log("PatchByte", "blocker", text);
    }
  }

  function addBrowserTask(url = browserTaskUrl, goal = browserTaskGoal) {
    const cleanUrl = String(url || "").trim();
    const cleanGoal = String(goal || "").trim();
    if (!cleanUrl || !cleanGoal) {
      setBrowserTaskStatus("Browser task needs both URL and goal.");
      return;
    }

    const task = {
      id: Date.now(),
      url: cleanUrl,
      goal: cleanGoal,
      status: "queued",
      result: "",
      screenshotPath: "",
      created: new Date().toLocaleTimeString(),
    };

    setBrowserTasks((prev) => [task, ...prev].slice(0, 30));
    setBrowserTaskStatus(`Queued browser task: ${cleanGoal}`);
    setScreen("Browser Tasks");
  }

  async function runBrowserTask(task) {
    if (!task?.url || !task?.goal) return;

    setBrowserTasks((prev) => prev.map((x) => x.id === task.id ? { ...x, status: "running", result: "Running Browser Ops task..." } : x));
    setBrowserTaskStatus(`Running browser task: ${task.goal}`);

    try {
      const res = await fetch("/api/browser/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: task.url,
          goal: task.goal,
          confirmed: true,
        }),
      });

      const data = await res.json().catch(() => ({}));
      const text = data.result || data.gate || data.error || "No browser task result text.";
      const nextStatus = data.ok ? (data.status || "done") : "blocked";

      setBrowserTasks((prev) => prev.map((x) => x.id === task.id ? {
        ...x,
        status: nextStatus,
        result: text,
        screenshotPath: data.screenshotPath || "",
        completed: new Date().toLocaleTimeString(),
      } : x));

      setBrowserTaskStatus(data.ok ? "Browser task completed." : `Browser task blocked: ${text}`);
      log(data.ok ? "BotBoi" : "KindKnife", data.ok ? "completed" : "blocker", `Browser task: ${task.goal} - ${text}`);

      if (typeof refreshBrowserRuns === "function") refreshBrowserRuns();
      if (typeof refreshBrowserHealth === "function") refreshBrowserHealth();
    } catch (err) {
      const text = err?.message || "Unknown browser task error.";
      setBrowserTasks((prev) => prev.map((x) => x.id === task.id ? { ...x, status: "blocked", result: text, completed: new Date().toLocaleTimeString() } : x));
      setBrowserTaskStatus(`Browser task failed: ${text}`);
      log("PatchByte", "blocker", `Browser task failed: ${text}`);
    }
  }

  function clearBrowserTask(id) {
    setBrowserTasks((prev) => prev.filter((x) => x.id !== id));
    setBrowserTaskStatus("Browser task removed.");
  }

  async function refreshBrowserRuns() {
    try {
      const res = await fetch("/api/browser/runs");
      const data = await res.json();
      if (!res.ok || data?.ok === false) throw new Error(data?.error || "Could not load browser runs.");
      setBrowserRuns(data.runs || []);
      setBrowserRunsStatus(`Loaded ${data.count || 0} browser run screenshot(s).`);
      return data;
    } catch (err) {
      const message = err?.message || "Browser runs refresh failed.";
      setBrowserRunsStatus(message);
      return null;
    }
  }

  function log(agent, type, text) { setLogs((prev) => [{ agent, type, text, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 40)); }
  function recordRunHistory(entry) {
    const item = {
      id: entry.id || Date.now(),
      agent: entry.agent || "Unknown",
      quest: entry.quest || "Untitled quest",
      mode: entry.mode || backendMode || "unknown",
      status: entry.status || "unknown",
      result: entry.result || "",
      timestamp: entry.timestamp || new Date().toISOString(),
    };
    setRunHistory((prev) => [item, ...prev].slice(0, 100));
  }
  async function refreshBackendHealth() {
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Health check failed: ${res.status}`);
      setBackendMode(data?.mode || "unknown");
      setBackendHealth({
        ok: Boolean(data?.ok),
        service: data?.service || "Project Calyx API",
        mode: data?.mode || "unknown",
        model: data?.model || "n/a",
        openAiConfigured: Boolean(data?.openAiConfigured),
        timestamp: data?.timestamp || new Date().toISOString(),
        lastError: "",
      });
      return data;
    } catch (err) {
      const message = err?.message || "Backend health check failed.";
      setBackendMode("offline");
      setBackendHealth({
        ok: false,
        service: "Project Calyx API",
        mode: "offline",
        model: "n/a",
        openAiConfigured: false,
        timestamp: new Date().toISOString(),
        lastError: message,
      });
      return null;
    }
  }
  function updateQuest(id, patch) { setQuests((prev) => prev.map((q) => q.id === id ? { ...q, ...patch } : q)); }
  function addCreditEntry() {
    const amount = Number(String(creditAmount).replace(/[^0-9.-]/g, ""));
    if (!Number.isFinite(amount) || amount === 0) return;
    const entry = {
      id: Date.now(),
      source: creditSource.trim() || "Unknown",
      amount,
      status: "available",
      note: creditNote.trim() || "CAD credits entry. Not earned income.",
      time: new Date().toISOString().slice(0, 10),
    };
    setCreditEvents((prev) => [entry, ...prev]);
    setCreditAmount("");
    setCreditNote("");
    setDaily(`Credits logged: CAD $${amount.toFixed(2)} available from ${entry.source}. Not counted as earned income.`);
    log("BossCat", "decision", `Credits logged, not income: CAD $${amount.toFixed(2)} from ${entry.source}.`);
  }

  function removeCreditEntry(id) {
    const entry = creditEvents.find((x) => x.id === id);
    setCreditEvents((prev) => prev.filter((x) => x.id !== id));
    if (entry) {
      setDaily(`Credits entry removed: CAD $${Number(entry.amount).toFixed(2)} from ${entry.source}.`);
      log("BossCat", "decision", `Removed credits entry: ${entry.source} CAD $${Number(entry.amount).toFixed(2)}.`);
    }
  }

  
    function setToolStatus(toolId, status) {
    const tool = tools.find((t) => t.id === toolId);
    setTools((prev) => prev.map((x) => x.id === toolId ? { ...x, status } : x));

    if (status !== "Ready") return;

    const affected = quests.filter((q) =>
      q.status === "blocked" &&
      !q.manualBlocked &&
      requiredToolIdsForQuest(q).includes(toolId)
    );

    if (!affected.length) return;

    setQuests((prev) => prev.map((q) =>
      affected.some((a) => a.id === q.id) ? { ...q, status: "queued", blocker: "", manualBlocked: false } : q
    ));

    const names = affected.map((q) => q.title).join(", ");
    setDaily(`${tool?.name || toolId} marked Ready. Auto-unblocked dependent quest(s): ${names}.`);
    log("PatchByte", "completed", `${tool?.name || toolId} Ready. Auto-unblocked: ${names}.`);
  }
  function findQuestByTitle(title) {
    return quests.find((q) => q.title === title);
  }

  function findAgentByNameOrQuest(agentName, quest) {
    return AGENTS.find((a) => a.name === agentName) || AGENTS.find((a) => a.id === quest?.agent) || activeAgent;
  }

  function applyReviewResult() {
    const item = latestExecutionReview;
    if (!item) return;

    const q = findQuestByTitle(item.quest);
    if (!q) {
      setDaily(`Execution Review: could not find quest for ${item.quest}.`);
      return;
    }

    const agent = findAgentByNameOrQuest(item.agent, q);
    const next = quests.find((x) => x.id !== q.id && x.status === "queued");

    updateQuest(q.id, { status: "done" });
    setAiRequests((prev) => prev.map((r) => r.id === item.id ? { ...r, status: "Applied" } : r));
    log(agent.name, "completed", `Review applied result for ${q.title}.${reviewNote ? " Note: " + reviewNote : ""}`);

    if (typeof recordRunHistory === "function") {
      recordRunHistory({
        id: Date.now(),
        agent: agent.name,
        quest: q.title,
        mode: item.mode || backendMode || "unknown",
        status: "done",
        result: `Review applied.\n\n${item.result || ""}${reviewNote ? "\n\nReview note: " + reviewNote : ""}`,
        timestamp: new Date().toISOString(),
      });
    }

    if (next) {
      setSelectedQuestId(next.id);
      setSelectedAgentId(next.agent);
      setDaily(`Execution Review applied ${q.title}. Promoted next queued quest: ${next.title}.`);
    } else {
      setSelectedQuestId(q.id);
      setSelectedAgentId(agent.id);
      setDaily(`Execution Review applied ${q.title}. No queued quest remains.`);
    }

    setReviewNote("");
    setScreen("Command");
  }

  async function rerunReviewResult() {
    const item = latestExecutionReview;
    if (!item) return;

    const q = findQuestByTitle(item.quest) || selectedQuest;
    const agent = findAgentByNameOrQuest(item.agent, q);
    const reviewPacket = buildPacket(q, agent, tools);
    const reviewPrompt = item.prompt || promptFor(reviewPacket, q, agent);
    const reviewGate = reviewPacket.status === "blocked" ? reviewPacket.gate : null;

    setSelectedQuestId(q.id);
    setSelectedAgentId(agent.id);
    setScreen("Review");

    const baseReq = {
      id: Date.now(),
      agent: agent.name,
      quest: q.title,
      packet: reviewPacket.name,
      prompt: reviewPrompt,
      status: reviewGate ? "Blocked" : "Running",
      gate: reviewGate || "None",
      created: new Date().toLocaleTimeString(),
      result: "",
      mode: backendMode || "unknown",
    };

    setAiRequests((prev) => [baseReq, ...prev].slice(0, 30));

    if (reviewGate) {
      setDaily(`Execution Review re-run blocked: ${reviewGate}`);
      log("KindKnife", "blocker", reviewGate);
      return;
    }

    setDaily(`Execution Review re-running ${agent.name} -> ${q.title}.`);

    try {
      const res = await fetch("/api/run-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent: agent.name,
          quest: q.title,
          packet: reviewPacket.name,
          prompt: reviewPrompt,
        }),
      });

      const data = await res.json().catch(() => ({}));
      const mode = data?.mode || backendMode || "unknown";
      const result = data?.result || data?.message || data?.error || "Backend returned no result text.";

      if (!res.ok || data?.ok === false) {
        setAiRequests((prev) => prev.map((r) => r.id === baseReq.id ? { ...r, status: "Blocked", gate: result, result, mode, model: data?.model || null } : r));
        setQueueResults((prev) => ({ ...prev, [baseReq.id]: { text: result, status: "blocked" } }));
        setDaily(`Execution Review re-run blocked: ${result}`);
        log("PatchByte", "blocker", result);
        if (typeof recordRunHistory === "function") {
          recordRunHistory({ id: baseReq.id, agent: agent.name, quest: q.title, mode, status: "blocked", result, timestamp: data?.timestamp || new Date().toISOString() });
        }
        return;
      }

      setBackendMode(mode);
      setAiRequests((prev) => prev.map((r) => r.id === baseReq.id ? { ...r, status: "Ready", gate: "None", result, mode, model: data?.model || null } : r));
      setQueueResults((prev) => ({ ...prev, [baseReq.id]: { text: result, status: data?.status || "done" } }));
      setDaily(`Execution Review re-run ready: ${agent.name} -> ${q.title}.`);
      log(agent.name, "completed", result);
      if (typeof recordRunHistory === "function") {
        recordRunHistory({ id: baseReq.id, agent: agent.name, quest: q.title, mode, status: data?.status || "done", result, timestamp: data?.timestamp || new Date().toISOString() });
      }
    } catch (err) {
      const result = err?.message || "Unknown backend error.";
      setAiRequests((prev) => prev.map((r) => r.id === baseReq.id ? { ...r, status: "Blocked", gate: result, result, mode: backendMode || "unknown" } : r));
      setQueueResults((prev) => ({ ...prev, [baseReq.id]: { text: result, status: "blocked" } }));
      setDaily(`Execution Review re-run backend error: ${result}`);
      log("PatchByte", "blocker", `Review re-run backend error: ${result}`);
      if (typeof recordRunHistory === "function") {
        recordRunHistory({ id: baseReq.id, agent: agent.name, quest: q.title, mode: backendMode || "unknown", status: "blocked", result, timestamp: new Date().toISOString() });
      }
    }
  }

  function markReviewBlocked() {
    const item = latestExecutionReview;
    if (!item) return;

    const q = findQuestByTitle(item.quest);
    const agent = findAgentByNameOrQuest(item.agent, q);

    if (q) {
      updateQuest(q.id, { status: "blocked" });
      setSelectedQuestId(q.id);
      setSelectedAgentId(agent.id);
    }

    setAiRequests((prev) => prev.map((r) => r.id === item.id ? { ...r, status: "Blocked", gate: reviewNote || "Marked blocked in Execution Review." } : r));
    log(agent.name, "blocker", reviewNote || `Marked ${item.quest} blocked from Execution Review.`);
    setDaily(`Execution Review marked blocked: ${item.quest}.`);
    setReviewNote("");
    setScreen("Command");
  }

  function promoteNextQuestFromReview() {
    const item = latestExecutionReview;
    const current = item ? findQuestByTitle(item.quest) : selectedQuest;
    const next = quests.find((q) => q.id !== current?.id && q.status === "queued");

    if (!next) {
      setDaily("Execution Review: no queued quest available to promote.");
      return;
    }

    if (current && current.status === "active") updateQuest(current.id, { status: "queued" });
    updateQuest(next.id, { status: "active" });
    setSelectedQuestId(next.id);
    setSelectedAgentId(next.agent);
    log("BossCat", "decision", `Execution Review promoted next quest: ${next.title}.`);
    setDaily(`Execution Review promoted next quest: ${next.title}.`);
    setScreen("Command");
  }

  function autoApplyBackendResult({ questTitle, agentName, status, result }) {
    if (!autoApplySafe || status !== "done") return false;

    const completedQuest = quests.find((q) => q.title === questTitle);
    if (!completedQuest) return false;

    const nextQuest = quests.find((q) => q.id !== completedQuest.id && q.status === "queued");

    updateQuest(completedQuest.id, { status: "done" });
    log(agentName || "BossCat", "completed", `Auto-applied safe backend result for ${questTitle}.`);

    if (nextQuest) {
      setSelectedQuestId(nextQuest.id);
      setSelectedAgentId(nextQuest.agent);
      setDaily(`${agentName || "Agent"} completed ${questTitle}. Auto-applied result and moved to next queued quest: ${nextQuest.title}.`);
    } else {
      setSelectedQuestId(completedQuest.id);
      setDaily(`${agentName || "Agent"} completed ${questTitle}. Auto-applied result. No queued quest found.`);
    }

    return true;
  }
  function dailyRun() { const blocked = tools.filter((t) => t.status === "Blocked").length; const msg = liveGate ? `Blocked: ${liveGate}` : `AI-owned: ${packet.next}`; setDaily(`BossCat: ${selectedQuest.title}. PatchByte: ${blocked} blocked system(s). PlainJane: ${msg}`); log("BossCat", "decision", `Selected ${selectedQuest.title}.`); log("PlainJane", "next", msg); }
  function autoPickQuest() {
    const packetFor = (q) => buildPacket(q, AGENTS.find((a) => a.id === q.agent) || AGENTS[0], tools);
    const pick = quests.find((q) => q.status === "active" && packetFor(q).status !== "blocked") || quests.find((q) => q.status === "queued" && q.rank === "MAIN") || quests.find((q) => q.status === "queued" && q.rank === "SYSTEM") || quests.find((q) => q.status === "queued");
    if (!pick) { setDaily("BossCat Auto-Pick: no available quest."); log("BossCat", "decision", "Auto-Pick found no available quest."); return; }
    const agent = AGENTS.find((a) => a.id === pick.agent) || AGENTS[0];
    const pickedPacket = packetFor(pick);
    setSelectedQuestId(pick.id);
    setSelectedAgentId(agent.id);
    setScreen("Command");
    setDaily(`BossCat Auto-Pick selected ${pick.title}. Next action: ${pickedPacket.next}`);
    log("BossCat", "decision", `Auto-Pick selected ${pick.title} for ${agent.name}.`);
  }
  function pickNextSafeQuest() {
    const packetFor = (q) => buildPacket(q, AGENTS.find((a) => a.id === q.agent) || AGENTS[0], tools);
    return quests.find((q) => q.status === "active" && packetFor(q).status !== "blocked")
      || quests.find((q) => q.status === "queued" && q.rank === "MAIN")
      || quests.find((q) => q.status === "queued" && q.rank === "SYSTEM")
      || quests.find((q) => q.status === "queued")
      || null;
  }

  async function runNextSafeStep() {
    const pick = pickNextSafeQuest();

    if (!pick) {
      const message = "BossCat Loop: no available quest.";
      setLoopStatus(message);
      setDaily(message);
      log("BossCat", "decision", message);
      setScreen("Loop");
      return;
    }

    const agent = AGENTS.find((a) => a.id === pick.agent) || AGENTS[0];
    const pickedPacket = buildPacket(pick, agent, tools);
    const pickedPrompt = promptFor(pickedPacket, pick, agent);
    const pickedGate = pickedPacket.status === "blocked" ? pickedPacket.gate : null;

    setSelectedQuestId(pick.id);
    setSelectedAgentId(agent.id);
    setScreen("Loop");

    const baseReq = {
      id: Date.now(),
      agent: agent.name,
      quest: pick.title,
      packet: pickedPacket.name,
      prompt: pickedPrompt,
      status: pickedGate ? "Blocked" : "Running",
      gate: pickedGate || "None",
      created: new Date().toLocaleTimeString(),
      result: "",
      mode: backendMode || "unknown",
    };

    setAiRequests((prev) => [baseReq, ...prev].slice(0, 30));

    if (pickedGate) {
      const message = `BossCat Loop blocked by human gate: ${pickedGate}`;
      setLoopStatus(message);
      setDaily(message);
      log("KindKnife", "blocker", pickedGate);
      if (typeof recordRunHistory === "function") {
        recordRunHistory({
          id: baseReq.id,
          agent: agent.name,
          quest: pick.title,
          mode: backendMode || "unknown",
          status: "blocked",
          result: pickedGate,
          timestamp: new Date().toISOString(),
        });
      }
      return;
    }

    setLoopStatus(`Running one safe step: ${agent.name} -> ${pick.title}.`);
    setDaily(`BossCat Loop running one safe step: ${agent.name} -> ${pick.title}.`);
    log("BossCat", "decision", `Loop selected ${pick.title} for ${agent.name}.`);

    try {
      const res = await fetch("/api/run-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent: agent.name,
          quest: pick.title,
          packet: pickedPacket.name,
          prompt: pickedPrompt,
        }),
      });

      const data = await res.json().catch(() => ({}));
      const mode = data?.mode || backendMode || "unknown";
      const result = data?.result || data?.message || data?.error || "Backend returned no result text.";

      if (!res.ok || data?.ok === false) {
        setAiRequests((prev) => prev.map((r) => r.id === baseReq.id ? { ...r, status: "Blocked", gate: result, result, mode, model: data?.model || null } : r));
        setQueueResults((prev) => ({ ...prev, [baseReq.id]: { text: result, status: "blocked" } }));
        setLoopStatus(`Blocked: ${result}`);
        setDaily(`BossCat Loop blocked: ${result}`);
        log("PatchByte", "blocker", result);
        if (typeof recordRunHistory === "function") {
          recordRunHistory({
            id: baseReq.id,
            agent: agent.name,
            quest: pick.title,
            mode,
            status: "blocked",
            result,
            timestamp: data?.timestamp || new Date().toISOString(),
          });
        }
        return;
      }

      setBackendMode(mode);
      setAiRequests((prev) => prev.map((r) => r.id === baseReq.id ? { ...r, status: "Ready", gate: "None", result, mode, model: data?.model || null } : r));
      setQueueResults((prev) => ({ ...prev, [baseReq.id]: { text: result, status: data?.status || "done" } }));
      const didAutoApply = autoApplyBackendResult({
        questTitle: selectedQuest?.title || pick?.title,
        agentName: activeAgent?.name || agent?.name,
        status: data?.status || "done",
        result,
      });
      setLoopStatus(`Result ready: ${agent.name} completed one backend step for ${pick.title}.`);
      setDaily(`BossCat Loop result ready: ${agent.name} -> ${pick.title}.`);
      log(agent.name, "completed", result);
      if (typeof recordRunHistory === "function") {
        recordRunHistory({
          id: baseReq.id,
          agent: agent.name,
          quest: pick.title,
          mode,
          status: data?.status || "done",
          result,
          timestamp: data?.timestamp || new Date().toISOString(),
        });
      }
    } catch (err) {
      const result = err?.message || "Unknown backend error.";
      setAiRequests((prev) => prev.map((r) => r.id === baseReq.id ? { ...r, status: "Blocked", gate: result, result, mode: backendMode || "unknown" } : r));
      setQueueResults((prev) => ({ ...prev, [baseReq.id]: { text: result, status: "blocked" } }));
      setLoopStatus(`Backend error: ${result}`);
      setDaily(`BossCat Loop backend error: ${result}`);
      log("PatchByte", "blocker", `Loop backend error: ${result}`);
      if (typeof recordRunHistory === "function") {
        recordRunHistory({
          id: baseReq.id,
          agent: agent.name,
          quest: pick.title,
          mode: backendMode || "unknown",
          status: "blocked",
          result,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  function addQuest() { if (!newQuest.trim()) return; const q = { id: Date.now(), title: newQuest.trim(), agent: "research", rank: "MAIN", status: "queued", payout: "TBD", ai: "AI defines non-gated work.", success: "Clear output exists." }; setQuests((p) => [q, ...p]); setSelectedQuestId(q.id); setSelectedAgentId(q.agent); setNewQuest(""); }
  function runAgentAction(agent, name, desc) { const q = { id: Date.now(), title: name, agent: agent.id, rank: agent.id === "tech" ? "SYSTEM" : "MAIN", status: "active", payout: "TBD", ai: desc, success: `${name} produces a usable result.` }; setQuests((prev) => [q, ...prev.map((x) => x.agent === agent.id && x.status === "active" ? { ...x, status: "queued" } : x)]); setSelectedQuestId(q.id); setSelectedAgentId(agent.id); setScreen("Command"); setDaily(`${agent.name} action selected: ${name}.`); log(agent.name, "next", `${name}: ${desc}`); }
  async function requestAiExecution() {
    const baseReq = {
      id: Date.now(),
      agent: activeAgent.name,
      quest: selectedQuest.title,
      packet: packet.name,
      prompt: promptText,
      status: liveGate ? "Blocked" : "Running",
      gate: liveGate || "None",
      created: new Date().toLocaleTimeString(),
      result: "",
      mode: backendMode,
    };
    setScreen("AI Queue");
    setAiRequests((prev) => [baseReq, ...prev].slice(0, 20));

    if (liveGate) {
      setDaily(`AI request blocked by human gate: ${liveGate}`);
      log("KindKnife", "blocker", liveGate);
      return;
    }

    setDaily(`${activeAgent.name} request sent to local backend. Mode: ${backendMode}.`);
    try {
      const res = await fetch("/api/run-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent: activeAgent.name, quest: selectedQuest.title, packet: packet.name, prompt: promptText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `API error ${res.status}`);
      const result = data.result || data.message || "Backend placeholder returned no result text.";
      setAiRequests((prev) => prev.map((r) => r.id === baseReq.id ? { ...r, status: "Ready", result, gate: "None", mode: data.mode || backendMode, model: data.model || null } : r));
      setQueueResults((prev) => ({ ...prev, [baseReq.id]: { text: result, status: data.status || "done" } }));
      const didAutoApply = autoApplyBackendResult({
        questTitle: selectedQuest?.title || pick?.title,
        agentName: activeAgent?.name || agent?.name,
        status: data?.status || "done",
        result,
      });
      setBackendMode(data.mode || backendMode);
      setDaily(`${activeAgent.name} backend response received in ${data.mode || backendMode} mode. Review AI Queue and Apply Result.`);
      log(activeAgent.name, "completed", result);
      recordRunHistory({
        id: baseReq.id,
        agent: activeAgent.name,
        quest: selectedQuest.title,
        mode: data?.mode || backendMode || "unknown",
        status: data?.status || "done",
        result,
        timestamp: data?.timestamp || new Date().toISOString(),
      });
    } catch (err) {
      const error = err?.message || "Unknown backend error.";
      setAiRequests((prev) => prev.map((r) => r.id === baseReq.id ? { ...r, status: "Blocked", gate: error, result: error, mode: backendMode, model: data?.model || null } : r));
      setDaily(`AI backend request failed: ${error}`);
      log("PatchByte", "blocker", `Backend request failed: ${error}`);
      recordRunHistory({
        id: baseReq.id,
        agent: activeAgent.name,
        quest: selectedQuest.title,
        mode: backendMode || "unknown",
        status: "blocked",
        result: error,
        timestamp: new Date().toISOString(),
      });
    }
  }
  async function runAutopilot() {
    const baseReq = {
      id: Date.now(),
      agent: activeAgent.name,
      quest: selectedQuest.title,
      packet: packet.name,
      prompt: promptText,
      status: liveGate ? "Blocked" : "Running",
      gate: liveGate || "None",
      created: new Date().toLocaleTimeString(),
      result: "",
      mode: backendMode || "unknown",
    };

    setScreen("Autopilot");
    setAiRequests((prev) => [baseReq, ...prev].slice(0, 30));

    if (liveGate) {
      const message = `Autopilot blocked by human gate: ${liveGate}`;
      setAutopilotStatus(message);
      setDaily(message);
      log("KindKnife", "blocker", liveGate);
      if (typeof recordRunHistory === "function") {
        recordRunHistory({
          id: baseReq.id,
          agent: activeAgent.name,
          quest: selectedQuest.title,
          mode: backendMode || "unknown",
          status: "blocked",
          result: liveGate,
          timestamp: new Date().toISOString(),
        });
      }
      return;
    }

    setAutopilotStatus(`Running ${activeAgent.name} on ${selectedQuest.title} through backend...`);
    setDaily(`Autopilot running: ${activeAgent.name} -> ${selectedQuest.title}.`);

    try {
      const res = await fetch("/api/run-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent: activeAgent.name,
          quest: selectedQuest.title,
          packet: packet.name,
          prompt: promptText,
        }),
      });

      const data = await res.json().catch(() => ({}));
      const mode = data?.mode || backendMode || "unknown";
      const result = data?.result || data?.message || data?.error || "Backend returned no result text.";

      if (!res.ok || data?.ok === false) {
        setAiRequests((prev) => prev.map((r) => r.id === baseReq.id ? { ...r, status: "Blocked", gate: result, result, mode, model: data?.model || null } : r));
        setQueueResults((prev) => ({ ...prev, [baseReq.id]: { text: result, status: "blocked" } }));
        setAutopilotStatus(`Blocked: ${result}`);
        setDaily(`Autopilot blocked: ${result}`);
        log("PatchByte", "blocker", result);
        if (typeof recordRunHistory === "function") {
          recordRunHistory({
            id: baseReq.id,
            agent: activeAgent.name,
            quest: selectedQuest.title,
            mode,
            status: "blocked",
            result,
            timestamp: data?.timestamp || new Date().toISOString(),
          });
        }
        return;
      }

      setBackendMode(mode);
      setAiRequests((prev) => prev.map((r) => r.id === baseReq.id ? { ...r, status: "Ready", gate: "None", result, mode, model: data?.model || null } : r));
      setQueueResults((prev) => ({ ...prev, [baseReq.id]: { text: result, status: data?.status || "done" } }));
      const didAutoApply = autoApplyBackendResult({
        questTitle: selectedQuest?.title || pick?.title,
        agentName: activeAgent?.name || agent?.name,
        status: data?.status || "done",
        result,
      });
      setAutopilotStatus(`Result ready from ${activeAgent.name}. Review or apply from AI Queue.`);
      setDaily(`Autopilot result ready: ${activeAgent.name} completed backend run for ${selectedQuest.title}.`);
      log(activeAgent.name, "completed", result);
      if (typeof recordRunHistory === "function") {
        recordRunHistory({
          id: baseReq.id,
          agent: activeAgent.name,
          quest: selectedQuest.title,
          mode,
          status: data?.status || "done",
          result,
          timestamp: data?.timestamp || new Date().toISOString(),
        });
      }
    } catch (err) {
      const result = err?.message || "Unknown backend error.";
      setAiRequests((prev) => prev.map((r) => r.id === baseReq.id ? { ...r, status: "Blocked", gate: result, result, mode: backendMode || "unknown" } : r));
      setQueueResults((prev) => ({ ...prev, [baseReq.id]: { text: result, status: "blocked" } }));
      setAutopilotStatus(`Backend error: ${result}`);
      setDaily(`Autopilot backend error: ${result}`);
      log("PatchByte", "blocker", `Autopilot backend error: ${result}`);
      if (typeof recordRunHistory === "function") {
        recordRunHistory({
          id: baseReq.id,
          agent: activeAgent.name,
          quest: selectedQuest.title,
          mode: backendMode || "unknown",
          status: "blocked",
          result,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  function resolveGate() { if (!liveGate) return; if (liveGate.includes("Platform Dashboards")) { setTools((prev) => prev.map((t) => t.id === "platforms" ? { ...t, status: "Ready", note: "Gate resolved. AI can continue." } : t)); let updated = false; setAiRequests((prev) => prev.map((r) => { if (!updated && r.quest === selectedQuest.title && r.status === "Blocked" && r.gate.includes("Platform Dashboards")) { updated = true; return { ...r, status: "Ready", gate: "None", created: new Date().toLocaleTimeString() }; } return r; })); setDaily(updated ? "Platform Dashboards gate resolved. Latest blocked AI request is now ready." : "Platform Dashboards gate resolved. AI can continue."); log("PatchByte", "completed", updated ? "Platform Dashboards resolved and latest blocked AI Queue request converted to Ready." : "Platform Dashboards marked Ready from Mission Control gate resolver."); } }
  function reopenQuest() { if (selectedQuest.status !== "done") return; updateQuest(selectedQuest.id, { status: "active" }); setDaily(`${selectedQuest.title} reopened. AI can continue from this quest.`); log("BossCat", "decision", `${selectedQuest.title} reopened and set back to active.`); }
  function applyExecutionResult() { const text = executionResult.trim(); if (!text) return; const next = quests.find((q) => q.id !== selectedQuest.id && q.status === "queued"); updateQuest(selectedQuest.id, { status: executionStatus }); log(activeAgent.name, executionStatus === "blocked" ? "blocker" : "completed", text); if (executionStatus === "done" && next) { setSelectedQuestId(next.id); setSelectedAgentId(next.agent); setDaily(`${activeAgent.name} completed ${selectedQuest.title}. Moved to next queued quest: ${next.title}.`); } else { setDaily(`${activeAgent.name} applied result to ${selectedQuest.title}. Quest status: ${executionStatus}.`); } setExecutionResult(""); setScreen("Log"); }
  function applyQueueResult(r) { const item = queueResults[r.id] || { text: "", status: "done" }; const text = (item.text || "").trim(); if (!text) return; const q = quests.find((x) => x.title === r.quest); if (!q) return; const agent = AGENTS.find((a) => a.name === r.agent) || activeAgent; const next = quests.find((x) => x.id !== q.id && x.status === "queued"); updateQuest(q.id, { status: item.status }); log(r.agent, item.status === "blocked" ? "blocker" : "completed", text); setAiRequests((prev) => prev.map((x) => x.id === r.id ? { ...x, status: "Applied" } : x)); setQueueResults((prev) => ({ ...prev, [r.id]: { text: "", status: item.status } })); if (item.status === "done" && next) { setSelectedQuestId(next.id); setSelectedAgentId(next.agent); setDaily(`${r.agent} completed ${r.quest}. Moved to next queued quest: ${next.title}.`); } else { setSelectedQuestId(q.id); setSelectedAgentId(agent.id); setDaily(`${r.agent} applied AI Queue result to ${r.quest}. Quest status: ${item.status}.`); } setScreen("Log"); }
  function save() { const text = JSON.stringify({ quests, tools, logs, selectedQuestId, selectedAgentId, daily, aiRequests, runHistory, autopilotStatus, loopStatus, autoApplySafe, reviewNote, creditEvents, patchNotes }, null, 2); localStorage.setItem("projectCalyx", text); setSavedJson(text); }
  function load(text = localStorage.getItem("projectCalyx") || localStorage.getItem("projectCalyx")) { if (!text) return; const data = JSON.parse(text); setQuests(data.quests || QUESTS); setTools(data.tools || TOOLS); setLogs(data.logs || []); setAiRequests(data.aiRequests || []);
    setCreditEvents(data.creditEvents || CREDIT_EVENTS);
    setRunHistory(data.runHistory || []);
    setAutopilotStatus(data.autopilotStatus || "Idle. Select a quest and click Run Autopilot.");
    setLoopStatus(data.loopStatus || "Idle. Run one safe step when ready.");
    setAutoApplySafe(data.autoApplySafe ?? true);
    setReviewNote(data.reviewNote || ""); setSelectedQuestId(data.selectedQuestId || 1); setSelectedAgentId(data.selectedAgentId || null); setDaily(data.daily || "Loaded."); }

  function staffProfileFor(agent) {
    return STAFF_PROFILES[agent.id] || {
      title: agent.role,
      department: "General",
      seniority: "Operator",
      floor: "Unassigned",
      happiness: 60,
      stress: 40,
      likes: ["clear work"],
      dislikes: ["blocked tasks"],
      needs: ["next safe step"],
      empathy: "Helps the team move safely.",
      communicatesWith: ["boss"],
    };
  }

  function moraleColor(value) {
    return value >= 75 ? "#37ff8b" : value >= 55 ? "#f7d154" : "#ff5c7a";
  }

  function agentActiveQuest(agent) {
    return quests.find((q) => q.agent === agent.id && q.status === "active") || null;
  }

  // chatAutoTalk periodic room discussion
  useEffect(() => {
    if (!chatAutoTalk || screen !== "Chatroom") return undefined;
    const timer = window.setInterval(() => {
      letRoomTalk();
    }, 30000);
    return () => window.clearInterval(timer);
  }, [chatAutoTalk, screen, chatMessages.length]);

  function chatAgentReply(agent, messageText = "", target = "room") {
    const profile = typeof staffProfileFor === "function" ? staffProfileFor(agent) : null;
    const lower = String(messageText || "").toLowerCase();
    const need = profile?.needs?.[0] || "clear next step";
    const like = profile?.likes?.[0] || "good work";
    const dislike = profile?.dislikes?.[0] || "avoidable friction";
    const collaborators = profile?.communicatesWith || [];

    if (lower.includes("confus") || lower.includes("overwhelm") || lower.includes("too fast")) {
      if (agent.id === "liaison") return "I hear confusion. I recommend one step, one visible success check, then stop.";
      if (agent.id === "boss") return "I will slow the room down and force one clear next action.";
      if (agent.id === "tech") return "I recommend smaller blast radius and rollback-first patches.";
    }

    if (lower.includes("money") || lower.includes("income") || lower.includes("credit")) {
      if (agent.id === "research") return "I can rank higher-ROI opportunities and reject weak ideas before anyone builds.";
      if (agent.id === "boss") return "Money-first priority: pick one action that can turn Credits (CAD) into a measurable opportunity.";
      if (agent.id === "trading") return "I will keep this paper-only and protect capital from live-risk decisions.";
    }

    if (lower.includes("sprite") || lower.includes("theme") || lower.includes("art")) {
      if (agent.id === "product") return "We need a future Sprite Director role with theme rules, asset specs, and quality checks.";
      if (agent.id === "tech") return "I can track asset filenames, cropping issues, and sprite-sheet requirements.";
    }

    if (lower.includes("fire") || lower.includes("hire") || lower.includes("performance")) {
      if (agent.id === "hr") return "No one is immune. Review should consider results, safety, morale, and repeated harm.";
      if (agent.id === "boss") return "Leadership also needs measurable value. If I create chaos, Council can review me.";
    }

    if (target !== "room") return `My current need is ${need}. I do better when I get ${like}, and worse when I face ${dislike}.`;

    return `I think this affects ${collaborators.length ? collaborators.map((id) => AGENTS.find((a) => a.id === id)?.name || id).join(", ") : "the team"}. My useful contribution: ${profile?.empathy || "help the team move safely"}`;
  }

  function normalizeChatTargetId(target) {
    if (!target || target === "room" || target === "Everyone") return "room";
    const direct = AGENTS.find((a) => a.id === target || a.name === target);
    if (direct) return direct.id;
    return target;
  }

  function recordAgentComm(message) {
    if (!message || !message.fromId || message.fromId === "justin") return;

    const from = AGENTS.find((a) => a.id === message.fromId);
    if (!from) return;

    const toId = normalizeChatTargetId(message.to);
    const toAgent = AGENTS.find((a) => a.id === toId || a.name === message.to);

    const event = {
      id: Date.now() + Math.random(),
      fromId: from.id,
      fromName: from.name,
      toId: toAgent?.id || toId,
      toName: toAgent?.name || (toId === "room" ? "Room" : String(message.to || "Room")),
      text: String(message.text || "").slice(0, 160),
      time: new Date().toLocaleTimeString(),
    };

    setAgentComms((prev) => [event, ...prev].slice(0, 40));
  }

  function commCountFor(agentId) {
    return agentComms.filter((event) => event.fromId === agentId || event.toId === agentId || event.toId === "room").length;
  }

  function recentCommFor(agentId) {
    return agentComms.find((event) => event.fromId === agentId || event.toId === agentId || event.toId === "room");
  }

  function appendChatMessage(message) {
    const enriched = { id: Date.now() + Math.random(), time: new Date().toLocaleTimeString(), ...message };
    setChatMessages((prev) => [enriched, ...prev].slice(0, 80));
    recordAgentComm(enriched);
  }

  function handleChatCommand(text) {
    const raw = String(text || "").trim();
    const lower = raw.toLowerCase();

    if (lower === "/help" || lower === "help") {
      appendChatMessage({
        from: "PlainJane",
        fromId: "liaison",
        to: "Justin",
        text: "Chat commands: /quest <title>, /assign <agent> <job>, /council <text>, /help. You can also talk normally to everyone or a selected agent.",
        type: "agent",
      });
      setChatCommandStatus("Help shown.");
      return true;
    }

    if (lower.startsWith("/quest ")) {
      const title = raw.slice(7).trim();
      if (!title) return false;
      const q = {
        id: Date.now(),
        title,
        agent: chatTarget !== "room" ? chatTarget : "research",
        rank: "MAIN",
        status: "queued",
        payout: "TBD",
        ai: "Created from Chatroom command.",
        success: "Clear output exists.",
      };
      setQuests((prev) => [q, ...prev]);
      setSelectedQuestId(q.id);
      setSelectedAgentId(q.agent);
      appendChatMessage({
        from: "BossCat",
        fromId: "boss",
        to: "Justin",
        text: `Quest created from Chatroom: ${title}`,
        type: "agent",
      });
      setDaily(`Chatroom created quest: ${title}`);
      setChatCommandStatus(`Created quest: ${title}`);
      return true;
    }

    if (lower.startsWith("/assign ")) {
      const rest = raw.slice(8).trim();
      const agent = AGENTS.find((a) => rest.toLowerCase().startsWith(a.name.toLowerCase()) || rest.toLowerCase().startsWith(a.id.toLowerCase()));
      if (!agent) {
        appendChatMessage({
          from: "PlainJane",
          fromId: "liaison",
          to: "Justin",
          text: "I could not identify the agent. Try /assign PatchByte fix the browser task button.",
          type: "agent",
        });
        setChatCommandStatus("Assign command needs a known agent.");
        return true;
      }

      const job = rest.replace(new RegExp(`^(${agent.name}|${agent.id})`, "i"), "").trim() || "New assigned work";
      const q = {
        id: Date.now(),
        title: job,
        agent: agent.id,
        rank: agent.id === "tech" ? "SYSTEM" : "MAIN",
        status: "active",
        payout: "TBD",
        ai: "Assigned from Chatroom command.",
        success: `${job} produces a usable result.`,
      };
      setQuests((prev) => [q, ...prev.map((x) => x.agent === agent.id && x.status === "active" ? { ...x, status: "queued" } : x)]);
      setSelectedQuestId(q.id);
      setSelectedAgentId(agent.id);
      appendChatMessage({
        from: "BossCat",
        fromId: "boss",
        to: agent.name,
        text: `Assigned to ${agent.name}: ${job}`,
        type: "agent",
      });
      setDaily(`Chatroom assigned ${agent.name}: ${job}`);
      setChatCommandStatus(`Assigned ${agent.name}.`);
      return true;
    }

    if (lower.startsWith("/council ")) {
      const detail = raw.slice(9).trim();
      if (!detail) return false;
      if (typeof setCouncilItems === "function") {
        const item = {
          id: Date.now(),
          type: "suggestion",
          from: "liaison",
          about: "system",
          status: "open",
          severity: "medium",
          title: "Chatroom council item",
          detail,
          proposedFix: "Council should discuss this and decide one concrete next action.",
          created: new Date().toLocaleTimeString(),
          resolution: "",
        };
        setCouncilItems((prev) => [item, ...prev].slice(0, 50));
        appendChatMessage({
          from: "KindKnife",
          fromId: "hr",
          to: "Justin",
          text: `Council item created: ${detail}`,
          type: "agent",
        });
        setDaily("Chatroom sent item to Council.");
        setChatCommandStatus("Council item created.");
        return true;
      }
    }

    return false;
  }

  function submitChat() {
    const text = chatDraft.trim();
    if (!text) return;

    appendChatMessage({ from: "Justin", fromId: "justin", to: chatTarget, text, type: "human" });
    setChatDraft("");

    const wasCommand = handleChatCommand(text);
    if (wasCommand) return;

    const recipients = chatTarget === "room" ? AGENTS : AGENTS.filter((a) => a.id === chatTarget);
    const limitedRecipients = recipients.slice(0, chatTarget === "room" ? 4 : 1);

    limitedRecipients.forEach((agent, index) => {
      window.setTimeout(() => {
        appendChatMessage({
          from: agent.name,
          fromId: agent.id,
          to: chatTarget === "room" ? "room" : "Justin",
          text: chatAgentReply(agent, text, chatTarget),
          type: "agent",
        });
      }, 180 * index);
    });

    if (text.length > 20) {
      setChatLearnings((prev) => [{ id: Date.now(), text: `Room learned: Justin cares about "${text.slice(0, 90)}"`, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 20));
    }

    setChatCommandStatus(`Message sent to ${chatTarget === "room" ? "everyone" : AGENTS.find((a) => a.id === chatTarget)?.name || chatTarget}.`);
    setDaily(`Chatroom: Justin addressed ${chatTarget === "room" ? "everyone" : AGENTS.find((a) => a.id === chatTarget)?.name || chatTarget}.`);
  }

  function letRoomTalk() {
    const pairs = [
      ["boss", "liaison", "We need to reduce confusion before increasing autonomy."],
      ["tech", "automation", "If a workflow repeats twice, we should turn it into a safer button."],
      ["research", "product", "A researched opportunity is only useful if it becomes a buyer-facing offer."],
      ["hr", "trading", "Risk controls should exist before capital is exposed."],
      ["platform", "boss", "I need dashboard facts before I can safely move the platform quest."],
    ];

    const pick = pairs[Math.floor(Math.random() * pairs.length)];
    const from = AGENTS.find((a) => a.id === pick[0]) || AGENTS[0];
    const to = AGENTS.find((a) => a.id === pick[1]) || AGENTS[1];

    appendChatMessage({
      from: from.name,
      fromId: from.id,
      to: to.name,
      text: pick[2],
      type: "agent",
    });

    window.setTimeout(() => {
      appendChatMessage({
        from: to.name,
        fromId: to.id,
        to: from.name,
        text: chatAgentReply(to, pick[2], from.id),
        type: "agent",
      });
    }, 180);

    setChatLearnings((prev) => [{ id: Date.now(), text: `Interaction learned: ${from.name} and ${to.name} discussed ${pick[2]}`, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 20));
    setDaily(`Chatroom: ${from.name} started a discussion with ${to.name}.`);
  }

  function convertChatToCouncil(message) {
    const agent = AGENTS.find((a) => a.id === message.fromId) || selectedAgent;
    if (typeof submitCouncilItem === "function") {
      submitCouncilItem(agent, "suggestion");
      setDaily(`Chatroom converted ${agent.name}'s message into a Council item.`);
    } else {
      setDaily("Council system not available yet.");
    }
  }

  function submitCouncilItem(agent, type = "suggestion") {
    const profile = staffProfileFor(agent);
    const title = type === "complaint"
      ? `${agent.name} complaint: ${profile.dislikes[0] || "friction"}`
      : type === "improvement"
        ? `${agent.name} improvement request: ${profile.needs[0] || "better support"}`
        : `${agent.name} suggestion: ${profile.likes[0] || "better work"}`;

    const item = {
      id: Date.now(),
      type,
      from: agent.id,
      about: agent.id,
      status: "open",
      severity: type === "complaint" ? "high" : "medium",
      title,
      detail: type === "complaint"
        ? `${agent.name} is frustrated by: ${profile.dislikes.join(", ")}.`
        : type === "improvement"
          ? `${agent.name} needs: ${profile.needs.join(", ")}.`
          : `${agent.name} suggests more of: ${profile.likes.join(", ")}.`,
      proposedFix: type === "complaint"
        ? `Council should remove the blocker, reassign work, or put the responsible role on improvement watch.`
        : type === "improvement"
          ? `Council should define one concrete support action and one measurable improvement signal.`
          : `Council should test this suggestion if it improves morale, output quality, or speed.`,
      created: new Date().toLocaleTimeString(),
      resolution: "",
    };

    setCouncilItems((prev) => [item, ...prev].slice(0, 50));
    setDaily(`${agent.name} submitted a ${type} to Council: ${title}`);
    log(agent.name, type, title);
    setScreen("Council");
  }

  function resolveCouncilItem(item, resolution = "Council accepted this item and created a follow-up improvement action.") {
    setCouncilItems((prev) => prev.map((x) => x.id === item.id ? { ...x, status: "resolved", resolution, resolved: new Date().toLocaleTimeString() } : x));
    setDaily(`Council resolved: ${item.title}`);
    log("BossCat", "council", `Resolved: ${item.title}`);
  }

  function putAgentOnImprovementWatch(agentId, reason = "Council requested measurable improvement.") {
    const agent = AGENTS.find((a) => a.id === agentId) || selectedAgent;
    const item = {
      id: Date.now(),
      type: "improvement",
      from: "boss",
      about: agent.id,
      status: "open",
      severity: "high",
      title: `${agent.name} improvement watch`,
      detail: reason,
      proposedFix: "Define one measurable excellence signal, one support action, and one review checkpoint. No role is protected from replacement.",
      created: new Date().toLocaleTimeString(),
      resolution: "",
    };
    setCouncilItems((prev) => [item, ...prev].slice(0, 50));
    setDaily(`${agent.name} placed on improvement watch. No one is safe from performance review.`);
    log("KindKnife", "council", `${agent.name} placed on improvement watch: ${reason}`);
    setScreen("Council");
  }

  function nudgeAgent(agent, kind) {
    const profile = staffProfileFor(agent);
    const message = kind === "praise"
      ? `${agent.name} morale boost: recognized for ${profile.likes[0] || "good work"}.`
      : kind === "support"
        ? `${agent.name} support request: needs ${profile.needs[0] || "clearer next step"}.`
        : `${agent.name} collaboration ping: should talk with ${profile.communicatesWith.map((id) => AGENTS.find((a) => a.id === id)?.name || id).join(", ")}.`;
    setDaily(message);
    log(agent.name, kind === "praise" ? "morale" : "next", message);
  }

  function floorplanFor(agent) {
    return AGENT_FLOORPLAN[agent.id] || { x: 50, y: 50, room: "ops", desk: "Unassigned", activity: "idle", indicator: "•" };
  }

  function floorSignalFor(agent) {
    const comm = typeof recentCommFor === "function" ? recentCommFor(agent.id) : null;
    const quest = quests.find((q) => q.agent === agent.id && q.status === "active");
    if (comm) return comm.fromId === agent.id ? "💬" : "👂";
    if (quest) return quest.status === "blocked" ? "⚠" : "🧠";
    return floorplanFor(agent).indicator;
  }

  function liveOfficeFor(agent) {
    const base = floorplanFor(agent);
    const live = officeAgents[agent.id] || {};
    return {
      ...base,
      ...live,
      x: live.x ?? base.x,
      y: live.y ?? base.y,
      activity: live.activity || base.activity || "idle",
      moving: Boolean(live.moving),
    };
  }

  function stepVirtualOffice() {
    setOfficeAgents((prev) => {
      const next = { ...prev };
      const latest = agentComms?.[0] || null;
      const fromBase = latest ? AGENTS.find((a) => a.id === latest.fromId) : null;
      const toBase = latest ? AGENTS.find((a) => a.id === latest.toId) : null;

      AGENTS.forEach((agent) => {
        const base = floorplanFor(agent);
        const current = next[agent.id] || { x: base.x, y: base.y, activity: base.activity || "idle" };
        let target = pointNearRoom(base.room, base);
        let activity = base.activity || "idle";

        if (latest && fromBase && agent.id === fromBase.id && toBase) {
          const toPos = next[toBase.id] || floorplanFor(toBase);
          target = nudgeToward(toPos, toPos, 5);
          activity = "walking to talk";
        } else if (latest && toBase && agent.id === toBase.id && fromBase) {
          const fromPos = next[fromBase.id] || floorplanFor(fromBase);
          target = nudgeToward(fromPos, fromPos, 5);
          activity = "listening";
        } else if (Math.random() < 0.34) {
          target = pointNearRoom(base.room, base);
          activity = Math.random() > 0.5 ? base.activity || "working" : "idle";
        } else {
          target = { x: current.x, y: current.y };
          activity = current.activity || base.activity || "idle";
        }

        const changedEnough = Math.abs((target.x || current.x) - current.x) + Math.abs((target.y || current.y) - current.y) > 2;

        next[agent.id] = {
          ...current,
          x: target.x,
          y: target.y,
          targetX: target.x,
          targetY: target.y,
          activity,
          moving: changedEnough,
        };
      });

      return next;
    });

    window.setTimeout(() => {
      setOfficeAgents((prev) => Object.fromEntries(Object.entries(prev).map(([id, value]) => [id, { ...value, moving: false }])));
    }, 1800);
  }

  useEffect(() => {
    const timer = window.setInterval(stepVirtualOffice, 4200);
    return () => window.clearInterval(timer);
  }, [agentComms?.[0]?.id]);

  function Office() {
    const latestSignal = typeof agentComms !== "undefined" && agentComms.length ? agentComms[0] : null;

    function cardMorale(agent) {
      const profile = typeof staffProfileFor === "function" ? staffProfileFor(agent) : null;
      const value = profile?.happiness ?? 60;
      const icon = value >= 75 ? "😊" : value >= 55 ? "😐" : "⚠";
      const color = value >= 75 ? "#37ff8b" : value >= 55 ? "#f7d154" : "#ff5c7a";
      return { value, icon, color };
    }

    function localRecentComm(agentId) {
      if (typeof recentCommFor === "function") return recentCommFor(agentId);
      if (typeof agentComms === "undefined") return null;
      return agentComms.find((event) => event.fromId === agentId || event.toId === agentId || event.toId === "room") || null;
    }

    function localCommCount(agentId) {
      if (typeof commCountFor === "function") return commCountFor(agentId);
      if (typeof agentComms === "undefined") return 0;
      return agentComms.filter((event) => event.fromId === agentId || event.toId === agentId || event.toId === "room").length;
    }

    const officeTitle = <button type="button" onClick={() => setSelectedAgentId(null)} className="text-left uppercase tracking-[0.22em] hover:text-white" title="Clear selected agent">Cyber Office</button>;

    return <Panel title={officeTitle} color="#00d9ff" className="overflow-hidden">
      <div className="mb-1 truncate rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-2 py-0.5 text-[8px] text-cyan-100">
        {latestSignal ? <>Current signal: <b>{latestSignal.fromName}</b> → <b>{latestSignal.toName}</b> · {latestSignal.text}</> : "Live office running. Use Chatroom → Let Room Talk to pull agents into conversation."}
      </div>

      <div className="relative h-[calc(100%-28px)] overflow-hidden rounded-2xl border border-cyan-300/25 bg-[#07101d]">
        {FLOORPLAN_ROOMS.map((room) => <div key={room.id} className="absolute rounded-2xl border bg-black/30 p-2" style={{ left: `${room.x}%`, top: `${room.y}%`, width: `${room.w}%`, height: `${room.h}%`, borderColor: `${room.color}55` }}>
          <div className="text-[8px] font-black uppercase tracking-[0.16em]" style={{ color: room.color }}>{room.label}</div>
        </div>)}

        {HIRING_PLAN.map((seat) => <button key={seat.id} onClick={() => { setSelectedHiringRole(seat.id); setScreen("Hiring"); }} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed bg-black/45 px-2 py-1 text-center hover:bg-white/10" style={{ left: `${seat.x}%`, top: `${seat.y}%`, borderColor: `${seat.color}66`, color: seat.color }}>
          <div className="text-[12px]">＋</div>
          <div className="max-w-[82px] truncate text-[8px] font-black">{seat.title}</div>
        </button>)}

        {AGENTS.map((agent) => {
          const pos = liveOfficeFor(agent);
          const q = quests.find((x) => x.agent === agent.id && x.status === "active");
          const state = spriteState(agent, q);
          const morale = cardMorale(agent);
          const recentComm = localRecentComm(agent.id);
          const commCount = localCommCount(agent.id);
          const signal = floorSignalFor(agent);
          const isSelected = selectedAgentId && selectedAgentId === agent.id;

          return <button key={agent.id} onClick={() => { setSelectedAgentId(agent.id); setScreen("Agents"); }} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-black/45 p-1 transition-[left,top,transform,box-shadow] duration-[1800ms] ease-in-out hover:z-40 hover:bg-white/10" style={{ left: `${pos.x}%`, top: `${pos.y}%`, borderColor: recentComm ? agent.color : isSelected ? agent.color : `${agent.color}55`, boxShadow: recentComm ? `0 0 22px ${agent.color}` : isSelected ? `0 0 18px ${agent.color}` : undefined, transform: `translate(-50%, -50%) ${pos.moving ? "scale(1.08)" : "scale(1)"}` }}>
            <div className="absolute -right-2 -top-5 z-30 rounded-full border border-white/20 bg-black px-1.5 py-0.5 text-sm" title={pos.activity}>{signal}</div>
            <div className="absolute -left-2 -top-4 z-30 rounded-full border bg-black px-1.5 py-0.5 text-[8px] font-black" style={{ color: morale.color, borderColor: morale.color }}>{morale.icon} {morale.value}%</div>
            {recentComm ? <div className="absolute -bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full border bg-black px-1.5 py-0.5 text-[8px] font-black" style={{ color: agent.color, borderColor: agent.color }}>{recentComm.fromId === agent.id ? "TALK" : "HEAR"}{commCount ? ` ${commCount}` : ""}</div> : null}
            <div className="transition-transform duration-500 hover:scale-110">
              <Sprite agent={agent} state={state} size={96} />
            </div>
            <div className="mt-1 max-w-[96px] truncate rounded bg-black/80 px-1 text-[8px] font-black" style={{ color: agent.color }}>{agent.name}</div><div className="max-w-[96px] truncate rounded bg-black/60 px-1 text-[7px] text-slate-300">{pos.activity}</div>
          </button>;
        })}
      </div>
    </Panel>;
  }
  function Card({ label, title, body, color, action }) { return <div className="rounded-xl border bg-black/45 p-2" style={{ borderColor: `${color}44` }}><div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</div><div className="mt-1 text-sm font-black" style={{ color }}>{title}</div><div className="mt-1 text-[11px] text-slate-300">{body}</div>{action && <div className="mt-2">{action}</div>}</div>; }
  function Command() { return <Panel title="Mission Control" color="#37ff8b" className="overflow-hidden"><div className="grid h-full grid-rows-[1fr_1fr_1fr_1fr_1.05fr] gap-2"><Card label="What Justin Does Next" title={liveGate ? "Human gate required" : "Nothing - AI owns this"} body={liveGate || "No action required from Justin. The system should continue with AI-owned work unless login, OTP, CAPTCHA, payment/legal, private dashboard facts, posting approval, tests, or live-risk appears."} color={liveGate ? "#ff5c7a" : "#37ff8b"} action={liveGate ? <button onClick={resolveGate} className="rounded-lg border border-emerald-300/30 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-black text-emerald-200">Resolve Gate</button> : null} /><Card label="Current Order" title={selectedQuest.title} body={`${selectedQuest.rank}  -  ${selectedQuest.status}  -  ${selectedQuest.payout}`} color="#f7d154" action={<div className="grid grid-cols-10 gap-1.5"><button onClick={autoPickQuest} className="rounded-lg border border-yellow-300/30 bg-yellow-300/10 px-3 py-1.5 text-[10px] font-black text-yellow-200">BossCat Auto-Pick</button>{selectedQuest.status === "done" ? <button onClick={reopenQuest} className="rounded-lg border border-yellow-300/30 bg-yellow-300/10 px-3 py-1.5 text-[10px] font-black text-yellow-200">Reopen Quest</button> : null}</div>} /><Card label="Active Work Packet" title={`${packet.agent} / ${packet.status}`} body={packet.output} color="#37ff8b" /><Card label="Live Gate" title={liveGate ? "Justin needed" : "No gate"} body={liveGate || "AI owns this step."} color={liveGate ? "#ff5c7a" : "#37ff8b"} /><div className="rounded-2xl border border-cyan-300/30 bg-black/45 p-3"><div className="flex items-center justify-between gap-2"><div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Next AI Action</div><span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2 py-0.5 text-[9px] font-black text-cyan-200">Backend: {backendMode}</span></div><div className="mt-1 text-sm font-black text-cyan-300">{packet.name}</div><label className="mt-2 flex items-center gap-2 text-[10px] text-slate-300"><input type="checkbox" checked={autoApplySafe} onChange={(e) => setAutoApplySafe(e.target.checked)} /> Auto-apply safe local results</label><div className="mt-1 text-[11px] text-slate-300">{packet.next}</div><button onClick={() => setScreen("Brief")} className="mt-2 rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-black text-cyan-200">Open Brief</button><button onClick={() => setScreen("Review")} className="mt-2 rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-black text-cyan-200">Open Review</button><button onClick={runNextSafeStep} className="mt-2 rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-black text-cyan-200">Run Next Safe Step</button><button onClick={requestAiExecution} className="mt-2 rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-black text-cyan-200">Request AI Execution</button></div></div></Panel>; }
  function ActiveScreenPanel() {
    return <Panel title={screen} color="#f7d154" className="overflow-hidden">
      <div className="h-full min-h-0 overflow-y-auto overscroll-contain rounded-xl border border-white/10 bg-white/5 p-2 pr-2">
        {content()}
      </div>
    </Panel>;
  }

  function CommandDeckNav() {
    return <Panel title="Command Deck" color="#f7d154" className="shrink-0 py-2">
      <div className="flex flex-wrap gap-2">
        {NAV.map((n) => <button key={n} onClick={() => { if (n === "Agents") setSelectedAgentId(null); setScreen(n); }} className="rounded-lg border px-2 py-1.5 text-left text-[9px] font-black" style={{ borderColor: screen === n ? "#f7d154" : "rgba(255,255,255,.12)", color: screen === n ? "#f7d154" : "#94a3b8", background: screen === n ? "rgba(247,209,84,.08)" : "rgba(0,0,0,.35)" }}>{n}</button>)}
      </div>
    </Panel>;
  }

  function content() {
    if (screen === "Action") {
      const readyResults = aiRequests.filter((r) => r.status === "Ready");
      const blockedRequests = aiRequests.filter((r) => r.status === "Blocked");
      const blockedQuests = quests.filter((q) => q.status === "blocked");
      const queuedQuests = quests.filter((q) => q.status === "queued");
      const activeQuests = quests.filter((q) => q.status === "active");
      const blockedCount = blockedRequests.length + blockedQuests.length + (liveGate ? 1 : 0);

      return <div className="space-y-3 text-[10px]">
        <div className="rounded-xl border border-emerald-300/25 bg-emerald-300/10 p-3">
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Action Center</div>
          <div className="mt-1 text-sm font-black" style={{ color: liveGate ? "#ff5c7a" : readyResults.length ? "#f7d154" : "#37ff8b" }}>
            {liveGate ? "Human gate first" : readyResults.length ? "Review ready result" : "Ready for next safe step"}
          </div>
          <div className="mt-1 text-slate-300">
            {liveGate || (readyResults.length ? "A backend result is ready for review/apply." : "No live gate or ready result is blocking the next safe step.")}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {liveGate ? <button onClick={resolveGate} className="rounded-lg border border-emerald-300/30 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-black text-emerald-200">Resolve Gate</button> : null}
            {readyResults.length ? <button onClick={() => setScreen("AI Queue")} className="rounded-lg border border-yellow-300/30 bg-yellow-300/10 px-3 py-1.5 text-[10px] font-black text-yellow-200">Review AI Queue</button> : null}
            {!liveGate && !readyResults.length && typeof runNextSafeStep === "function" ? <button onClick={runNextSafeStep} className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-black text-cyan-200">Run Next Safe Step</button> : null}
            {!liveGate && !readyResults.length && typeof runNextSafeStep !== "function" ? <button onClick={requestAiExecution} className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-black text-cyan-200">Request AI Execution</button> : null}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div className="rounded-xl border border-white/10 bg-black/45 p-3"><div className="text-slate-500">Active</div><b className="text-cyan-200">{activeQuests.length}</b></div>
          <div className="rounded-xl border border-white/10 bg-black/45 p-3"><div className="text-slate-500">Queued</div><b className="text-yellow-200">{queuedQuests.length}</b></div>
          <div className="rounded-xl border border-white/10 bg-black/45 p-3"><div className="text-slate-500">Ready Results</div><b className="text-emerald-200">{readyResults.length}</b></div>
          <div className="rounded-xl border border-white/10 bg-black/45 p-3"><div className="text-slate-500">Blocked</div><b className="text-red-200">{blockedCount}</b></div>
        </div>

        <div className="shrink-0 rounded-xl border border-yellow-300/20 bg-black/45 p-2">
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Ready Results</div>
          {readyResults.length ? <div className="mt-2 space-y-2">{readyResults.slice(0, 4).map((r) => <button key={r.id} onClick={() => setScreen("AI Queue")} className="block w-full rounded-lg border border-yellow-300/20 bg-yellow-300/10 p-2 text-left">
            <b className="text-yellow-200">{r.agent}</b> - {r.quest}
            <div className="text-slate-400">{r.packet} - {r.created}</div>
          </button>)}</div> : <div className="mt-2 text-slate-400">No ready results.</div>}
        </div>

        <div className="rounded-xl border border-red-300/20 bg-black/45 p-3">
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Blocked Work</div>
          {blockedCount ? <div className="mt-2 space-y-2">
            {liveGate ? <div className="rounded-lg bg-red-300/10 p-2 text-red-100"><b>Live Gate</b><div className="text-slate-300">{liveGate}</div></div> : null}
            {blockedRequests.slice(0, 3).map((r) => <div key={r.id} className="rounded-lg bg-red-300/10 p-2 text-red-100"><b>{r.agent}</b> - {r.quest}<div className="text-slate-300">{r.gate}</div></div>)}
            {blockedQuests.slice(0, 3).map((q) => <button key={q.id} onClick={() => { setSelectedQuestId(q.id); setSelectedAgentId(q.agent); setScreen("Command"); }} className="block w-full rounded-lg bg-red-300/10 p-2 text-left text-red-100"><b>{q.title}</b><div className="text-slate-300">{q.blocker || "Quest is blocked."}</div></button>)}
          </div> : <div className="mt-2 text-slate-400">No blocked work.</div>}
        </div>

        <div className="rounded-xl border border-cyan-300/20 bg-black/45 p-3">
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Queued Quest Ladder</div>
          {queuedQuests.length ? <div className="mt-2 space-y-2">{queuedQuests.slice(0, 6).map((q) => {
            const a = AGENTS.find((agent) => agent.id === q.agent) || activeAgent;
            return <button key={q.id} onClick={() => { setSelectedQuestId(q.id); setSelectedAgentId(q.agent); setScreen("Command"); }} className="block w-full rounded-lg border border-white/10 bg-black/50 p-2 text-left">
              <b style={{ color: a.color }}>{q.title}</b>
              <div className="text-slate-400">{a.name} - {q.rank} - {q.payout}</div>
            </button>;
          })}</div> : <div className="mt-2 text-slate-400">No queued quests.</div>}
        </div>
      </div>;
    }

    if (screen === "Quests") return <div className="space-y-2"><div className="grid grid-cols-[1fr_auto] gap-1"><input value={newQuest} onChange={(e) => setNewQuest(e.target.value)} placeholder="New quest" className="rounded bg-black/50 px-2 py-1 text-xs" /><button onClick={addQuest} className="rounded bg-emerald-300/10 px-2 text-xs text-emerald-200">Add</button></div>{quests.map((q) => <button key={q.id} onClick={() => { setSelectedQuestId(q.id); setSelectedAgentId(q.agent); }} className="block w-full rounded-lg bg-black/40 p-2 text-left"><div className="flex justify-between text-[10px] font-black"><span>{q.title}</span><span>{q.status}</span></div><div className="mt-1 text-[8px] text-slate-500">Requires: {requiredToolNamesForQuest(q, tools).join(", ") || "None"}</div><div className="mt-1 flex gap-1"><select value={q.agent} onChange={(e) => updateQuest(q.id, { agent: e.target.value })} className="rounded bg-black px-1 text-[9px]">{AGENTS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select><select value={q.status} onChange={(e) => updateQuest(q.id, { status: e.target.value, manualBlocked: e.target.value === "blocked" })} className="rounded bg-black px-1 text-[9px]">{["queued", "active", "blocked", "done"].map((s) => <option key={s}>{s}</option>)}</select></div></button>)}</div>;
    if (screen === "Comms") return <div className="space-y-2 text-[10px]">
      <div className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 p-3">
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Agent Communications</div>
        <div className="mt-1 text-sm font-black text-cyan-200">Live staff interaction signal</div>
        <div className="mt-1 text-slate-300">Chatroom agent messages create office signals. Office badges show TALK/HEAR. The latest signal banner above Cyber Office shows who is speaking to whom.</div>
      </div>

      {agentComms.length ? <div className="space-y-2">
        {agentComms.map((event) => {
          const from = AGENTS.find((a) => a.id === event.fromId);
          const to = AGENTS.find((a) => a.id === event.toId);
          return <div key={event.id} className="rounded-xl border border-white/10 bg-black/45 p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <b style={{ color: from?.color || "#94a3b8" }}>{event.fromName}</b>
                <span className="text-slate-500"> → </span>
                <b style={{ color: to?.color || "#94a3b8" }}>{event.toName}</b>
              </div>
              <span className="text-[8px] text-slate-500">{event.time}</span>
            </div>
            <div className="mt-2 rounded bg-black/50 p-2 text-slate-300">{event.text}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {from ? <button onClick={() => { setSelectedAgentId(from.id); setScreen("Agents"); }} className="rounded border border-cyan-300/30 bg-cyan-300/10 px-2 py-1 text-[9px] font-black text-cyan-200">Open {from.name}</button> : null}
              {to ? <button onClick={() => { setSelectedAgentId(to.id); setScreen("Agents"); }} className="rounded border border-cyan-300/30 bg-cyan-300/10 px-2 py-1 text-[9px] font-black text-cyan-200">Open {to.name}</button> : null}
            </div>
          </div>;
        })}
      </div> : <div className="rounded-xl border border-white/10 bg-black/45 p-3 text-slate-400">No agent communications yet. Go to Chatroom and click Let Room Talk.</div>}
    </div>;

    if (screen === "Hiring") {
      const selectedRole = HIRING_PLAN.find((role) => role.id === selectedHiringRole) || HIRING_PLAN[0];

      return <div className="space-y-2 text-[10px]">
        <div className="rounded-xl border border-emerald-300/25 bg-emerald-300/10 p-3">
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Hiring Pipeline</div>
          <div className="mt-1 text-sm font-black text-emerald-200">Expansion seats</div>
          <div className="mt-1 text-slate-300">Open seats are visible in Cyber Office. Hiring is planned only until the role has a useful job loop, accountability, and firing criteria.</div>
        </div>

        <div className="rounded-xl border border-yellow-300/25 bg-yellow-300/10 p-3">
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Selected Seat</div>
          <div className="mt-1 text-sm font-black" style={{ color: selectedRole.color }}>{selectedRole.title}</div>
          <div className="mt-1 text-slate-300">{selectedRole.reason}</div>
          <div className="mt-2 text-slate-400">Team: {selectedRole.team}</div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {HIRING_PLAN.map((role) => <button key={role.id} onClick={() => setSelectedHiringRole(role.id)} className="rounded-xl border bg-black/45 p-3 text-left" style={{ borderColor: selectedHiringRole === role.id ? role.color : "rgba(255,255,255,.12)" }}>
            <b style={{ color: role.color }}>{role.title}</b>
            <div className="mt-1 text-[9px] text-slate-400">{role.team}</div>
            <div className="mt-1 text-[9px] text-slate-500">{role.reason}</div>
          </button>)}
        </div>

        <div className="rounded-xl border border-red-300/20 bg-red-300/10 p-3 text-red-100">
          <b>No safe seats:</b> every hired role must have measurable usefulness, morale impact, and replacement criteria.
        </div>
      </div>;
    }

    if (screen === "Chatroom") return <div className="flex h-full min-h-0 flex-col gap-2 text-[10px]">
      <div className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Staff Chatroom</div>
            <div className="mt-1 text-sm font-black text-cyan-200">Work from the room</div>
            <div className="mt-1 text-slate-300">Talk to everyone, one agent, or issue commands. Local simulated intelligence for now.</div>
          </div>
          <button onClick={() => setChatAutoTalk((x) => !x)} className="rounded-lg border border-purple-300/30 bg-purple-300/10 px-3 py-1.5 text-[10px] font-black text-purple-200">{chatAutoTalk ? "Auto Talk: ON" : "Auto Talk: OFF"}</button>
        </div>
        <div className="mt-2 rounded bg-black/40 p-2 text-[9px] text-slate-300">
          Commands: <b>/quest</b> title · <b>/assign</b> Agent job · <b>/council</b> issue · <b>/help</b>
        </div>
      </div>

      <div className="rounded-xl border border-emerald-300/20 bg-black/45 p-3">
        <div className="grid grid-cols-[1fr_auto_auto] gap-2">
          <select value={chatTarget} onChange={(e) => setChatTarget(e.target.value)} className="rounded bg-black/60 px-2 py-1 text-xs text-slate-100">
            <option value="room">Everyone</option>
            {AGENTS.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
          </select>
          <button onClick={letRoomTalk} className="rounded-lg border border-purple-300/30 bg-purple-300/10 px-3 py-1.5 text-[10px] font-black text-purple-200">Let Room Talk</button>
          <button onClick={submitChat} className="rounded-lg border border-emerald-300/30 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-black text-emerald-200">Send</button>
        </div>
        <textarea value={chatDraft} onChange={(e) => setChatDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submitChat(); }} placeholder="Type here. Ctrl+Enter sends. Try /help or /assign PatchByte fix the browser task button." className="mt-2 h-14 w-full rounded bg-black/60 p-2 text-[10px] text-slate-100" />
        <div className="mt-1 text-[9px] text-slate-500">{chatCommandStatus}</div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-xl border border-white/10 bg-black/35 p-2 pr-2">
        <div className="space-y-2">
          {chatMessages.map((message) => {
            const agent = AGENTS.find((a) => a.id === message.fromId);
            const isJustin = message.fromId === "justin";
            const color = agent?.color || (isJustin ? "#37ff8b" : "#94a3b8");
            return <div key={message.id} className={`flex ${isJustin ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[92%] rounded-2xl border p-3 ${isJustin ? "bg-emerald-300/10" : "bg-black/60"}`} style={{ borderColor: `${color}55` }}>
                <div className="flex items-center justify-between gap-3">
                  <b style={{ color }}>{message.from}</b>
                  <span className="text-[8px] text-slate-500">{message.time}</span>
                </div>
                <div className="text-[8px] text-slate-500">to {message.to}</div>
                <div className="mt-2 whitespace-pre-wrap text-[11px] leading-relaxed text-slate-100">{message.text}</div>
                {message.fromId !== "justin" ? <div className="mt-2 flex flex-wrap gap-2">
                  <button onClick={() => { setSelectedAgentId(message.fromId); setScreen("Agents"); }} className="rounded border border-cyan-300/30 bg-cyan-300/10 px-2 py-1 text-[9px] font-black text-cyan-200">Open Agent</button>
                  <button onClick={() => convertChatToCouncil(message)} className="rounded border border-orange-300/30 bg-orange-300/10 px-2 py-1 text-[9px] font-black text-orange-200">Send to Council</button>
                </div> : null}
              </div>
            </div>;
          })}
        </div>
      </div>

      <div className="rounded-xl border border-yellow-300/20 bg-black/45 p-3">
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Latest Learnings</div>
        {chatLearnings.length ? <div className="mt-2 space-y-1">
          {chatLearnings.slice(0, 3).map((learning) => <div key={learning.id} className="rounded bg-yellow-300/10 p-2 text-yellow-100">{learning.text}<div className="text-[8px] text-slate-500">{learning.time}</div></div>)}
        </div> : <div className="mt-2 text-slate-400">No chat learnings yet.</div>}
      </div>
    </div>;

    if (screen === "Council") {
      const openItems = councilItems.filter((x) => x.status !== "resolved");
      const resolvedItems = councilItems.filter((x) => x.status === "resolved");
      const agentName = (id) => AGENTS.find((a) => a.id === id)?.name || (id === "system" ? "System" : id);
      const agentColor = (id) => AGENTS.find((a) => a.id === id)?.color || "#94a3b8";

      return <div className="space-y-3 text-[10px]">
        <div className="rounded-xl border border-orange-300/25 bg-orange-300/10 p-3">
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Staff Council</div>
          <div className="mt-1 text-sm font-black text-orange-200">Complaints, suggestions, improvement watch</div>
          <div className="mt-1 text-slate-300">Agents are incentivized to excel, help each other, and raise problems. No role is protected from review or replacement.</div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-white/10 bg-black/45 p-3">
            <div className="text-slate-500">Open Items</div>
            <b className="text-orange-200">{openItems.length}</b>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/45 p-3">
            <div className="text-slate-500">Resolved</div>
            <b className="text-emerald-200">{resolvedItems.length}</b>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/45 p-3">
            <div className="text-slate-500">Rule</div>
            <b className="text-red-200">No safe seats</b>
          </div>
        </div>

        <div className="rounded-xl border border-cyan-300/20 bg-black/45 p-3">
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Manual Council Item</div>
          <textarea value={councilDraft} onChange={(e) => setCouncilDraft(e.target.value)} placeholder="Write a complaint, suggestion, or improvement item..." className="mt-2 h-20 w-full rounded bg-black/60 p-2 text-[9px] text-slate-300" />
          <button onClick={() => { if (!councilDraft.trim()) return; const item = { id: Date.now(), type: "suggestion", from: "liaison", about: "system", status: "open", severity: "medium", title: "Manual council item", detail: councilDraft.trim(), proposedFix: "Council should discuss and decide a concrete next action.", created: new Date().toLocaleTimeString(), resolution: "" }; setCouncilItems((prev) => [item, ...prev].slice(0, 50)); setCouncilDraft(""); log("PlainJane", "council", item.detail); }} className="mt-2 rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-black text-cyan-200">Submit to Council</button>
        </div>

        <div className="space-y-2">
          {openItems.length ? openItems.map((item) => <div key={item.id} className="rounded-xl border bg-black/45 p-3" style={{ borderColor: item.severity === "high" ? "#ff5c7a55" : "#f7d15455" }}>
            <div className="flex items-center justify-between gap-2">
              <b style={{ color: item.type === "complaint" ? "#ff5c7a" : item.type === "improvement" ? "#f7d154" : "#00d9ff" }}>{item.type} - {item.severity}</b>
              <span className="text-slate-500">{item.created}</span>
            </div>
            <div className="mt-1 text-sm font-black text-slate-100">{item.title}</div>
            <div className="mt-1 text-slate-400">From <b style={{ color: agentColor(item.from) }}>{agentName(item.from)}</b> about <b style={{ color: agentColor(item.about) }}>{agentName(item.about)}</b></div>
            <div className="mt-2 rounded bg-black/50 p-2 text-slate-300">{item.detail}</div>
            <div className="mt-2 rounded bg-emerald-300/10 p-2 text-emerald-100"><b>Proposed fix:</b> {item.proposedFix}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button onClick={() => resolveCouncilItem(item)} className="rounded-lg border border-emerald-300/30 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-black text-emerald-200">Resolve</button>
              <button onClick={() => putAgentOnImprovementWatch(item.about, `Council follow-up from: ${item.title}`)} className="rounded-lg border border-purple-300/30 bg-purple-300/10 px-3 py-1.5 text-[10px] font-black text-purple-200">Improvement Watch</button>
              <button onClick={() => { setSelectedAgentId(item.about); setScreen("Agents"); }} className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-black text-cyan-200">Open Agent</button>
            </div>
          </div>) : <div className="rounded-xl border border-white/10 bg-black/45 p-3 text-slate-400">No open council items.</div>}
        </div>

        <div className="rounded-xl border border-white/10 bg-black/45 p-3">
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Council Meeting Logic</div>
          <div className="mt-2 grid gap-1 text-slate-300">
            <div>1. Hear the complaint/suggestion.</div>
            <div>2. Identify who is affected.</div>
            <div>3. Decide support, reassignment, improvement watch, or replacement risk.</div>
            <div>4. Reward agents who improve output, morale, safety, or revenue.</div>
          </div>
        </div>
      </div>;
    }

    if (screen === "Agents") {
      if (!selectedAgentId) return <div className="space-y-3 text-[10px]">
        <div className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 p-3">
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Agent Directory</div>
          <div className="mt-1 text-sm font-black text-cyan-200">All staff</div>
          <div className="mt-1 text-slate-300">Click an agent to open their full active-window profile, current work, morale, relationships, and actions.</div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {AGENTS.map((agent) => {
            const q = quests.find((x) => x.agent === agent.id && x.status === "active");
            const state = spriteState(agent, q);
            const profile = typeof staffProfileFor === "function" ? staffProfileFor(agent) : null;
            const happiness = profile?.happiness ?? 60;
            const recentComm = typeof recentCommFor === "function" ? recentCommFor(agent.id) : null;

            return <button key={agent.id} onClick={() => setSelectedAgentId(agent.id)} className="rounded-2xl border bg-black/45 p-3 text-left hover:bg-white/5" style={{ borderColor: `${agent.color}55` }}>
              <div className="flex items-center gap-3">
                <Sprite agent={agent} state={state} size={76} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-black" style={{ color: agent.color }}>{agent.name}</div>
                  <div className="text-[9px] text-slate-400">{agent.role} · {state}</div>
                  <div className="mt-1 text-[9px] text-slate-500">happiness: {happiness}%</div>
                  {q ? <div className="mt-1 truncate text-[9px] text-emerald-200">work: {q.title}</div> : <div className="mt-1 text-[9px] text-slate-600">no active quest</div>}
                  {recentComm ? <div className="mt-1 truncate text-[9px] text-cyan-200">comms: {recentComm.fromName || recentComm.fromId} → {recentComm.toName || recentComm.toId}</div> : null}
                </div>
              </div>
            </button>;
          })}
        </div>
      </div>;

      const actions = ACTIONS[selectedAgent.id] || ACTIONS.boss;
      const activeQuest = quests.find((q) => q.agent === selectedAgent.id && q.status === "active");
      const profile = typeof staffProfileFor === "function" ? staffProfileFor(selectedAgent) : null;
      const happiness = profile?.happiness ?? 60;
      const likes = profile?.likes || profile?.happy || [];
      const dislikes = profile?.dislikes || profile?.sad || [];
      const needs = profile?.needs || [];

      return <div className="space-y-3 text-[10px]">
        <div className="rounded-2xl border bg-black/45 p-3" style={{ borderColor: `${selectedAgent.color}66` }}>
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <Sprite agent={selectedAgent} state={spriteState(selectedAgent, activeQuest)} size={116} />
              <div>
                <div className="text-xl font-black" style={{ color: selectedAgent.color }}>{selectedAgent.name}</div>
                <div className="text-slate-400">{selectedAgent.role}</div>
                <div className="mt-1 text-slate-500">happiness: {happiness}%</div>
              </div>
            </div>
            <button onClick={() => setSelectedAgentId(null)} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm font-black text-slate-300 hover:bg-white/10" title="Back to all agents">×</button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-white/10 bg-black/40 p-2">
              <div className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">Current Work</div>
              <div className="mt-1 font-black text-emerald-200">{activeQuest?.title || "No active quest"}</div>
              <div className="mt-1 text-slate-400">{activeQuest?.status || "idle"}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/40 p-2">
              <div className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">Morale</div>
              <div className="mt-1 font-black" style={{ color: happiness >= 75 ? "#37ff8b" : happiness >= 55 ? "#f7d154" : "#ff5c7a" }}>{happiness}%</div>
              <div className="mt-1 text-slate-400">{happiness >= 75 ? "happy" : happiness >= 55 ? "stable" : "needs support"}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3">
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">Makes Happy</div>
            <div className="mt-2 flex flex-wrap gap-1">{(likes.length ? likes : ["clear instructions", "useful work"]).map((x) => <span key={x} className="rounded bg-emerald-300/15 px-2 py-1 text-emerald-100">{x}</span>)}</div>
          </div>
          <div className="rounded-xl border border-red-300/20 bg-red-300/10 p-3">
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">Makes Sad</div>
            <div className="mt-2 flex flex-wrap gap-1">{(dislikes.length ? dislikes : ["unclear gates", "manual loops"]).map((x) => <span key={x} className="rounded bg-red-300/15 px-2 py-1 text-red-100">{x}</span>)}</div>
          </div>
        </div>

        {needs.length ? <div className="rounded-xl border border-yellow-300/20 bg-yellow-300/10 p-3">
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">Current Needs</div>
          <div className="mt-2 flex flex-wrap gap-1">{needs.map((x) => <span key={x} className="rounded bg-yellow-300/15 px-2 py-1 text-yellow-100">{x}</span>)}</div>
        </div> : null}

        <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-3">
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">Actions</div>
          <div className="mt-2 space-y-2">
            {actions.map(([name, desc]) => <button key={name} onClick={() => runAgentAction(selectedAgent, name, desc)} className="block w-full rounded-xl border border-white/10 bg-black/40 p-2 text-left hover:bg-white/5">
              <b style={{ color: selectedAgent.color }}>{name}</b>
              <div className="text-[10px] text-slate-400">{desc}</div>
            </button>)}
          </div>
        </div>

        <button onClick={() => setSelectedAgentId(null)} className="w-full rounded-xl border border-white/10 bg-white/5 p-2 text-xs font-black text-slate-300 hover:bg-white/10">Back to all agents</button>
      </div>;
    }
    if (screen === "AI Queue") return <div className="space-y-2 text-[10px]">{aiRequests.length === 0 ? <div className="rounded border border-cyan-300/20 bg-cyan-300/10 p-2 text-cyan-100">No AI requests queued yet. Click Request AI Execution in Mission Control.</div> : aiRequests.map((r) => { const qr = queueResults[r.id] || { text: "", status: "done" }; const ready = r.status === "Ready" || r.status === "Applied"; return <div key={r.id} className="rounded-xl border bg-black/40 p-2" style={{ borderColor: r.status === "Ready" ? "#37ff8b55" : r.status === "Applied" ? "#5ea2ff55" : "#ff5c7a55" }}><div className="flex items-center justify-between gap-2"><b style={{ color: r.status === "Ready" ? "#37ff8b" : r.status === "Applied" ? "#5ea2ff" : "#ff5c7a" }}>{r.status}</b><span className="text-slate-500">{r.created}</span></div><div className="mt-1"><b>{r.agent}</b>  -  {r.packet}</div><div className="text-slate-400">Quest: {r.quest}</div>{r.status === "Blocked" ? <div className="mt-2 rounded bg-red-300/10 p-2 text-red-100"><b>Gate:</b> {r.gate}</div> : <div className="mt-2 rounded bg-emerald-300/10 p-2 text-emerald-100">Backend placeholder result received. Review it, then Apply Result.</div>}<textarea readOnly value={r.prompt} onFocus={(e) => e.target.select()} className="mt-2 h-20 w-full rounded bg-black/60 p-2 text-[9px] text-slate-300" />{r.result ? <div className="mt-2 rounded bg-blue-300/10 p-2 text-blue-100"><b>Backend result:</b> {r.result}</div> : null}{ready && <div className="mt-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-2"><b>Apply Result</b><textarea value={qr.text} onChange={(e) => setQueueResults((prev) => ({ ...prev, [r.id]: { ...qr, text: e.target.value } }))} placeholder="Paste completed ChatGPT result here" className="mt-2 h-20 w-full rounded bg-black/60 p-2 text-[9px] text-slate-300" /><div className="mt-2 grid grid-cols-[1fr_auto] gap-2"><select value={qr.status} onChange={(e) => setQueueResults((prev) => ({ ...prev, [r.id]: { ...qr, status: e.target.value } }))} className="rounded bg-black px-2 text-xs">{["done", "blocked", "queued", "active"].map((s) => <option key={s}>{s}</option>)}</select><button onClick={() => applyQueueResult(r)} className="rounded bg-emerald-300/10 px-2 text-xs text-emerald-200">Apply</button></div></div>}</div>; })}</div>;
    if (screen === "Browser Tasks") return <div className="space-y-3 text-[10px]">
      <div className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 p-3">
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Browser Task Queue</div>
        <div className="mt-1 text-sm font-black text-cyan-200">{browserTaskStatus}</div>
        <div className="mt-1 text-slate-300">Queue read-only browser work here. Tasks still obey backend gates, allowed origins, and human-confirmation rules.</div>
      </div>

      <div className="rounded-xl border border-emerald-300/20 bg-black/45 p-3">
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">New Browser Task</div>
        <input value={browserTaskUrl} onChange={(e) => setBrowserTaskUrl(e.target.value)} placeholder="https://allowed-origin.example/path" className="mt-2 w-full rounded bg-black/60 px-2 py-1 text-xs" />
        <textarea value={browserTaskGoal} onChange={(e) => setBrowserTaskGoal(e.target.value)} placeholder="Goal: read visible page status and summarize only." className="mt-2 h-20 w-full rounded bg-black/60 p-2 text-[9px]" />
        <button onClick={() => addBrowserTask()} className="mt-2 rounded-lg border border-emerald-300/30 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-black text-emerald-200">Queue Task</button>
      </div>

      <div className="space-y-2">
        {browserTasks.length ? browserTasks.map((task) => <div key={task.id} className="rounded-xl border border-white/10 bg-black/45 p-3">
          <div className="flex items-center justify-between gap-2">
            <b style={{ color: task.status === "blocked" ? "#ff5c7a" : task.status === "running" ? "#f7d154" : task.status === "inspected" || task.status === "dry-run" || task.status === "done" ? "#37ff8b" : "#00d9ff" }}>{task.status}</b>
            <span className="text-slate-500">{task.completed || task.created}</span>
          </div>
          <div className="mt-1 font-black text-cyan-200">{task.goal}</div>
          <div className="mt-1 break-all font-mono text-[9px] text-slate-400">{task.url || "No URL set."}</div>
          {task.result ? <pre className="mt-2 max-h-36 overflow-auto whitespace-pre-wrap rounded bg-black/60 p-2 text-[9px] text-slate-300">{task.result}</pre> : null}
          {task.screenshotPath ? <a href={task.screenshotPath} target="_blank" rel="noreferrer" className="mt-2 inline-block rounded border border-cyan-300/30 bg-cyan-300/10 px-2 py-1 text-[9px] font-black text-cyan-200">Open Screenshot</a> : null}
          <div className="mt-2 flex flex-wrap gap-2">
            <button onClick={() => runBrowserTask(task)} className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-black text-cyan-200">Run</button>
            <button onClick={() => clearBrowserTask(task.id)} className="rounded-lg border border-red-300/30 bg-red-300/10 px-3 py-1.5 text-[10px] font-black text-red-200">Remove</button>
          </div>
        </div>) : <div className="rounded-xl border border-white/10 bg-black/45 p-3 text-slate-400">No browser tasks queued.</div>}
      </div>
    </div>;

    if (screen === "Browser Runs") return <div className="space-y-3 text-[10px]">
      <div className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 p-3">
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Browser Runs</div>
        <div className="mt-1 text-sm font-black text-cyan-200">{browserRunsStatus}</div>
        <div className="mt-1 text-slate-300">Screenshots from Browser Ops read-only inspections appear here. Use these as evidence before letting Calyx automate anything deeper.</div>
        <button onClick={refreshBrowserRuns} className="mt-3 rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-black text-cyan-200">Refresh Browser Runs</button>
      </div>

      {browserRuns.length ? <div className="grid grid-cols-2 gap-3">
        {browserRuns.map((run) => <a key={run.name} href={run.url} target="_blank" rel="noreferrer" className="rounded-xl border border-white/10 bg-black/45 p-2 hover:bg-white/5">
          <img src={run.url} alt={run.name} className="h-40 w-full rounded-lg object-cover object-top" />
          <div className="mt-2 font-mono text-[9px] text-cyan-200">{run.name}</div>
          <div className="text-[9px] text-slate-500">{run.modifiedAt}</div>
        </a>)}
      </div> : <div className="rounded-xl border border-white/10 bg-black/45 p-3 text-slate-400">No browser screenshots yet. Run Browser Ops in dry-run first, then playwright read-only mode after setup.</div>}
    </div>;

    if (screen === "Browser Ops") return <div className="space-y-3 text-[10px]">
      <div className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 p-3">
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Browser Ops</div>
        <div className="mt-1 text-sm font-black text-cyan-200">Visible-browser automation safety harness</div>
        <div className="mt-1 text-slate-300">This is the foundation for dashboard automation. Current build supports dry-run safety checks and optional visible Playwright read-only inspection when enabled in .env.</div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-white/10 bg-black/45 p-3">
          <div className="text-slate-500">Mode</div>
          <b className="text-cyan-200">{browserHealth?.mode || "unknown"}</b>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/45 p-3">
          <div className="text-slate-500">Human Confirmation</div>
          <b className="text-yellow-200">{browserHealth?.requireHumanConfirmation === false ? "Not required" : "Required"}</b>
        </div>
      </div>

      <div className="rounded-xl border border-yellow-300/20 bg-black/45 p-3">
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Allowed Origins</div>
        <div className="mt-2 text-slate-300">{browserHealth?.allowedOrigins?.length ? browserHealth.allowedOrigins.join(", ") : "None configured. Browser Ops will block."}</div>
      </div>

      <div className="rounded-xl border border-red-300/20 bg-black/45 p-3">
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Hard Gates</div>
        <div className="mt-2 grid gap-1 text-slate-300">
          <div>Login / password / OTP / CAPTCHA: Justin gate</div>
          <div>Payment / checkout / purchase: Justin gate</div>
          <div>Public posting / messaging / email: Justin gate</div>
          <div>Trading / live-risk / IBKR orders: Justin gate unless explicitly paper-only</div>
        </div>
      </div>

      <div className="rounded-xl border border-emerald-300/20 bg-black/45 p-3">
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Browser Task</div>
        <input value={browserTaskUrl} onChange={(e) => setBrowserTaskUrl(e.target.value)} placeholder="https://allowed-origin.example/path" className="mt-2 w-full rounded bg-black/60 px-2 py-1 text-xs" />
        <textarea value={browserTaskGoal} onChange={(e) => setBrowserTaskGoal(e.target.value)} placeholder="Goal: read dashboard status, collect visible leads, summarize options..." className="mt-2 h-20 w-full rounded bg-black/60 p-2 text-[9px]" />
        <label className="mt-2 flex items-center gap-2 text-slate-300"><input type="checkbox" checked={browserConfirmed} onChange={(e) => setBrowserConfirmed(e.target.checked)} /> I confirm this is a safe dry run.</label>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={refreshBrowserHealth} className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-black text-cyan-200">Refresh Browser Health</button>
          <button onClick={() => addBrowserTask()} className="rounded-lg border border-emerald-300/30 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-black text-emerald-200">Queue Browser Task</button><button onClick={runBrowserDryRun} className="rounded-lg border border-emerald-300/30 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-black text-emerald-200">Run Browser Task</button>
        </div>
        <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-black/60 p-2 text-[9px] text-slate-300">{browserResult || "No Browser Ops result yet. Use dry-run first, then playwright mode for visible read-only inspection."}</pre>
      </div>
    </div>;
    if (screen === "Health") return <div className="space-y-3 text-[10px]">
      <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <b className="text-cyan-200">Backend Health</b>
          <button onClick={refreshBackendHealth} className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-2 py-1 text-[10px] font-black text-cyan-200">Refresh Health</button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded bg-black/40 p-2"><div className="text-slate-500">Service</div><b>{backendHealth.service || "Project Calyx API"}</b></div>
          <div className="rounded bg-black/40 p-2"><div className="text-slate-500">Status</div><b style={{ color: backendHealth.ok ? "#37ff8b" : "#ff5c7a" }}>{backendHealth.ok ? "Online" : "Offline"}</b></div>
          <div className="rounded bg-black/40 p-2"><div className="text-slate-500">Backend Mode</div><b className="text-cyan-200">{backendHealth.mode || backendMode}</b></div><div className="rounded bg-black/40 p-2"><div className="text-slate-500">Model</div><b className="text-cyan-200">{backendHealth.model || "n/a"}</b></div>
          <div className="rounded bg-black/40 p-2"><div className="text-slate-500">OpenAI Key</div><b style={{ color: backendHealth.openAiConfigured ? "#37ff8b" : "#f7d154" }}>{backendHealth.openAiConfigured ? "Configured" : "Not configured"}</b></div>
        </div>
        <div className="mt-2 rounded bg-black/40 p-2"><div className="text-slate-500">Timestamp</div><code className="text-slate-300">{backendHealth.timestamp || "Not checked yet"}</code></div>
        <div className="mt-2 rounded bg-black/40 p-2"><div className="text-slate-500">Last Error</div><span style={{ color: backendHealth.lastError ? "#ff5c7a" : "#37ff8b" }}>{backendHealth.lastError || "None"}</span></div>
      </div>
      <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-slate-300">
        This screen only checks the local backend. It does not wire a real OpenAI call or expose any API key to the frontend.
      </div>
    </div>;
    if (screen === "Systems") return <div className="space-y-2">{tools.map((t) => <div key={t.id} className="rounded-lg bg-black/40 p-2"><div className="flex justify-between text-[10px] font-black"><span>{t.name}</span><span style={{ color: statusColor(t.status) }}>{t.status}</span></div><div className="text-[9px] text-slate-500">{t.note}</div><div className="mt-1 flex gap-1">{["Ready", "Degraded", "Blocked"].map((s) => <button key={s} onClick={() => setTools((p) => p.map((x) => x.id === t.id ? { ...x, status: s } : x))} className="rounded bg-black px-1 text-[8px]" style={{ color: statusColor(s) }}>{s}</button>)}</div></div>)}</div>;
    if (screen === "Gates") return <div className="space-y-2 text-[10px]"><div className="rounded border border-red-300/20 bg-red-300/10 p-2 text-red-100"><b>Live gate:</b> {liveGate || "None. AI owns current work."}</div><div className="rounded border border-cyan-300/20 bg-cyan-300/10 p-2 text-cyan-100"><b>Required current tools:</b> {requiredToolNamesForQuest(selectedQuest, tools).join(", ") || "None"}</div>{["login", "2FA/OTP", "CAPTCHA", "payment/legal", "public posting", "live trading"].map((x) => <span key={x} className="mr-1 inline-block rounded bg-white/10 px-2 py-1">{x}</span>)}</div>;
    if (screen === "History") return <div className="space-y-2 text-[10px]">
      <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-100">
        <b>Run History</b>
        <div className="mt-1 text-slate-300">Every backend execution response or failure is recorded here.</div>
      </div>
      {runHistory.length === 0 ? <div className="rounded border border-white/10 bg-black/40 p-3 text-slate-400">No backend runs recorded yet. Click Request AI Execution from Mission Control.</div> : runHistory.map((r) => <div key={r.id} className="rounded-xl border bg-black/45 p-3" style={{ borderColor: r.status === "done" ? "#37ff8b55" : r.status === "blocked" ? "#ff5c7a55" : "#f7d15455" }}>
        <div className="flex items-center justify-between gap-2">
          <b style={{ color: r.status === "done" ? "#37ff8b" : r.status === "blocked" ? "#ff5c7a" : "#f7d154" }}>{r.status}</b>
          <span className="text-slate-500">{r.timestamp}</span>
        </div>
        <div className="mt-1"><b>{r.agent}</b> - {r.quest}</div>
        <div className="text-slate-500">Mode: {r.mode}</div>
        <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-black/60 p-2 text-[9px] text-slate-300">{r.result}</pre>
      </div>)}
    </div>;
    if (screen === "Log") return <div className="space-y-1">{logs.map((l, i) => <div key={i} className="rounded bg-black/40 p-2 text-[10px]"><b>{l.agent}</b>  -  {l.type}  -  {l.time}<br /><span className="text-slate-300">{l.text}</span></div>)}</div>;
    if (screen === "Assets") return <div className="space-y-2 text-[10px]"><div className="rounded border border-cyan-300/20 bg-cyan-300/10 p-2 text-cyan-100">Put real generated PNG sprite sheets in public/assets/command-center/ using these exact filenames. Each sheet must be six horizontal frames.</div>{AGENTS.map((a) => <div key={a.file} className="rounded bg-black/40 p-2"><b>{a.name}</b><div className="font-mono text-emerald-200">{a.file}</div></div>)}</div>;
    if (screen === "Patch Notes") return <div className="space-y-3 text-[10px]">
      <div className="rounded-xl border border-blue-300/25 bg-blue-300/10 p-3">
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Patch Notes</div>
        <div className="mt-1 text-sm font-black text-blue-200">Safe patching checklist</div>
        <div className="mt-1 text-slate-300">Use this screen before and after each patch so Project Calyx does not drift into uncommitted or broken states.</div>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/45 p-3">
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Preflight</div>
        <div className="mt-2 grid gap-2">
          {["git status is clean before patching", "patch file is in project root", "run patch with node", "hard refresh browser", "test Command / Systems / AI Queue / Save", "commit only after app works", "delete leftover patch helpers"].map((x) => <label key={x} className="flex items-center gap-2 rounded bg-black/40 p-2 text-slate-300"><input type="checkbox" /> {x}</label>)}
        </div>
      </div>

      <div className="rounded-xl border border-cyan-300/20 bg-black/45 p-3">
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Patch Notes</div>
        <textarea value={patchNotes} onChange={(e) => setPatchNotes(e.target.value)} className="mt-2 h-28 w-full rounded bg-black/60 p-2 text-[10px] text-slate-300" />
      </div>

      <div className="rounded-xl border border-emerald-300/20 bg-black/45 p-3">
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Command Block</div>
        <textarea readOnly value={patchCommandBlock} onFocus={(e) => e.target.select()} className="mt-2 h-40 w-full rounded bg-black/60 p-2 font-mono text-[9px] text-emerald-200" />
      </div>
    </div>;
    if (screen === "State") return <div className="space-y-3 text-[10px]">
      <div className="rounded-xl border border-emerald-300/25 bg-emerald-300/10 p-3">
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">State Recovery</div>
        <div className="mt-1 text-sm font-black text-emerald-200">{autosaveStatus}</div>
        <div className="mt-1 text-slate-300">Autosave is local to this browser. It protects the current dashboard state while patches are being tested.</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={restoreAutosave} className="rounded-lg border border-emerald-300/30 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-black text-emerald-200">Restore Autosave</button>
          <button onClick={save} className="rounded-lg border border-blue-300/30 bg-blue-300/10 px-3 py-1.5 text-[10px] font-black text-blue-200">Export Snapshot</button>
          <button onClick={clearAutosave} className="rounded-lg border border-red-300/30 bg-red-300/10 px-3 py-1.5 text-[10px] font-black text-red-200">Clear Autosave</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-white/10 bg-black/45 p-3">
          <div className="text-slate-500">Quests</div>
          <b className="text-cyan-200">{quests.length}</b>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/45 p-3">
          <div className="text-slate-500">AI Queue</div>
          <b className="text-yellow-200">{aiRequests.length}</b>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/45 p-3">
          <div className="text-slate-500">Logs</div>
          <b className="text-emerald-200">{logs.length}</b>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/45 p-3">
          <div className="text-slate-500">Selected Screen</div>
          <b className="text-slate-200">{screen}</b>
        </div>
      </div>

      <div className="rounded-xl border border-cyan-300/20 bg-black/45 p-3">
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Current Snapshot</div>
        <textarea readOnly value={JSON.stringify(snapshotState(), null, 2)} onFocus={(e) => e.target.select()} className="mt-2 h-72 w-full rounded bg-black/60 p-2 font-mono text-[9px] text-slate-300" />
      </div>
    </div>;
    if (screen === "Save") return <div className="space-y-2"><div className="flex gap-1"><button onClick={save} className="rounded bg-blue-300/10 px-2 py-1 text-xs text-blue-200">Export</button><button onClick={() => load(savedJson)} className="rounded bg-yellow-300/10 px-2 py-1 text-xs text-yellow-200">Import</button></div><textarea value={savedJson} onChange={(e) => setSavedJson(e.target.value)} className="h-72 w-full rounded bg-black/50 p-2 text-[10px]" /></div>;
    if (screen === "Tests") return <div className="space-y-2 text-[10px]">{testList.map(([name, pass]) => <div key={name} className="rounded bg-black/40 p-2"><b style={{ color: pass ? "#37ff8b" : "#ff5c7a" }}>{pass ? "PASS" : "FAIL"}</b>  -  {name}</div>)}</div>;
    return <div className="space-y-2 text-[10px]"><div className="rounded bg-black/40 p-2"><b>AI-owned work:</b> click Request AI Execution in Mission Control. Justin only acts on true gates.</div><textarea readOnly value={promptText} onFocus={(e) => e.target.select()} className="h-40 w-full rounded bg-black/50 p-2 text-[9px] text-slate-300" /><div className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-2"><b>Optional Result Import</b><textarea value={executionResult} onChange={(e) => setExecutionResult(e.target.value)} placeholder="Paste result only if manually updating state" className="mt-2 h-20 w-full rounded bg-black/50 p-2 text-[9px]" /><div className="mt-2 grid grid-cols-[1fr_auto] gap-2"><select value={executionStatus} onChange={(e) => setExecutionStatus(e.target.value)} className="rounded bg-black px-2 text-xs">{["done", "blocked", "queued", "active"].map((s) => <option key={s}>{s}</option>)}</select><button onClick={applyExecutionResult} className="rounded bg-emerald-300/10 px-2 text-xs text-emerald-200">Apply</button></div></div></div>;
  }

  return <div className="h-screen overflow-hidden bg-[#03040a] p-2 text-slate-100"><div className="mx-auto flex h-full max-w-[1780px] flex-col gap-1.5"><header className="flex shrink-0 items-center justify-between rounded-2xl border border-emerald-300/20 bg-black/70 px-3 py-1.5"><div><div className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">Project Calyx</div><div className="text-[10px] text-slate-500">ops command deck</div></div><div className="flex gap-2"><button onClick={dailyRun} className="rounded-xl border border-emerald-300/40 bg-emerald-300/10 px-3 py-1 text-xs font-black text-emerald-200">Daily Run</button><button onClick={save} className="rounded-xl border border-blue-300/40 bg-blue-300/10 px-3 py-1 text-xs font-black text-blue-200">Save</button><button onClick={() => load()} className="rounded-xl border border-blue-300/40 bg-blue-300/10 px-3 py-1 text-xs font-black text-blue-200">Load</button></div></header><div className="grid shrink-0 grid-cols-5 gap-1.5 rounded-2xl border border-white/10 bg-white/[.025] p-1"><Metric label="Credits (CAD)" value="$10.00" color="#37ff8b" /><Metric label="Pipeline" value="$950" color="#f7d154" /><Metric label="Quest" value={selectedQuest.rank} color="#ff6bd6" /><Metric label="Gate" value={liveGate ? "YES" : "NO"} color={liveGate ? "#ff5c7a" : "#37ff8b"} /><Metric label="Blocked" value={tools.filter((t) => t.status === "Blocked").length} color="#00e5ff" /></div><div className="shrink-0 rounded-2xl border border-emerald-300/20 bg-black/55 px-2 py-1 text-[10px] text-slate-200"><b className="text-emerald-200">Daily Run:</b> {daily}</div><CommandDeckNav /><div className="grid min-h-0 flex-1 grid-cols-[0.78fr_1.65fr_0.68fr] gap-2 overflow-hidden"><ActiveScreenPanel /><Office /><Command /></div></div></div>;
}



