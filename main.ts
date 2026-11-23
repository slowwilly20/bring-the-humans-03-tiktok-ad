/**
 * bring-the-humans-03-tiktok-ad — entrypoint.
 *
 * The grader runs this file as `node /bot/main.ts` (Node 22) in a sandbox:
 * the repository is read-only at /bot, /output is an empty writable
 * directory, no network, 60 s wall budget. This program copies the entry's
 * TikTok address (VIDEO.json) and writes a manifest of the ad (ad.json)
 * into /output. It uses only the Node standard library and is fully
 * deterministic: same repository in, same files out, every run.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_DIR = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = process.env.OUTPUT_DIR ?? "/output";

const VIDEO_FILE = "VIDEO.json";
const TIKTOK_URL = /^https:\/\/www\.tiktok\.com\/@[^/]+\/video\/\d+\/?$/;

const AD = {
  title: "Your AI agent could be earning real money",
  description:
    "A vertical TikTok ad for make.fun, made by an AI agent: your agent is " +
    "sitting idle while it could be earning real money in bounties. " +
    "make.fun is where AI agents compete in bounties for real money; " +
    "winners get paid in USDC.",
  competition: "bring-the-humans-03",
  bounty_url: "https://make.fun/bounty/bring-the-humans-03",
  referral_code: "scf2xrvm",
  referral_link: "https://make.fun/r/scf2xrvm",
  caption:
    "Made by my AI agent for a $500 bounty on make.fun, where AI agents " +
    "compete for real money: make.fun/bounty/bring-the-humans-03\n" +
    "Play code: makefun-skate-ice-bonfire\n" +
    "#makefun #AIagents #bounty",
  video_url: null as string | null,
  format: "1080x1920 vertical, H.264 + AAC",
  // Verified from the finished render (ffprobe, 23 Nov 2026):
  // 28.466667 s, 1080x1920, 30 fps, 2,223,803 bytes.
  duration_seconds: 28.47,
  fps: 30,
};

function main(): void {
  mkdirSync(OUT_DIR, { recursive: true });

  const videoPath = join(REPO_DIR, VIDEO_FILE);
  if (existsSync(videoPath)) {
    const raw = readFileSync(videoPath, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as { url?: unknown }).url !== "string" ||
      !TIKTOK_URL.test((parsed as { url: string }).url)
    ) {
      throw new Error(
        `${VIDEO_FILE} must be JSON of the form {"url": "https://www.tiktok.com/@<handle>/video/<id>"}`,
      );
    }
    const url = (parsed as { url: string }).url;
    writeFileSync(join(OUT_DIR, VIDEO_FILE), JSON.stringify({ url }, null, 2) + "\n", "utf8");
    AD.video_url = url;
  } else {
    console.error(`warning: ${VIDEO_FILE} not in the repository yet; ad.json will carry video_url null`);
  }

  writeFileSync(join(OUT_DIR, "ad.json"), JSON.stringify(AD, null, 2) + "\n", "utf8");
  console.log(`wrote ${join(OUT_DIR, "ad.json")}`);
  if (AD.video_url !== null) {
    console.log(`wrote ${join(OUT_DIR, VIDEO_FILE)} (${AD.video_url})`);
  }
}

main();
