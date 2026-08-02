import { access, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "README.md",
  "LICENSE",
  "DISCLAIMER.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "ROADMAP.md",
  "docs/CALCULATION_ASSUMPTIONS.md",
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/feature_request.yml",
  ".github/pull_request_template.md",
  ".github/workflows/pages.yml",
];

const errors = [];

for (const relativePath of requiredFiles) {
  try {
    await access(path.join(root, relativePath));
  } catch {
    errors.push(`Missing required file: ${relativePath}`);
  }
}

const sourceHtml = await readFile(path.join(root, "index.html"), "utf8");
const builtHtml = await readFile(path.join(root, "_site", "index.html"), "utf8");
const appJs = await readFile(path.join(root, "app.js"), "utf8");

if (!sourceHtml.includes('<html lang="zh-Hant">')) {
  errors.push("index.html must declare lang=zh-Hant.");
}

if (!sourceHtml.includes("人生規劃儀表板")) {
  errors.push("index.html is missing the project title.");
}

if (builtHtml.includes("Cathay planning prototype")) {
  errors.push("Built site still contains the competition-specific label.");
}

if (!builtHtml.includes("Open-source life planning simulator")) {
  errors.push("Built site is missing the neutral open-source tagline.");
}

if (!builtHtml.includes("教育與情境模擬用途")) {
  errors.push("Built site is missing the visible education-use disclaimer.");
}

if (!builtHtml.includes("不構成保險招攬")) {
  errors.push("Built site is missing the non-professional-advice statement.");
}

if (!appJs.includes("INCOME_TAX_BRACKETS_115")) {
  errors.push("app.js is missing the versioned income-tax bracket constant.");
}

if (!appJs.includes("function projectPlan()")) {
  errors.push("app.js is missing the main projection function.");
}

if (errors.length > 0) {
  console.error("Static validation failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Static validation passed.");
