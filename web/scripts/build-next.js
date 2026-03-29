const { spawnSync } = require("node:child_process");
const path = require("node:path");

const nextVersion = require("next/package.json").version;
const nextMajor = Number.parseInt(nextVersion.split(".")[0] ?? "0", 10);
const nextBinary = path.join(
  process.cwd(),
  "node_modules",
  ".bin",
  process.platform === "win32" ? "next.cmd" : "next",
);

const args = ["build"];

// Next 16 defaults to Turbopack, but next-pwa still injects webpack config.
if (Number.isFinite(nextMajor) && nextMajor >= 16) {
  args.push("--webpack");
}

const result = spawnSync(nextBinary, args, {
  shell: process.platform === "win32",
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error);
}

process.exit(result.status ?? 1);
