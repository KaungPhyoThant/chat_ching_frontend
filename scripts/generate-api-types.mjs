import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const generatedDir = resolve(root, "src/lib/api/generated");
const openApiPath = resolve(generatedDir, "openapi.json");
const schemaPath = resolve(generatedDir, "schema.ts");
const backendRoot = resolve(root, "../ai-customer-support-backend");

mkdirSync(generatedDir, { recursive: true });

run("Export backend OpenAPI", "pnpm", [
  "--dir",
  backendRoot,
  "api:openapi",
  `--output=${openApiPath}`,
]);

run("Generate TypeScript API types", "pnpm", [
  "exec",
  "openapi-typescript",
  openApiPath,
  "-o",
  schemaPath,
]);

function run(label, command, commandArgs) {
  console.log(`\n> ${label}`);
  const result = spawnSync(command, commandArgs, {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
