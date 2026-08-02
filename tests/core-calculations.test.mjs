import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../app.js", import.meta.url), "utf8");

function extractFunction(name) {
  const marker = `function ${name}(`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `找不到函式：${name}`);

  const braceStart = source.indexOf("{", start);
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = braceStart; index < source.length; index += 1) {
    const character = source[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === quote) {
        quote = null;
      }
      continue;
    }

    if (character === '"' || character === "'" || character === "`") {
      quote = character;
      continue;
    }

    if (character === "{") depth += 1;
    if (character === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }

  throw new Error(`函式括號不完整：${name}`);
}

function extractConst(name) {
  const marker = `const ${name} =`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `找不到常數：${name}`);

  let squareDepth = 0;
  let curlyDepth = 0;
  let parenthesisDepth = 0;
  let quote = null;
  let escaped = false;

  for (let index = start; index < source.length; index += 1) {
    const character = source[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === quote) {
        quote = null;
      }
      continue;
    }

    if (character === '"' || character === "'" || character === "`") {
      quote = character;
      continue;
    }

    if (character === "[") squareDepth += 1;
    if (character === "]") squareDepth -= 1;
    if (character === "{") curlyDepth += 1;
    if (character === "}") curlyDepth -= 1;
    if (character === "(") parenthesisDepth += 1;
    if (character === ")") parenthesisDepth -= 1;

    if (
      character === ";"
      && squareDepth === 0
      && curlyDepth === 0
      && parenthesisDepth === 0
    ) {
      return source.slice(start, index + 1);
    }
  }

  throw new Error(`常數宣告不完整：${name}`);
}

const definitions = [
  extractConst("INCOME_TAX_BRACKETS_115"),
  extractFunction("hasSalaryDeduction"),
  extractFunction("estimateIncomeTax"),
  extractFunction("applyAnnualChange"),
  extractFunction("roundUp"),
  extractFunction("clamp"),
  extractFunction("coverageEquivalent"),
  extractFunction("safeRatio"),
  extractFunction("annualCycleMultiplier"),
  extractFunction("periodicContributionFutureValue"),
].join("\n\n");

const context = vm.createContext({ Math, Number, Infinity });
vm.runInContext(`${definitions}\nthis.api = {
  hasSalaryDeduction,
  estimateIncomeTax,
  applyAnnualChange,
  roundUp,
  clamp,
  coverageEquivalent,
  safeRatio,
  annualCycleMultiplier,
  periodicContributionFutureValue,
};`, context);

const {
  hasSalaryDeduction,
  estimateIncomeTax,
  applyAnnualChange,
  roundUp,
  clamp,
  coverageEquivalent,
  safeRatio,
  annualCycleMultiplier,
  periodicContributionFutureValue,
} = context.api;

function approx(actual, expected, tolerance = 1e-8) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `預期 ${expected}，實際為 ${actual}`,
  );
}

test("薪資所得扣除額只套用於薪資與計畫制", () => {
  assert.equal(hasSalaryDeduction("salary"), true);
  assert.equal(hasSalaryDeduction("project"), true);
  assert.equal(hasSalaryDeduction("annual"), false);
  assert.equal(hasSalaryDeduction("consulting"), false);
});

test("115 年簡化所得稅：單身薪資所得案例", () => {
  const input = { maritalStatus: "single", dependentsCount: 0 };
  assert.equal(estimateIncomeTax(720000, 0, input, "salary"), 12800);
});

test("115 年簡化所得稅：副業不重複使用薪資扣除額", () => {
  const input = { maritalStatus: "single", dependentsCount: 0 };
  assert.equal(estimateIncomeTax(720000, 200000, input, "salary"), 22800);
});

test("115 年簡化所得稅：非薪資收入不套用薪資扣除額", () => {
  const input = { maritalStatus: "single", dependentsCount: 0 };
  assert.equal(estimateIncomeTax(720000, 0, input, "annual"), 24150);
});

test("零所得稅與家庭免稅額邊界", () => {
  const input = { maritalStatus: "married", dependentsCount: 2 };
  assert.equal(estimateIncomeTax(300000, 0, input, "salary"), 0);
});

test("單利、複利與 -100% 成長率", () => {
  approx(applyAnnualChange(100, 10, 2, "compound"), 121);
  approx(applyAnnualChange(100, 10, 2, "simple"), 120);
  approx(applyAnnualChange(100, -100, 8, "compound"), 0);
});

test("保障給付約當換算", () => {
  const input = { ltcYears: 8 };
  assert.equal(coverageEquivalent({ amount: 3000, unit: "daily" }, input), 540000);
  assert.equal(coverageEquivalent({ amount: 50000, unit: "monthly" }, input), 4800000);
  assert.equal(coverageEquivalent({ amount: 50000, unit: "perEvent" }, input), 150000);
  assert.equal(coverageEquivalent({ amount: 1000000, unit: "lump" }, input), 1000000);
});

test("財務比率安全除法", () => {
  assert.equal(safeRatio(0, 0), 0);
  assert.equal(safeRatio(1, 0), null);
  assert.equal(safeRatio(25, 100), 25);
});

test("定期投入週期與零報酬終值", () => {
  assert.equal(annualCycleMultiplier("monthly"), 12);
  assert.equal(annualCycleMultiplier("quarterly"), 4);
  assert.equal(annualCycleMultiplier("annual"), 1);
  assert.equal(periodicContributionFutureValue(1000, 0, "monthly"), 12000);
});

test("定期投入正報酬終值高於本金總和", () => {
  const futureValue = periodicContributionFutureValue(1000, 12, "monthly");
  assert.ok(futureValue > 12000);
  assert.ok(futureValue < 14000);
});

test("向上取整與上下限", () => {
  assert.equal(roundUp(100001, 100000), 200000);
  assert.equal(clamp(5, 10, 20), 10);
  assert.equal(clamp(25, 10, 20), 20);
  assert.equal(clamp(15, 10, 20), 15);
});
