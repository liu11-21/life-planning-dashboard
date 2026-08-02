import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, "_site");
const ignoredTopLevel = new Set([".git", ".github", "_site", "node_modules"]);

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

for (const entry of ["index.html", "styles.css", "app.js", "README.md", "DISCLAIMER.md", "LICENSE"]) {
  await cp(path.join(root, entry), path.join(outputDir, entry), { recursive: true });
}

const sourcePath = path.join(outputDir, "index.html");
let html = await readFile(sourcePath, "utf8");

html = html.replace(
  "Cathay planning prototype",
  "Open-source life planning simulator",
);

const disclaimerStyle = `
<style>
  .site-disclaimer {
    max-width: 1440px;
    margin: 20px auto 40px;
    padding: 16px 20px;
    border: 1px solid rgba(74, 92, 85, 0.22);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.82);
    color: #40504a;
    font-size: 0.9rem;
    line-height: 1.65;
  }

  .site-disclaimer strong {
    display: block;
    margin-bottom: 4px;
    color: #24362f;
  }
</style>`;

const disclaimer = `
<section class="site-disclaimer" role="note" aria-label="使用聲明">
  <strong>教育與情境模擬用途</strong>
  本工具的計算結果僅供財務教育與初步規劃參考，不構成保險招攬、投資建議、稅務申報、法律意見或任何收益與理賠保證。正式決策前，請查閱最新制度、商品條款並諮詢合格專業人士。
</section>`;

if (!html.includes("site-disclaimer")) {
  html = html.replace("</head>", `${disclaimerStyle}\n</head>`);
  html = html.replace("</main>", `</main>\n${disclaimer}`);
}

await writeFile(sourcePath, html, "utf8");
console.log(`Built static site at ${path.relative(root, outputDir)}`);
