#!/usr/bin/env node
/**
 * Reliquary verification helper.
 *
 *   node .cursor/skills/verify-reliquary/scripts/verify-reliquary.mjs --help
 *   node .cursor/skills/verify-reliquary/scripts/verify-reliquary.mjs launch
 *   node .cursor/skills/verify-reliquary/scripts/verify-reliquary.mjs doctor
 *   node .cursor/skills/verify-reliquary/scripts/verify-reliquary.mjs drive guest-welcome
 *   node .cursor/skills/verify-reliquary/scripts/verify-reliquary.mjs cleanup
 *
 * Evidence lives in artifacts/verify-reliquary/<run-id>/ and is never deleted.
 */
import { spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, "../../../..");
const STATE_DIR = "/tmp/verify-reliquary";
const STATE_PATH = join(STATE_DIR, "state.json");
const DEFAULT_BASE = "http://127.0.0.1:8080";
const WELCOME_LEAD = "A place to keep things that move.";
const LIBRARY_HEADING = "A wiki of living artifacts";
const WELCOME_TITLE = "Welcome to Reliquary";

function usage() {
  return `verify-reliquary — drive the local Reliquary web UI as a guest

Usage:
  node .cursor/skills/verify-reliquary/scripts/verify-reliquary.mjs <command> [options]

Commands:
  launch [--reuse]          Start npm run dev on :8080 (DATABASE_URL unset).
                            --reuse adopts an already-healthy server; cleanup
                            will not kill it.
  doctor                    Read-only health: unset DATABASE_URL, library
                            heading, GET /api/mcp name, guest /a/welcome,
                            GET /api/artifacts → 401 UNAUTHORIZED.
  drive guest-welcome       Guest seeded Welcome walk: / → /a/welcome →
                            Source → Open /s/welcome. Writes evidence.
  cleanup [--dry-run]       Stop the npm run dev this helper started.
                            Never deletes artifacts/verify-reliquary/.

Options:
  --run-id <id>             Evidence folder name (drive).
  --base-url <url>          Default ${DEFAULT_BASE}. Loopback only.
  --help                    Show this help.

Evidence: artifacts/verify-reliquary/<run-id>/
`;
}

function die(message, code = 1) {
  console.error(message);
  process.exit(code);
}

function parseArgs(argv) {
  const out = { command: "", feature: "", reuse: false, dryRun: false, runId: "", baseUrl: DEFAULT_BASE };
  const rest = [...argv];
  if (rest[0] === "--help" || rest[0] === "-h") {
    out.command = "help";
    return out;
  }
  out.command = rest.shift() ?? "help";
  if (out.command === "drive") {
    out.feature = rest.shift() ?? "";
  }
  while (rest.length) {
    const flag = rest.shift();
    if (flag === "--reuse") out.reuse = true;
    else if (flag === "--dry-run") out.dryRun = true;
    else if (flag === "--run-id") out.runId = rest.shift() ?? "";
    else if (flag === "--base-url") out.baseUrl = rest.shift() ?? DEFAULT_BASE;
    else if (flag === "--help" || flag === "-h") out.command = "help";
    else die(`Unknown flag: ${flag}\n\n${usage()}`);
  }
  return out;
}

function assertLocalBase(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    die(`Invalid --base-url: ${url}`);
  }
  const host = parsed.hostname;
  if (!["127.0.0.1", "localhost", "[::1]", "::1"].includes(host)) {
    die(`Refusing non-loopback base URL ${url}. Do not drive production.`);
  }
  if (parsed.port && parsed.port !== "8080") {
    die(`Drive target must be port 8080, got ${parsed.port}`);
  }
  return parsed.origin;
}

function refuseSharedDb() {
  if (process.env.DATABASE_URL) {
    die(
      "DATABASE_URL is set. Guest proofs must use in-memory PGLite. Unset it and relaunch. Do not doctor a shared/Neon database.",
    );
  }
}

function readState() {
  if (!existsSync(STATE_PATH)) return null;
  try {
    return JSON.parse(readFileSync(STATE_PATH, "utf8"));
  } catch {
    return null;
  }
}

function writeState(state) {
  mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function probe(url, { timeoutMs = 2000 } = {}) {
  const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(timeoutMs) });
  const body = await res.text();
  return { status: res.status, body };
}

async function waitReady(baseUrl, timeoutMs = 120000) {
  const start = Date.now();
  let last = "";
  while (Date.now() - start < timeoutMs) {
    try {
      const { status, body } = await probe(`${baseUrl}/`);
      if (status === 200 && body.includes(LIBRARY_HEADING)) return;
      last = `HTTP ${status}, heading ${body.includes(LIBRARY_HEADING) ? "ok" : "missing"}`;
    } catch (err) {
      last = err instanceof Error ? err.message : String(err);
    }
    await sleep(500);
  }
  throw new Error(`Server at ${baseUrl} not ready within ${timeoutMs}ms (${last})`);
}

async function cmdLaunch(opts) {
  refuseSharedDb();
  const baseUrl = assertLocalBase(opts.baseUrl);
  try {
    const { status, body } = await probe(`${baseUrl}/`);
    if (status === 200 && body.includes(LIBRARY_HEADING)) {
      if (!opts.reuse) {
        die(
          `${baseUrl} is already healthy. Pass --reuse to adopt it (cleanup will not kill it), or stop that process first.`,
        );
      }
      writeState({
        owned: false,
        pid: null,
        baseUrl,
        startedAt: new Date().toISOString(),
      });
      console.log(JSON.stringify({ ok: true, reused: true, owned: false, baseUrl }, null, 2));
      return;
    }
  } catch {
    /* nothing listening — start ours */
  }

  mkdirSync(STATE_DIR, { recursive: true });
  const logPath = join(STATE_DIR, "dev.log");
  const env = { ...process.env };
  delete env.DATABASE_URL;
  const child = spawn("npm", ["run", "dev"], {
    cwd: REPO_ROOT,
    env,
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const logFd = await import("node:fs").then((fs) =>
    fs.createWriteStream(logPath, { flags: "a" }),
  );
  child.stdout?.pipe(logFd);
  child.stderr?.pipe(logFd);
  child.unref();
  writeState({
    owned: true,
    pid: child.pid,
    baseUrl,
    startedAt: new Date().toISOString(),
    logPath,
  });
  try {
    await waitReady(baseUrl);
  } catch (err) {
    try {
      if (child.pid) process.kill(-child.pid, "SIGTERM");
    } catch {
      /* already gone */
    }
    throw err;
  }
  console.log(
    JSON.stringify(
      { ok: true, reused: false, owned: true, pid: child.pid, baseUrl, logPath },
      null,
      2,
    ),
  );
}

async function cmdDoctor(opts) {
  refuseSharedDb();
  const baseUrl = assertLocalBase(opts.baseUrl);
  const checks = [];

  const home = await probe(`${baseUrl}/`);
  checks.push({
    name: "GET /",
    ok: home.status === 200 && home.body.includes(LIBRARY_HEADING),
    status: home.status,
    detail: home.body.includes(LIBRARY_HEADING) ? LIBRARY_HEADING : "heading missing",
  });

  const mcp = await probe(`${baseUrl}/api/mcp`);
  let mcpJson = null;
  try {
    mcpJson = JSON.parse(mcp.body);
  } catch {
    mcpJson = null;
  }
  checks.push({
    name: "GET /api/mcp",
    ok: mcp.status === 200 && mcpJson?.name === "reliquary" && Array.isArray(mcpJson?.tools),
    status: mcp.status,
    detail: mcpJson?.name ?? mcp.body.slice(0, 80),
  });

  const wiki = await probe(`${baseUrl}/a/welcome`);
  checks.push({
    name: "GET /a/welcome",
    ok: wiki.status === 200 && wiki.body.includes(WELCOME_TITLE),
    status: wiki.status,
    detail: wiki.body.includes(WELCOME_TITLE) ? WELCOME_TITLE : "title missing",
  });

  const list = await probe(`${baseUrl}/api/artifacts`);
  let listJson = null;
  try {
    listJson = JSON.parse(list.body);
  } catch {
    listJson = null;
  }
  checks.push({
    name: "GET /api/artifacts (guest unauthorized)",
    ok: list.status === 401 && listJson?.code === "UNAUTHORIZED",
    status: list.status,
    detail: listJson?.code ?? list.body.slice(0, 80),
  });

  const html = await probe(`${baseUrl}/api/artifacts/welcome/html`);
  checks.push({
    name: "GET /api/artifacts/welcome/html",
    ok: html.status === 200 && html.body.includes(WELCOME_LEAD),
    status: html.status,
    detail: html.body.includes(WELCOME_LEAD) ? WELCOME_LEAD : "lead missing",
  });

  const ok = checks.every((c) => c.ok);
  const payload = {
    ok,
    databaseUrl: null,
    baseUrl,
    checks,
  };
  console.log(JSON.stringify(payload, null, 2));
  if (!ok) process.exit(1);
}

async function ariaDump(page) {
  return page.evaluate(() => {
    const lines = [`url: ${location.href}`, `title: ${document.title}`];
    const nodes = document.querySelectorAll("h1, h2, h3, a, button, input, [aria-label]");
    for (const el of nodes) {
      const name = (
        el.getAttribute("aria-label") ||
        el.getAttribute("title") ||
        el.textContent ||
        ""
      )
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 100);
      if (!name) continue;
      lines.push(`${el.tagName.toLowerCase()}: ${name}`);
    }
    return lines.join("\n");
  });
}

async function cmdDriveGuestWelcome(opts) {
  refuseSharedDb();
  const baseUrl = assertLocalBase(opts.baseUrl);
  await cmdDoctor({ ...opts, baseUrl });

  const runId =
    opts.runId ||
    `guest-welcome-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  const outDir = join(REPO_ROOT, "artifacts/verify-reliquary", runId);
  mkdirSync(outDir, { recursive: true });

  const consoleErrors = [];
  const pageErrors = [];
  const steps = [];

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => {
    pageErrors.push(err.message);
  });

  try {
    await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { name: LIBRARY_HEADING }).waitFor({ state: "visible" });
    await page.getByRole("link", { name: /Welcome to Reliquary/ }).waitFor({ state: "visible" });
    writeFileSync(join(outDir, "01-library.aria.txt"), await ariaDump(page));
    await page.screenshot({ path: join(outDir, "01-library.png") });
    steps.push({ id: "library", url: page.url(), ok: true });

    await page.getByRole("link", { name: /Welcome to Reliquary/ }).click();
    await page.waitForURL(/\/a\/welcome/);
    await page.getByRole("heading", { name: WELCOME_TITLE }).waitFor({ state: "visible" });
    await page.getByRole("link", { name: "Sign in to save" }).waitFor({ state: "visible" });
    const editCount = await page.getByRole("link", { name: "Edit" }).count();
    if (editCount > 0) throw new Error("Guest wiki unexpectedly shows Edit");
    const frame = page.frameLocator('iframe[title="Welcome to Reliquary"]');
    await frame.getByText(WELCOME_LEAD).waitFor({ state: "visible", timeout: 20000 });
    writeFileSync(join(outDir, "02-wiki.aria.txt"), await ariaDump(page));
    await page.screenshot({ path: join(outDir, "02-wiki.png") });
    steps.push({
      id: "wiki",
      url: page.url(),
      iframeLead: WELCOME_LEAD,
      guestSave: true,
      ok: true,
    });

    await page.getByRole("button", { name: "Source" }).click();
    const listing = page.locator("pre.source-listing");
    await listing.waitFor({ state: "visible" });
    const sourceText = await listing.innerText();
    if (
      !sourceText.includes(WELCOME_LEAD) &&
      !sourceText.includes("<title>Welcome to Reliquary</title>")
    ) {
      throw new Error("Source listing missing welcome title or lead");
    }
    writeFileSync(join(outDir, "03-source.txt"), sourceText.slice(0, 4000));
    writeFileSync(join(outDir, "03-source.aria.txt"), await ariaDump(page));
    await page.screenshot({ path: join(outDir, "03-source.png") });
    steps.push({
      id: "source",
      url: page.url(),
      excerpt: sourceText.includes(WELCOME_LEAD) ? WELCOME_LEAD : "<title>Welcome to Reliquary</title>",
      ok: true,
    });

    await page.getByRole("link", { name: "Open" }).click();
    await page.waitForURL(/\/s\/(welcome|art-welcome)/);
    await page.getByRole("link", { name: "Back to Reliquary" }).waitFor({ state: "visible" });
    const save = page.getByRole("link", { name: /Save to library|Save/ });
    await save.waitFor({ state: "visible" });
    const saveHref = await save.getAttribute("href");
    if (!saveHref || !saveHref.includes("/login")) {
      throw new Error(`Guest Save must be a login link, got ${saveHref}`);
    }
    const shareFrame = page.frameLocator('iframe[title="Welcome to Reliquary"]');
    await shareFrame.getByText(WELCOME_LEAD).waitFor({ state: "visible", timeout: 20000 });
    writeFileSync(join(outDir, "04-share.aria.txt"), await ariaDump(page));
    await page.screenshot({ path: join(outDir, "04-share.png") });
    steps.push({
      id: "share",
      url: page.url(),
      saveHref,
      iframeLead: WELCOME_LEAD,
      ok: true,
    });

    const mobile = await context.newPage();
    await mobile.setViewportSize({ width: 390, height: 844 });
    await mobile.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
    await mobile.getByRole("heading", { name: LIBRARY_HEADING }).waitFor({ state: "visible" });
    await mobile.screenshot({ path: join(outDir, "01-library-mobile.png") });
    await mobile.close();
  } finally {
    await browser.close();
  }

  const uncaught = pageErrors.filter(Boolean);
  const verdict = {
    ok: uncaught.length === 0,
    feature: "guest-welcome",
    entryPoint: "/ → /a/welcome → Source → /s/welcome",
    runId,
    evidenceDir: `artifacts/verify-reliquary/${runId}`,
    baseUrl,
    steps,
    consoleErrors,
    pageErrors: uncaught,
  };
  writeFileSync(join(outDir, "verdict.json"), `${JSON.stringify(verdict, null, 2)}\n`);
  console.log(JSON.stringify(verdict, null, 2));
  if (!verdict.ok) {
    die("Drive recorded uncaught page errors. See verdict.json.");
  }
}

function cmdCleanup(opts) {
  const state = readState();
  const evidenceRoot = join(REPO_ROOT, "artifacts/verify-reliquary");
  if (!state) {
    console.log(
      JSON.stringify(
        {
          ok: true,
          stopped: false,
          reason: "no state file",
          evidencePreserved: existsSync(evidenceRoot),
          evidenceRoot: "artifacts/verify-reliquary/",
        },
        null,
        2,
      ),
    );
    return;
  }
  if (opts.dryRun) {
    console.log(
      JSON.stringify(
        {
          ok: true,
          dryRun: true,
          wouldStop: Boolean(state.owned && state.pid),
          pid: state.pid,
          owned: state.owned,
          evidencePreserved: true,
        },
        null,
        2,
      ),
    );
    return;
  }
  let stopped = false;
  if (state.owned && state.pid) {
    try {
      process.kill(-state.pid, "SIGTERM");
      stopped = true;
    } catch {
      try {
        process.kill(state.pid, "SIGTERM");
        stopped = true;
      } catch {
        stopped = false;
      }
    }
  }
  rmSync(STATE_PATH, { force: true });
  console.log(
    JSON.stringify(
      {
        ok: true,
        stopped,
        owned: state.owned,
        pid: state.pid ?? null,
        evidencePreserved: existsSync(evidenceRoot),
        evidenceRoot: "artifacts/verify-reliquary/",
      },
      null,
      2,
    ),
  );
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.command === "help" || !opts.command) {
    process.stdout.write(usage());
    return;
  }
  if (opts.command === "launch") {
    await cmdLaunch(opts);
    return;
  }
  if (opts.command === "doctor") {
    await cmdDoctor(opts);
    return;
  }
  if (opts.command === "drive") {
    if (opts.feature !== "guest-welcome") {
      die(`Unknown feature '${opts.feature}'. First proof is: drive guest-welcome`);
    }
    await cmdDriveGuestWelcome(opts);
    return;
  }
  if (opts.command === "cleanup") {
    cmdCleanup(opts);
    return;
  }
  die(`Unknown command '${opts.command}'\n\n${usage()}`);
}

main().catch((err) => {
  die(err instanceof Error ? err.stack || err.message : String(err));
});
