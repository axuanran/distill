import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline";
import { stdin as defaultInput, stdout as defaultOutput } from "node:process";

import { DEFAULT_HOST, DEFAULT_MODEL, DEFAULT_TIMEOUT_MS } from "./config";
import type { PersistedConfig } from "./config";
import { writePersistedConfig } from "./user-config";

const AGENT_INSTRUCTIONS = [
  "<!-- distill skill: begin -->",
  "Use `/distill` whenever you need to compress prompts, task specs, commands, agent instructions, or shell-command output for another LLM.",
  "When running non-interactive shell commands, pipe output through `distill` unless exact raw output is required or `distill` would break an interactive/TUI workflow.",
  "Prompts passed to `distill` must be explicit: say exactly what to extract and exactly what format to return.",
  "Wait for `distill` to finish before continuing.",
  "<!-- distill skill: end -->"
].join("\n");

interface OnboardingOptions {
  env: NodeJS.ProcessEnv;
  input?: NodeJS.ReadableStream;
  output?: NodeJS.WritableStream;
  persisted?: PersistedConfig;
}

function resolveHome(env: NodeJS.ProcessEnv): string {
  const home = env.HOME?.trim() || env.USERPROFILE?.trim();

  if (!home) {
    throw new Error("Could not resolve home directory for onboarding.");
  }

  return home;
}

function resolvePackageRoot(env: NodeJS.ProcessEnv): string {
  if (env.DISTILL_PACKAGE_ROOT?.trim()) {
    return env.DISTILL_PACKAGE_ROOT;
  }

  return path.resolve(import.meta.dir, "..");
}

function parseTimeout(input: string, fallback: number): number {
  const trimmed = input.trim();

  if (!trimmed) {
    return fallback;
  }

  const value = Number(trimmed);

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("timeout-ms must be a positive number.");
  }

  return Math.floor(value);
}

function parseInstallChoice(input: string): boolean {
  const normalized = input.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  return !["n", "no", "false", "0"].includes(normalized);
}

async function appendInstructionsOnce(filePath: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });

  let current = "";

  try {
    current = await readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  if (current.includes("<!-- distill skill: begin -->")) {
    return;
  }

  const prefix = current.trim().length > 0 ? `${current.trimEnd()}\n\n` : "";
  await writeFile(filePath, `${prefix}${AGENT_INSTRUCTIONS}\n`);
}

async function installSkill(env: NodeJS.ProcessEnv): Promise<void> {
  const home = resolveHome(env);
  const packageRoot = resolvePackageRoot(env);
  const codexSource = path.join(packageRoot, "skills", "distill");
  const claudeSource = path.join(packageRoot, ".claude", "skills", "distill");
  const codexTarget = path.join(home, ".codex", "skills", "distill");
  const claudeTarget = path.join(home, ".claude", "skills", "distill");

  await mkdir(path.dirname(codexTarget), { recursive: true });
  await mkdir(path.dirname(claudeTarget), { recursive: true });
  await rm(codexTarget, { recursive: true, force: true });
  await rm(claudeTarget, { recursive: true, force: true });
  await cp(codexSource, codexTarget, { recursive: true });
  await cp(claudeSource, claudeTarget, { recursive: true });
  await appendInstructionsOnce(path.join(home, ".codex", "AGENTS.md"));
  await appendInstructionsOnce(path.join(home, ".claude", "CLAUDE.md"));
}

export async function runOnboarding({
  env,
  input = defaultInput,
  output = defaultOutput,
  persisted = {}
}: OnboardingOptions): Promise<void> {
  const rl = createInterface({ input, crlfDelay: Infinity });
  const lines = rl[Symbol.asyncIterator]();
  const ask = async (query: string): Promise<string> => {
    output.write(query);
    const next = await lines.next();

    return next.done ? "" : String(next.value);
  };
  const currentHost = persisted.host ?? DEFAULT_HOST;
  const currentModel = persisted.model ?? DEFAULT_MODEL;
  const currentTimeout = persisted.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  try {
    output.write("distill onboarding\n");
    const host =
      (await ask(`host [${currentHost}]: `)).trim() || currentHost;
    const model =
      (await ask(`model [${currentModel}]: `)).trim() || currentModel;
    const apiKey = await ask("api-key optional []: ");
    const timeoutMs = parseTimeout(
      await ask(`timeout-ms optional [${currentTimeout}]: `),
      currentTimeout
    );
    const shouldInstall = parseInstallChoice(
      await ask("install /distill skill for Codex and Claude? [Y/n]: ")
    );
    const config: PersistedConfig = {
      ...persisted,
      host,
      model,
      timeoutMs
    };

    if (apiKey.trim()) {
      config.apiKey = apiKey.trim();
    }

    await writePersistedConfig(env, config);
    output.write("config saved\n");

    if (shouldInstall) {
      await installSkill(env);
      output.write("/distill skill installed for Codex and Claude\n");
      output.write("AGENTS.md and CLAUDE.md updated\n");
    } else {
      output.write("skill install skipped\n");
    }
  } finally {
    rl.close();
  }
}
