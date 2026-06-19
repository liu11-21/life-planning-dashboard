const CATEGORY_DEFS = [
  { key: "death", label: "身故保障", short: "身故" },
  { key: "accident", label: "意外失能", short: "意外" },
  { key: "medical", label: "醫療日額", short: "醫療" },
  { key: "cancer", label: "癌症一次金", short: "癌症" },
  { key: "critical", label: "重大傷病", short: "重傷" },
  { key: "ltc", label: "長照月給付", short: "長照" }
];

const BENEFIT_TYPES = {
  death: ["身故保險金", "完全失能保險金"],
  accident: ["意外身故", "意外失能", "骨折給付", "意外住院日額"],
  medical: ["住院日額", "實支實付限額", "住院手術", "門診手術"],
  cancer: ["初次罹癌一次金", "癌症住院日額", "癌症手術"],
  critical: ["重大傷病一次金", "重大疾病一次金"],
  ltc: ["長照月給付", "長照一次金", "保費豁免"]
};

const BENEFIT_UNITS = [
  { key: "lump", label: "一次給付" },
  { key: "daily", label: "每日給付" },
  { key: "monthly", label: "每月給付" },
  { key: "perEvent", label: "每次給付" }
];

const LIFE_STAGE_PRIORITIES = {
  single: "醫療保障、意外失能",
  newlywed: "身故保障、醫療保障",
  children: "身故保障、意外失能、醫療保障",
  middle: "重大傷病、意外失能、長期照顧",
  preRetirement: "長期照顧、醫療保障"
};

const INCOME_TAX_BRACKETS_115 = [
  { ceiling: 610000, rate: 0.05, deduction: 0 },
  { ceiling: 1380000, rate: 0.12, deduction: 42700 },
  { ceiling: 2770000, rate: 0.20, deduction: 153100 },
  { ceiling: 5190000, rate: 0.30, deduction: 430100 },
  { ceiling: Infinity, rate: 0.40, deduction: 949100 }
];

const VEHICLE_LICENSE_TAX = [
  [500, 1620], [600, 2160], [1200, 4320], [1800, 7120], [2400, 11230],
  [3000, 15210], [4200, 28220], [5400, 46170], [6600, 69690], [7800, 117000],
  [Infinity, 151200]
];

const VEHICLE_ROAD_FEE = [
  [500, 2160], [600, 2880], [1200, 4320], [1800, 4800], [2400, 6180],
  [3000, 7200], [3600, 8640], [4200, 9810], [4800, 11220], [5400, 12180],
  [6000, 13080], [6600, 13950], [7200, 14910], [7800, 15720], [8400, 16560],
  [9000, 17430], [9600, 18300], [10200, 19170], [Infinity, 20100]
];

const INPUT_IDS = [
  "currentAge",
  "annualIncome",
  "monthlyLivingExpense",
  "dependentsCount",
  "dependentSupportYears",
  "assets",
  "incomeGrowth",
  "inflation",
  "returnRate",
  "medicalDaily",
  "accidentTarget",
  "cancerTarget",
  "criticalTarget",
  "ltcMonthly",
  "ltcYears"
];

const DATE_IDS = ["planStartDate", "incomeStartDate", "incomeEndDate"];

const DESCRIPTION_IDS = [
  "deathDescription",
  "accidentDescription",
  "medicalDescription",
  "cancerDescription",
  "criticalDescription",
  "ltcDescription"
];

const STORAGE_KEY = "protection-planner-v1";

const samplePolicies = [
  {
    name: "CV4 醫療附約",
    premium: 6095,
    startAge: 24,
    endAge: 80,
    note: "現階段醫療保障基礎",
    benefits: [
      { category: "medical", type: "住院日額", amount: 3000, unit: "daily" },
      { category: "medical", type: "實支實付限額", amount: 300000, unit: "lump" },
      { category: "medical", type: "住院手術", amount: 50000, unit: "perEvent" }
    ]
  },
  {
    name: "L66 手術醫療",
    premium: 8720,
    startAge: 24,
    endAge: 99,
    note: "補手術與住院保障",
    benefits: [
      { category: "medical", type: "住院日額", amount: 1000, unit: "daily" },
      { category: "medical", type: "住院手術", amount: 100000, unit: "perEvent" }
    ]
  },
  {
    name: "ZCO 重大傷病",
    category: "critical",
    coverage: 1000000,
    premium: 42800,
    startAge: 24,
    endAge: 44,
    note: "職涯前期優先補足"
  },
  {
    name: "CFU 癌症一次金",
    category: "cancer",
    coverage: 2000000,
    premium: 2160,
    startAge: 24,
    endAge: 80,
    note: "一次金支應治療與停工"
  },
  {
    name: "XB7 意外失能",
    category: "accident",
    coverage: 2000000,
    premium: 2500,
    startAge: 24,
    endAge: 75,
    note: "工作期間的失能風險"
  },
  {
    name: "XJ2 骨折意外",
    category: "accident",
    coverage: 1000000,
    premium: 4900,
    startAge: 24,
    endAge: 75,
    note: "補強意外保障"
  },
  {
    name: "VSC 長照規劃",
    premium: 36000,
    startAge: 30,
    endAge: 94,
    note: "30歲收入穩定後加入",
    benefits: [
      { category: "ltc", type: "長照月給付", amount: 30000, unit: "monthly" },
      { category: "ltc", type: "長照一次金", amount: 300000, unit: "lump" },
      { category: "ltc", type: "保費豁免", amount: 36000, unit: "lump" }
    ]
  },
  {
    name: "FG1 未來醫療",
    category: "medical",
    coverage: 2000,
    premium: 45468,
    startAge: 32,
    endAge: 62,
    note: "32歲後補高額醫療"
  },
  {
    name: "DX4 定期壽險",
    category: "death",
    coverage: 1000000,
    premium: 7200,
    startAge: 42,
    endAge: 62,
    note: "房貸與家庭責任期加入"
  }
];

let policies = [];
let projection = [];
let financeStages = [];
let expenseItems = [];
let investments = [];
let heldAssets = [];
let debtItems = [];
let expandedPolicyIds = new Set();
let expandedResourceIds = new Set();
let chartHoverActive = false;
let lastRecommendations = {};
let editorType = "";
let editorIndex = null;
let editorDraft = null;

function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function addYearsToIso(dateString, years) {
  const date = dateString ? new Date(`${dateString}T12:00:00`) : new Date();
  date.setFullYear(date.getFullYear() + years);
  return isoDate(date);
}

function ensureDateDefaults() {
  const today = isoDate(new Date());
  if (!document.getElementById("planStartDate").value) document.getElementById("planStartDate").value = today;
  if (!document.getElementById("incomeStartDate").value) document.getElementById("incomeStartDate").value = today;
}

function dateForAge(age, input) {
  return addYearsToIso(input.planStartDate, age - input.currentAge);
}

function isDateActive(date, startDate, endDate) {
  return (!startDate || date >= startDate) && (!endDate || date <= endDate);
}

function ageToDate(age) {
  const input = readInputs();
  return addYearsToIso(input.planStartDate, Number(age) - input.currentAge);
}

function dateToAge(dateString, input) {
  if (!dateString) return null;
  return input.currentAge
    + new Date(dateString).getFullYear()
    - new Date(input.planStartDate).getFullYear();
}

function defaultUnit(category, type = "") {
  if (category === "ltc" && type.includes("月")) return "monthly";
  if ((category === "medical" || category === "cancer" || category === "accident") && type.includes("日額")) return "daily";
  if (type.includes("手術") || type.includes("骨折")) return "perEvent";
  return "lump";
}

function normalizePolicies(list) {
  return list.map((source) => {
    const policy = { ...source, id: source.id || makeId("policy") };
    policy.contractType = source.contractType === "rider" ? "rider" : "main";
    policy.parentId = policy.contractType === "rider" ? (source.parentId || "") : "";
    policy.premiumMode = source.premiumMode === "stepped" ? "stepped" : "level";
    policy.premiumSchedule = Array.isArray(source.premiumSchedule)
      ? source.premiumSchedule.map((period) => ({
          id: period.id || makeId("premium"),
          startAge: Number(period.startAge) || policy.startAge || 18,
          endAge: Number(period.endAge) || policy.endAge || 100,
          annualPremium: Number(period.annualPremium) || 0
        }))
      : [];
    if (!Array.isArray(policy.benefits) || policy.benefits.length === 0) {
      const category = policy.category || "death";
      const type = BENEFIT_TYPES[category][0];
      policy.benefits = [{
        id: makeId("benefit"),
        category,
        type,
        amount: Number(policy.coverage) || 0,
        unit: defaultUnit(category, type)
      }];
    } else {
      policy.benefits = policy.benefits.map((benefit) => ({
        ...benefit,
        id: benefit.id || makeId("benefit"),
        amount: Number(benefit.amount) || 0,
        type: benefit.type || BENEFIT_TYPES[benefit.category || "death"][0],
        unit: benefit.unit || defaultUnit(benefit.category || "death", benefit.type || "")
      }));
    }
    delete policy.category;
    delete policy.coverage;
    return policy;
  });
}

function numberValue(id) {
  const value = Number(document.getElementById(id).value);
  return Number.isFinite(value) ? value : 0;
}

function readInputs() {
  const values = {};
  INPUT_IDS.forEach((id) => {
    values[id] = numberValue(id);
  });
  values.currentAge = Math.max(18, Math.min(80, values.currentAge));
  DATE_IDS.forEach((id) => {
    values[id] = document.getElementById(id).value;
  });
  values.maritalStatus = document.getElementById("maritalStatus").value;
  return values;
}

function readDescriptions() {
  return Object.fromEntries(
    DESCRIPTION_IDS.map((id) => [id, document.getElementById(id).value.trim()])
  );
}

function blankPolicy() {
  const currentAge = numberValue("currentAge") || 24;
  return {
    id: makeId("policy"),
    name: "新增規劃項目",
    contractType: "main",
    parentId: "",
    premiumMode: "level",
    premiumSchedule: [],
    premium: 0,
    startAge: currentAge,
    endAge: 80,
    note: "",
    benefits: [{
      id: makeId("benefit"),
      category: "death",
      type: "身故保險金",
      amount: 1000000,
      unit: "lump"
    }]
  };
}

function blankFinanceStage() {
  const input = readInputs();
  const startDate = addYearsToIso(input.planStartDate, 3);
  return {
    id: makeId("stage"),
    name: "升遷／轉職規劃",
    startDate,
    endDate: addYearsToIso(startDate, 4),
    annualIncome: Math.round(input.annualIncome * 1.2),
    extraMonthlyExpense: 0,
    incomeGrowth: input.incomeGrowth,
    note: ""
  };
}

function normalizeFinanceStages(list) {
  return list.map((stage) => ({
    id: stage.id || makeId("stage"),
    name: stage.name || "未命名階段",
    startDate: stage.startDate || ageToDate(stage.startAge || readInputs().currentAge),
    endDate: stage.endDate || ageToDate(stage.endAge || 100),
    annualIncome: Number(stage.annualIncome) || 0,
    extraMonthlyExpense: Number(stage.extraMonthlyExpense)
      || (Number(stage.extraAnnualExpense ?? stage.annualExpense) || 0) / 12,
    incomeGrowth: Number(stage.incomeGrowth) || 0,
    note: stage.note || ""
  }));
}

function blankExpenseItem() {
  return { id: makeId("expense"), name: "生活支出", monthlyAmount: 0 };
}

function blankInvestment() {
  const input = readInputs();
  return {
    id: makeId("investment"),
    name: "新增投資項目",
    lumpSum: 0,
    recurringAmount: 0,
    cycle: "monthly",
    returnRate: input.returnRate,
    startDate: input.planStartDate,
    endDate: ""
  };
}

function blankResource(kind) {
  const input = readInputs();
  return {
    id: makeId(kind),
    name: kind === "asset" ? "新增持有資產" : "新增負債",
    type: kind === "asset" ? "房地產" : "房貸",
    value: 0,
    annualGrowthRate: kind === "asset" ? 2 : 0,
    taxCategory: "none",
    vehicleCC: 1800,
    houseTaxBase: 0,
    houseTaxRate: 1.2,
    interestRate: kind === "debt" ? 2.2 : 0,
    loanYears: kind === "debt" ? 30 : 0,
    monthlyPayment: 0,
    startDate: input.planStartDate,
    endDate: "",
    note: "",
    costs: []
  };
}

function normalizeExpenseItems(list) {
  return list.map((item) => ({
    id: item.id || makeId("expense"),
    name: item.name || "生活支出",
    monthlyAmount: Number(item.monthlyAmount) || 0
  }));
}

function normalizeInvestments(list) {
  return list.map((item) => ({
    id: item.id || makeId("investment"),
    name: item.name || "未命名投資",
    lumpSum: Number(item.lumpSum) || 0,
    recurringAmount: Number(item.recurringAmount) || 0,
    cycle: ["monthly", "quarterly", "yearly"].includes(item.cycle) ? item.cycle : "monthly",
    returnRate: Number(item.returnRate) || 0,
    startDate: item.startDate || readInputs().planStartDate,
    endDate: item.endDate || ""
  }));
}

function normalizeResources(list, kind) {
  return list.map((item) => ({
    id: item.id || makeId(kind),
    name: item.name || (kind === "asset" ? "未命名資產" : "未命名負債"),
    type: item.type || (kind === "asset" ? "其他資產" : "其他負債"),
    value: Number(item.value ?? item.balance) || 0,
    annualGrowthRate: kind === "asset" ? Number(item.annualGrowthRate) || 0 : 0,
    taxCategory: kind === "asset"
      ? (item.taxCategory || (/車/.test(item.type || "") ? "vehicle" : /房|不動產/.test(item.type || "") ? "house" : "none"))
      : "none",
    vehicleCC: kind === "asset" ? Number(item.vehicleCC) || 1800 : 0,
    houseTaxBase: kind === "asset" ? Number(item.houseTaxBase) || 0 : 0,
    houseTaxRate: kind === "asset" ? Number(item.houseTaxRate) || 1.2 : 0,
    interestRate: kind === "debt" ? Number(item.interestRate) || 0 : 0,
    loanYears: kind === "debt" ? Number(item.loanYears) || 0 : 0,
    monthlyPayment: kind === "debt" ? Number(item.monthlyPayment) || 0 : 0,
    startDate: item.startDate || readInputs().planStartDate,
    endDate: item.endDate || "",
    note: item.note || "",
    costs: Array.isArray(item.costs) ? item.costs.map((cost) => ({
      id: cost.id || makeId("cost"),
      name: cost.name || "年度支出",
      annualAmount: Number(cost.annualAmount) || 0
    })) : []
  }));
}

function calculateMonthlyLoanPayment(principal, annualRate, years) {
  const months = Math.max(0, Math.round(Number(years) * 12));
  const amount = Math.max(0, Number(principal) || 0);
  if (!months || !amount) return 0;
  const monthlyRate = Math.max(0, Number(annualRate) || 0) / 1200;
  if (!monthlyRate) return amount / months;
  const factor = Math.pow(1 + monthlyRate, months);
  return amount * monthlyRate * factor / (factor - 1);
}

function monthsBetween(startDate, targetDate) {
  if (!startDate || !targetDate) return 0;
  const start = new Date(`${startDate}T12:00:00`);
  const target = new Date(`${targetDate}T12:00:00`);
  return Math.max(0, (target.getFullYear() - start.getFullYear()) * 12 + target.getMonth() - start.getMonth());
}

function debtBalanceAtDate(item, date) {
  if (!isDateActive(date, item.startDate, item.endDate)) return 0;
  const principal = Math.max(0, Number(item.value) || 0);
  const payment = Math.max(0, Number(item.monthlyPayment) || 0);
  const elapsedMonths = monthsBetween(item.startDate, date);
  if (!payment || !elapsedMonths) return principal;
  const monthlyRate = Math.max(0, Number(item.interestRate) || 0) / 1200;
  if (!monthlyRate) return Math.max(0, principal - payment * elapsedMonths);
  const factor = Math.pow(1 + monthlyRate, elapsedMonths);
  return Math.max(0, principal * factor - payment * (factor - 1) / monthlyRate);
}

function debtPaymentForYear(item, date) {
  let balance = debtBalanceAtDate(item, date);
  const payment = Math.max(0, Number(item.monthlyPayment) || 0);
  if (!balance || !payment) return 0;
  const monthlyRate = Math.max(0, Number(item.interestRate) || 0) / 1200;
  let total = 0;
  for (let month = 0; month < 12 && balance > 0; month += 1) {
    const amountDue = balance * (1 + monthlyRate);
    const paid = Math.min(payment, amountDue);
    balance = Math.max(0, amountDue - paid);
    total += paid;
  }
  return total;
}

function estimateIncomeTax(income, input) {
  const annualIncome = Math.max(0, Number(income) || 0);
  if (!annualIncome) return 0;
  const spouseCount = input.maritalStatus === "married" ? 1 : 0;
  const familyMembers = 1 + spouseCount + Math.max(0, Math.floor(input.dependentsCount));
  const exemption = familyMembers * 101000;
  const standardDeduction = spouseCount ? 272000 : 136000;
  const salaryDeduction = Math.min(227000, annualIncome);
  const taxableIncome = Math.max(0, annualIncome - exemption - standardDeduction - salaryDeduction);
  const bracket = INCOME_TAX_BRACKETS_115.find((item) => taxableIncome <= item.ceiling);
  return Math.max(0, taxableIncome * bracket.rate - bracket.deduction);
}

function tableAmount(value, table) {
  const numericValue = Math.max(0, Number(value) || 0);
  return table.find(([ceiling]) => numericValue <= ceiling)?.[1] || 0;
}

function annualAssetTax(item) {
  if (item.taxCategory === "vehicle") {
    return tableAmount(item.vehicleCC, VEHICLE_LICENSE_TAX)
      + tableAmount(item.vehicleCC, VEHICLE_ROAD_FEE);
  }
  if (item.taxCategory === "house") {
    return Math.max(0, Number(item.houseTaxBase) || 0) * Math.max(0, Number(item.houseTaxRate) || 0) / 100;
  }
  return 0;
}

function assetTaxAtDate(item, date) {
  return isDateActive(date, item.startDate, item.endDate) ? annualAssetTax(item) : 0;
}

function assetValueAtDate(item, date) {
  if (!isDateActive(date, item.startDate, item.endDate)) return 0;
  const yearsHeld = monthsBetween(item.startDate, date) / 12;
  const growthRate = Math.max(-100, Number(item.annualGrowthRate) || 0) / 100;
  return Math.max(0, item.value * Math.pow(1 + growthRate, yearsHeld));
}

function annualExpenseAtDate(date, input, income = 0) {
  const baseYear = Math.max(0, new Date(date).getFullYear() - new Date(input.planStartDate).getFullYear());
  const inflationFactor = Math.pow(1 + input.inflation / 100, baseYear);
  const livingExpense = input.monthlyLivingExpense * 12 * inflationFactor;
  const resourceExpense = [...heldAssets, ...debtItems]
    .filter((item) => isDateActive(date, item.startDate, item.endDate))
    .flatMap((item) => item.costs)
    .reduce((sum, cost) => sum + cost.annualAmount, 0);
  const debtRepayment = debtItems.reduce((sum, item) => sum + debtPaymentForYear(item, date), 0);
  const incomeTax = estimateIncomeTax(income, input);
  const assetTax = heldAssets.reduce((sum, item) => sum + assetTaxAtDate(item, date), 0);
  return {
    total: livingExpense + resourceExpense + debtRepayment + incomeTax + assetTax,
    tax: incomeTax + assetTax,
    incomeTax,
    assetTax
  };
}

function financialAtAge(age, input) {
  const date = dateForAge(age, input);
  const baseYear = age - input.currentAge;
  const activeStage = financeStages.filter(
    (stage) => isDateActive(date, stage.startDate, stage.endDate)
  ).at(-1);
  if (activeStage) {
    const stageYear = Math.max(0, new Date(date).getFullYear() - new Date(activeStage.startDate).getFullYear());
    const income = activeStage.annualIncome * Math.pow(1 + activeStage.incomeGrowth / 100, stageYear);
    const expenses = annualExpenseAtDate(date, input, income);
    const stageExtraExpense = activeStage.extraMonthlyExpense * 12
      * Math.pow(1 + input.inflation / 100, stageYear);
    return {
      date,
      income,
      expense: expenses.total + stageExtraExpense,
      tax: expenses.tax,
      incomeTax: expenses.incomeTax,
      assetTax: expenses.assetTax,
      stageId: activeStage.id,
      stageName: activeStage.name
    };
  }

  const income = isDateActive(date, input.incomeStartDate, input.incomeEndDate)
    ? input.annualIncome * Math.pow(1 + input.incomeGrowth / 100, baseYear)
    : 0;
  const expenses = annualExpenseAtDate(date, input, income);
  return {
    date,
    income,
    expense: expenses.total,
    tax: expenses.tax,
    incomeTax: expenses.incomeTax,
    assetTax: expenses.assetTax,
    stageId: null,
    stageName: "目前基準"
  };
}

function estimateStageAnnualExpense(stage) {
  const input = readInputs();
  const startDate = stage.startDate || input.planStartDate;
  const income = Math.max(0, Number(stage.annualIncome) || 0);
  const expenses = annualExpenseAtDate(startDate, input, income);
  const estimatedAge = Math.min(100, Math.max(
    input.currentAge,
    input.currentAge + Math.floor(monthsBetween(input.planStartDate, startDate) / 12)
  ));
  const premium = activePoliciesAt(estimatedAge)
    .reduce((sum, policy) => sum + premiumAtAge(policy, estimatedAge), 0);
  const extraExpense = Math.max(0, Number(stage.extraMonthlyExpense) || 0) * 12;
  return {
    total: expenses.total + premium + extraExpense,
    tax: expenses.tax,
    premium
  };
}

function roundUp(value, step) {
  return Math.ceil(value / step) * step;
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function calculateRecommendations() {
  const input = readInputs();
  const financial = financialAtAge(input.currentAge, input);
  const monthlyExpense = financial.expense / 12;
  const currentNeeds = needsAtAge(input.currentAge, input, financial);
  return {
    death: roundUp(currentNeeds.death, 100000),
    accidentTarget: roundUp(financial.income * 5, 100000),
    medicalDaily: roundUp(Math.max(3000, monthlyExpense / 30), 500),
    cancerTarget: roundUp(clamp(financial.income * 2, 1000000, 3000000), 100000),
    criticalTarget: roundUp(clamp(financial.income * 1.5, 1000000, 3000000), 100000),
    ltcMonthly: roundUp(clamp(monthlyExpense * 2, 50000, 150000), 5000)
  };
}

function renderRecommendations() {
  lastRecommendations = calculateRecommendations();
  const lifeStage = document.getElementById("lifeStage").value;
  document.getElementById("stagePriority").textContent = LIFE_STAGE_PRIORITIES[lifeStage];
  document.getElementById("deathRecommendation").textContent = formatMoney(lastRecommendations.death, true);
  document.getElementById("accidentRecommendation").textContent = formatMoney(lastRecommendations.accidentTarget, true);
  document.getElementById("medicalRecommendation").textContent = `${formatMoney(lastRecommendations.medicalDaily)}/日`;
  document.getElementById("cancerRecommendation").textContent = formatMoney(lastRecommendations.cancerTarget, true);
  document.getElementById("criticalRecommendation").textContent = formatMoney(lastRecommendations.criticalTarget, true);
  document.getElementById("ltcRecommendation").textContent = `${formatMoney(lastRecommendations.ltcMonthly, true)}/月`;
  const input = readInputs();
  const familyLabel = input.maritalStatus === "married" ? "已婚" : "單身";
  const dependentLabel = input.dependentsCount > 0
    ? `${Math.floor(input.dependentsCount)} 位受扶養人，預計 ${Math.floor(input.dependentSupportYears)} 年`
    : "無受扶養人";
  document.getElementById("familyResponsibilitySummary").textContent = `${familyLabel}｜${dependentLabel}`;
}

function renderComputedExpense() {
  const input = readInputs();
  const financial = financialAtAge(input.currentAge, input);
  const premium = activePoliciesAt(input.currentAge).reduce(
    (sum, policy) => sum + premiumAtAge(policy, input.currentAge),
    0
  );
  document.getElementById("computedAnnualExpense").textContent = formatMoney(financial.expense + premium);
  document.getElementById("computedAnnualTax").textContent = formatMoney(financial.tax);
}

function activePoliciesAt(age) {
  return policies.filter((policy) => age >= policy.startAge && age <= policy.endAge);
}

function premiumAtAge(policy, age) {
  if (policy.premiumMode !== "stepped") return policy.premium;
  const period = policy.premiumSchedule.filter(
    (item) => age >= item.startAge && age <= item.endAge
  ).at(-1);
  return period ? period.annualPremium : 0;
}

function coverageEquivalent(benefit, input) {
  if (benefit.unit === "daily") {
    return benefit.amount * 180;
  }
  if (benefit.unit === "monthly") {
    return benefit.amount * 12 * input.ltcYears;
  }
  if (benefit.unit === "perEvent") {
    return benefit.amount * 3;
  }
  return benefit.amount;
}

function needsAtAge(age, input, financial) {
  const year = age - input.currentAge;
  const inflationFactor = Math.pow(1 + input.inflation / 100, year);
  const income = financial.income;
  const debtNeed = debtItems
    .reduce((sum, item) => sum + debtBalanceAtDate(item, financial.date), 0);
  const supportYearsRemaining = Math.max(0, input.dependentSupportYears - year);
  const activeDependents = supportYearsRemaining > 0 ? Math.max(0, Math.floor(input.dependentsCount)) : 0;
  const annualFamilyLiving = input.monthlyLivingExpense * 12 * inflationFactor;
  let responsibilityNeed;
  if (activeDependents > 0) {
    responsibilityNeed = Math.max(income * 5, annualFamilyLiving * supportYearsRemaining);
  } else if (input.maritalStatus === "married") {
    responsibilityNeed = Math.max(income * 3, annualFamilyLiving * 5);
  } else {
    responsibilityNeed = annualFamilyLiving * 2;
  }
  const deathNeed = responsibilityNeed + debtNeed;
  const accidentStep = income > 0 ? 1 : age < 80 ? 0.55 : 0.25;

  return {
    death: deathNeed,
    accident: input.accidentTarget * inflationFactor * accidentStep,
    medical: input.medicalDaily * inflationFactor * 180,
    cancer: input.cancerTarget * inflationFactor,
    critical: input.criticalTarget * inflationFactor,
    ltc: input.ltcMonthly * inflationFactor * 12 * input.ltcYears
  };
}

function projectPlan() {
  const input = readInputs();
  let liquidBalance = input.assets;
  const investmentBalances = Object.fromEntries(investments.map((item) => [item.id, 0]));
  const rows = [];

  for (let age = input.currentAge; age <= 100; age += 1) {
    const financial = financialAtAge(age, input);
    const income = financial.income;
    const expense = financial.expense;
    const active = activePoliciesAt(age);
    const premium = active.reduce((sum, policy) => sum + premiumAtAge(policy, age), 0);
    const needs = needsAtAge(age, input, financial);
    const coverage = Object.fromEntries(CATEGORY_DEFS.map((item) => [item.key, 0]));

    active.forEach((policy) => {
      policy.benefits.forEach((benefit) => {
        coverage[benefit.category] += coverageEquivalent(benefit, input);
      });
    });

    const gaps = {};
    CATEGORY_DEFS.forEach((item) => {
      gaps[item.key] = Math.max(0, needs[item.key] - coverage[item.key]);
    });

    const previousDate = age === input.currentAge ? "" : dateForAge(age - 1, input);
    let investmentContribution = 0;
    let investmentLiquidation = 0;
    investments.forEach((item) => {
      const active = isDateActive(financial.date, item.startDate, item.endDate);
      const startsThisYear = active && (!previousDate || previousDate < item.startDate);
      if (active) {
        const cycleMultiplier = item.cycle === "monthly" ? 12 : item.cycle === "quarterly" ? 4 : 1;
        const contribution = item.recurringAmount * cycleMultiplier + (startsThisYear ? item.lumpSum : 0);
        investmentBalances[item.id] = investmentBalances[item.id] * (1 + item.returnRate / 100) + contribution;
        investmentContribution += contribution;
      } else if (investmentBalances[item.id] > 0 && item.endDate && financial.date > item.endDate) {
        investmentLiquidation += investmentBalances[item.id];
        investmentBalances[item.id] = 0;
      }
    });

    liquidBalance = liquidBalance * (1 + input.returnRate / 100)
      + income - expense - premium - investmentContribution + investmentLiquidation;
    const investmentTotal = Object.values(investmentBalances).reduce((sum, value) => sum + value, 0);
    const heldAssetValue = heldAssets
      .reduce((sum, item) => sum + assetValueAtDate(item, financial.date), 0);
    const debtValue = debtItems
      .reduce((sum, item) => sum + debtBalanceAtDate(item, financial.date), 0);
    const netAssets = liquidBalance + investmentTotal + heldAssetValue - debtValue;

    rows.push({
      age,
      date: financial.date,
      income,
      expense,
      tax: financial.tax,
      incomeTax: financial.incomeTax,
      assetTax: financial.assetTax,
      premium,
      assets: netAssets,
      liquidAssets: liquidBalance,
      investmentAssets: investmentTotal,
      heldAssetValue,
      debtValue,
      financeStage: financial.stageName,
      needs,
      coverage,
      gaps,
      totalGap: Object.values(gaps).reduce((sum, value) => sum + value, 0),
      activeCount: active.length
    });
  }

  return rows;
}

function formatMoney(value, compact = false) {
  if (!Number.isFinite(value)) {
    return "0";
  }
  const sign = value < 0 ? "-" : "";
  const absolute = Math.abs(value);
  if (compact && absolute >= 100000000) {
    return `${sign}${(absolute / 100000000).toFixed(1)}億`;
  }
  if (compact && absolute >= 10000) {
    return `${sign}${(absolute / 10000).toFixed(0)}萬`;
  }
  return `${sign}${Math.round(absolute).toLocaleString("zh-TW")}`;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function categoryOptions(selected) {
  return CATEGORY_DEFS.map(
    (item) =>
      `<option value="${item.key}" ${item.key === selected ? "selected" : ""}>${item.label}</option>`
  ).join("");
}

function benefitTypeOptions(category, selected) {
  return BENEFIT_TYPES[category].map(
    (type) => `<option value="${type}" ${type === selected ? "selected" : ""}>${type}</option>`
  ).join("");
}

function benefitUnitOptions(selected) {
  return BENEFIT_UNITS.map(
    (unit) => `<option value="${unit.key}" ${unit.key === selected ? "selected" : ""}>${unit.label}</option>`
  ).join("");
}

function benefitLabel(benefit) {
  const unit = BENEFIT_UNITS.find((item) => item.key === benefit.unit)?.label || "一次給付";
  return `${benefit.type} ${formatMoney(benefit.amount, true)}／${unit}`;
}

function mainPolicyOptions(selected, currentPolicyId) {
  const options = policies
    .filter((policy) => policy.contractType === "main" && policy.id !== currentPolicyId)
    .map((policy) => `<option value="${policy.id}" ${policy.id === selected ? "selected" : ""}>${escapeHtml(policy.name)}</option>`)
    .join("");
  return `<option value="">未指定</option>${options}`;
}

function editorList(type) {
  if (type === "stage") return financeStages;
  if (type === "investment") return investments;
  if (type === "asset") return heldAssets;
  if (type === "debt") return debtItems;
  if (type === "policy") return policies;
  return [];
}

function newEditorDraft(type) {
  if (type === "stage") return blankFinanceStage();
  if (type === "investment") return blankInvestment();
  if (type === "asset") return blankResource("asset");
  if (type === "debt") return blankResource("debt");
  return blankPolicy();
}

function editorTitle(type, isNew) {
  const labels = { stage: "人生階段", investment: "投資項目", asset: "持有資產", debt: "負債", policy: "保單" };
  return `${isNew ? "新增" : "編輯"}${labels[type]}`;
}

function renderStageManager() {
  const items = financeStages.length ? financeStages.map((stage, index) => {
    const estimate = estimateStageAnnualExpense(stage);
    return `
    <section class="entity-summary modal-entity-summary" data-stage-index="${index}">
      <strong>${escapeHtml(stage.name)}</strong>
      <span>${stage.startDate || "-"} 至 ${stage.endDate || "持續"}</span>
      <span>年收入 ${formatMoney(stage.annualIncome, true)}｜額外月支出 ${formatMoney(stage.extraMonthlyExpense, true)}｜系統估算年支出 ${formatMoney(estimate.total, true)}｜稅務 ${formatMoney(estimate.tax, true)}</span>
      <div class="entity-summary-actions">
        <button type="button" class="detail-btn" data-editor-action="edit-stage-modal">編輯</button>
        <button type="button" class="delete-btn" data-editor-action="delete-stage-modal">刪除</button>
      </div>
    </section>`;
  }).join("") : `<p class="empty-list">尚未設定未來階段。</p>`;
  return `<div class="modal-subsection-head">
      <div><strong>人生階段</strong><p class="modal-help">主畫面只顯示第一階段，其餘階段集中在此管理。</p></div>
      <button type="button" class="add-benefit-btn" data-editor-action="add-stage-modal">新增階段</button>
    </div>
    <div class="entity-summary-list">${items}</div>`;
}

function openStageManager() {
  editorType = "stage-list";
  editorIndex = null;
  editorDraft = {};
  document.getElementById("editModalTitle").textContent = "人生階段｜更多編輯";
  document.querySelector('#editModalForm button[type="submit"]').textContent = "完成";
  renderEditorFields();
  document.getElementById("editModal").hidden = false;
  document.body.classList.add("modal-open");
}

function renderSimpleEditor() {
  if (editorType === "stage") {
    const estimate = estimateStageAnnualExpense(editorDraft);
    return `<div class="modal-field-grid">
      <label>階段名稱<input data-draft-field="name" value="${escapeHtml(editorDraft.name)}"></label>
      <label>年收入<input data-draft-field="annualIncome" type="number" min="0" step="10000" value="${editorDraft.annualIncome}"></label>
      <label>開始日<input data-draft-field="startDate" type="date" value="${editorDraft.startDate}"></label>
      <label>結束日<input data-draft-field="endDate" type="date" value="${editorDraft.endDate}"></label>
      <label>收入成長率 %<input data-draft-field="incomeGrowth" type="number" step="0.1" value="${editorDraft.incomeGrowth}"></label>
      <label>每月額外支出<input data-draft-field="extraMonthlyExpense" type="number" min="0" step="any" value="${editorDraft.extraMonthlyExpense}"></label>
      <div class="loan-calculator stage-expense-preview full-field"><span>系統估算年支出 ${formatMoney(estimate.total)}｜月均 ${formatMoney(estimate.total / 12)}｜其中稅務 ${formatMoney(estimate.tax)}</span></div>
      <label class="full-field">文字敘述<textarea data-draft-field="note" rows="3">${escapeHtml(editorDraft.note)}</textarea></label>
    </div>`;
  }
  if (editorType === "investment") {
    return `<div class="modal-field-grid">
      <label>投資項目<input data-draft-field="name" value="${escapeHtml(editorDraft.name)}"></label>
      <label>一次投入<input data-draft-field="lumpSum" type="number" min="0" step="10000" value="${editorDraft.lumpSum}"></label>
      <label>定期定額<input data-draft-field="recurringAmount" type="number" min="0" step="1000" value="${editorDraft.recurringAmount}"></label>
      <label>週期<select data-draft-field="cycle">
        <option value="monthly" ${editorDraft.cycle === "monthly" ? "selected" : ""}>每月</option>
        <option value="quarterly" ${editorDraft.cycle === "quarterly" ? "selected" : ""}>每季</option>
        <option value="yearly" ${editorDraft.cycle === "yearly" ? "selected" : ""}>每年</option>
      </select></label>
      <label>預期年報酬率 %<input data-draft-field="returnRate" type="number" step="0.1" value="${editorDraft.returnRate}"></label>
      <label>開始日<input data-draft-field="startDate" type="date" value="${editorDraft.startDate}"></label>
      <label>結束日<input data-draft-field="endDate" type="date" value="${editorDraft.endDate}"></label>
    </div>`;
  }
  return "";
}

function renderResourceEditor() {
  const costs = editorDraft.costs.length ? editorDraft.costs.map((cost, index) => `
    <div class="annual-cost-row" data-cost-index="${index}">
      <label>支出項目<input data-cost-field="name" value="${escapeHtml(cost.name)}"></label>
      <label>每年金額<input data-cost-field="annualAmount" type="number" min="0" step="1000" value="${cost.annualAmount}"></label>
      <button type="button" class="delete-btn" data-editor-action="delete-cost">刪除細項</button>
    </div>`).join("") : `<p class="empty-list">尚未加入年度預期支出。</p>`;
  const debtFields = editorType === "debt" ? `
      <label>年利率 %<input data-draft-field="interestRate" type="number" min="0" step="any" value="${editorDraft.interestRate}"></label>
      <label>剩餘貸款年限<input data-draft-field="loanYears" type="number" min="0" step="any" value="${editorDraft.loanYears}"></label>
      <label>每月還款額<input data-draft-field="monthlyPayment" type="number" min="0" step="any" value="${editorDraft.monthlyPayment}"></label>
      <div class="loan-calculator full-field">
        <span>依目前餘額、利率與年限試算：每月 ${formatMoney(calculateMonthlyLoanPayment(editorDraft.value, editorDraft.interestRate, editorDraft.loanYears))}</span>
        <button type="button" class="detail-btn" data-editor-action="calculate-debt-payment">套用試算月付</button>
      </div>` : "";
  const assetTaxFields = editorType === "asset" ? `
      <label>自動稅務類型<select data-draft-field="taxCategory">
        <option value="none" ${editorDraft.taxCategory === "none" ? "selected" : ""}>一般資產／不自動計稅</option>
        <option value="vehicle" ${editorDraft.taxCategory === "vehicle" ? "selected" : ""}>自用小客車</option>
        <option value="house" ${editorDraft.taxCategory === "house" ? "selected" : ""}>自住房屋</option>
      </select></label>
      ${editorDraft.taxCategory === "vehicle" ? `<label>汽車排氣量 cc<input data-draft-field="vehicleCC" type="number" min="0" step="1" value="${editorDraft.vehicleCC}"></label>
      <div class="loan-calculator full-field"><span>估算牌照稅與公路養管費：每年 ${formatMoney(annualAssetTax(editorDraft))}</span></div>` : ""}
      ${editorDraft.taxCategory === "house" ? `<label>房屋評定現值<input data-draft-field="houseTaxBase" type="number" min="0" step="any" value="${editorDraft.houseTaxBase}"></label>
      <label>房屋稅率 %<select data-draft-field="houseTaxRate"><option value="1" ${editorDraft.houseTaxRate === 1 ? "selected" : ""}>單一自住 1%</option><option value="1.2" ${editorDraft.houseTaxRate === 1.2 ? "selected" : ""}>自住 1.2%</option></select></label>
      <div class="loan-calculator full-field"><span>估算房屋稅：每年 ${formatMoney(annualAssetTax(editorDraft))}</span></div>` : ""}` : "";
  return `<div class="modal-field-grid">
      <label>項目<input data-draft-field="name" value="${escapeHtml(editorDraft.name)}"></label>
      <label>類型<input data-draft-field="type" value="${escapeHtml(editorDraft.type)}"></label>
      <label>${editorType === "asset" ? "起始估計價值" : "目前貸款餘額"}<input data-draft-field="value" type="number" min="0" step="any" value="${editorDraft.value}"></label>
      ${editorType === "asset" ? `<label>預期年增值率 %<input data-draft-field="annualGrowthRate" type="number" min="-100" step="any" value="${editorDraft.annualGrowthRate}"></label>` : ""}
      ${debtFields}
      ${assetTaxFields}
      <label>開始日<input data-draft-field="startDate" type="date" value="${editorDraft.startDate}"></label>
      <label>結束日<input data-draft-field="endDate" type="date" value="${editorDraft.endDate}"></label>
      <label class="full-field">文字敘述<textarea data-draft-field="note" rows="3">${escapeHtml(editorDraft.note)}</textarea></label>
    </div>
    <div class="modal-subsection">
      <div class="modal-subsection-head"><strong>${editorType === "debt" ? "其他年度支出" : "年度預期支出"}</strong><button type="button" class="add-benefit-btn" data-editor-action="add-cost">新增支出細項</button></div>
      ${costs}
    </div>`;
}

function renderPolicyEditor() {
  const benefits = editorDraft.benefits.length ? editorDraft.benefits.map((benefit, index) => `
    <div class="benefit-row" data-benefit-index="${index}">
      <label>保障大類<select data-benefit-field="category">${categoryOptions(benefit.category)}</select></label>
      <label>給付細項<select data-benefit-field="type">${benefitTypeOptions(benefit.category, benefit.type)}</select></label>
      <label>給付金額<input data-benefit-field="amount" type="number" min="0" step="1000" value="${benefit.amount}"></label>
      <label>給付單位<select data-benefit-field="unit">${benefitUnitOptions(benefit.unit)}</select></label>
      <button type="button" class="delete-btn" data-editor-action="delete-benefit">刪除細項</button>
    </div>`).join("") : `<p class="empty-list">尚未加入保障細項。</p>`;
  const premiumPeriods = editorDraft.premiumMode === "stepped"
    ? (editorDraft.premiumSchedule.length ? editorDraft.premiumSchedule.map((period, index) => `
      <div class="premium-period-row" data-premium-index="${index}">
        <label>起始年齡<input data-premium-field="startAge" type="number" min="0" max="100" value="${period.startAge}"></label>
        <label>結束年齡<input data-premium-field="endAge" type="number" min="0" max="100" value="${period.endAge}"></label>
        <label>年保費<input data-premium-field="annualPremium" type="number" min="0" step="any" value="${period.annualPremium}"></label>
        <button type="button" class="delete-btn" data-editor-action="delete-premium">刪除區間</button>
      </div>`).join("") : `<p class="empty-list">尚未設定保費區間。</p>`)
    : "";
  const riders = editorDraft.contractType === "main"
    ? policies.filter((policy) => policy.contractType === "rider" && policy.parentId === editorDraft.id)
    : [];
  const riderRows = riders.length ? riders.map((rider) => {
    const policyIndex = policies.findIndex((policy) => policy.id === rider.id);
    return `<section class="entity-summary modal-entity-summary" data-policy-index="${policyIndex}">
      <strong>${escapeHtml(rider.name)}</strong>
      <span>${rider.startAge} 至 ${rider.endAge} 歲</span>
      <span>${rider.premiumMode === "stepped" ? "非平準" : "平準"}｜目前年保費 ${formatMoney(premiumAtAge(rider, numberValue("currentAge")))}</span>
      <div class="entity-summary-actions">
        <button type="button" class="detail-btn" data-editor-action="edit-rider">編輯附約</button>
        <button type="button" class="delete-btn" data-editor-action="delete-rider">刪除</button>
      </div>
    </section>`;
  }).join("") : `<p class="empty-list">此主約尚未加入附約。</p>`;
  return `<div class="modal-field-grid">
      <label>保單名稱<input data-draft-field="name" value="${escapeHtml(editorDraft.name)}"></label>
      <label>保單層級<select data-draft-field="contractType" disabled><option value="main" ${editorDraft.contractType === "main" ? "selected" : ""}>主約</option><option value="rider" ${editorDraft.contractType === "rider" ? "selected" : ""}>附約</option></select></label>
      <label>所屬主約<select data-draft-field="parentId" ${editorDraft.contractType === "main" ? "disabled" : ""}>${mainPolicyOptions(editorDraft.parentId, editorDraft.id)}</select></label>
      <label>保費方式<select data-draft-field="premiumMode"><option value="level" ${editorDraft.premiumMode === "level" ? "selected" : ""}>平準</option><option value="stepped" ${editorDraft.premiumMode === "stepped" ? "selected" : ""}>非平準</option></select></label>
      <label>平準年保費<input data-draft-field="premium" type="number" min="0" step="any" value="${editorDraft.premium}" ${editorDraft.premiumMode === "stepped" ? "disabled" : ""}></label>
      <label>起保年齡<input data-draft-field="startAge" type="number" min="0" max="100" value="${editorDraft.startAge}"></label>
      <label>保障到幾歲<input data-draft-field="endAge" type="number" min="0" max="100" value="${editorDraft.endAge}"></label>
      <label class="full-field">規劃重點<textarea data-draft-field="note" rows="3">${escapeHtml(editorDraft.note)}</textarea></label>
    </div>
    <div class="modal-subsection"><div class="modal-subsection-head"><strong>保障給付細項</strong><button type="button" class="add-benefit-btn" data-editor-action="add-benefit">新增給付細項</button></div>${benefits}</div>
    ${editorDraft.premiumMode === "stepped" ? `<div class="modal-subsection"><div class="modal-subsection-head"><strong>非平準保費表</strong><button type="button" class="add-benefit-btn" data-editor-action="add-premium">新增保費區間</button></div>${premiumPeriods}</div>` : ""}
    ${editorDraft.contractType === "main" ? `<div class="modal-subsection"><div class="modal-subsection-head"><div><strong>附約</strong><p class="modal-help">${editorIndex === null ? "請先儲存主約，再回來新增附約。" : "附約只在此主約的二級選單顯示。"}</p></div><button type="button" class="add-benefit-btn" data-editor-action="add-rider" ${editorIndex === null ? "disabled" : ""}>新增附約</button></div><div class="entity-summary-list">${riderRows}</div></div>` : ""}`;
}

function renderEditorFields() {
  const fields = document.getElementById("editModalFields");
  fields.innerHTML = editorType === "stage-list"
    ? renderStageManager()
    : editorType === "policy"
    ? renderPolicyEditor()
    : (editorType === "asset" || editorType === "debt")
      ? renderResourceEditor()
      : renderSimpleEditor();
}

function openEntityEditor(type, index = null) {
  editorType = type;
  editorIndex = index;
  editorDraft = index === null ? newEditorDraft(type) : structuredClone(editorList(type)[index]);
  document.getElementById("editModalTitle").textContent = editorTitle(type, index === null);
  document.querySelector('#editModalForm button[type="submit"]').textContent = "儲存";
  renderEditorFields();
  document.getElementById("editModal").hidden = false;
  document.body.classList.add("modal-open");
}

function openRiderEditor(parentId, index = null) {
  if (index !== null) {
    openEntityEditor("policy", index);
    document.getElementById("editModalTitle").textContent = "編輯附約";
    return;
  }
  editorType = "policy";
  editorIndex = null;
  editorDraft = blankPolicy();
  editorDraft.contractType = "rider";
  editorDraft.parentId = parentId;
  editorDraft.name = "新增附約";
  document.getElementById("editModalTitle").textContent = "新增附約";
  document.querySelector('#editModalForm button[type="submit"]').textContent = "儲存";
  renderEditorFields();
  document.getElementById("editModal").hidden = false;
  document.body.classList.add("modal-open");
}

function closeEntityEditor() {
  document.getElementById("editModal").hidden = true;
  document.body.classList.remove("modal-open");
  editorType = "";
  editorIndex = null;
  editorDraft = null;
}

function commitEntityEditor() {
  const list = editorList(editorType);
  if (editorIndex === null) list.push(structuredClone(editorDraft));
  else list[editorIndex] = structuredClone(editorDraft);
  if (editorType === "stage") renderFinanceStages();
  if (editorType === "investment") renderInvestments();
  if (editorType === "asset" || editorType === "debt") renderResources(editorType);
  if (editorType === "policy") renderPolicies();
  closeEntityEditor();
  recalculate();
}

function renderPremiumSchedule(policy) {
  if (policy.premiumMode !== "stepped") return "";
  const periods = policy.premiumSchedule.length ? policy.premiumSchedule.map((period, periodIndex) => `
    <div class="premium-period-row" data-premium-index="${periodIndex}">
      <label>起始年齡<input data-premium-field="startAge" type="number" min="0" max="100" value="${period.startAge}" aria-label="保費區間起始年齡"></label>
      <label>結束年齡<input data-premium-field="endAge" type="number" min="0" max="100" value="${period.endAge}" aria-label="保費區間結束年齡"></label>
      <label>年保費<input data-premium-field="annualPremium" type="number" min="0" step="any" value="${period.annualPremium}" aria-label="區間年保費"></label>
      <button type="button" class="delete-btn" data-action="delete-premium-period">刪除區間</button>
    </div>
  `).join("") : `<p class="benefit-empty">尚未設定非平準保費區間。</p>`;
  return `
    <div class="premium-schedule-panel">
      <div class="detail-menu-head">
        <strong>非平準保費表</strong>
        <button type="button" class="add-benefit-btn" data-action="add-premium-period">新增保費區間</button>
      </div>
      <div class="premium-period-list">${periods}</div>
    </div>
  `;
}

function renderBenefitMenu(policy, policyIndex) {
  const benefitRows = policy.benefits.length
    ? policy.benefits.map((benefit, benefitIndex) => `
        <div class="benefit-row" data-benefit-index="${benefitIndex}">
          <label>保障大類
            <select data-benefit-field="category" aria-label="保障大類">${categoryOptions(benefit.category)}</select>
          </label>
          <label>給付細項
            <select data-benefit-field="type" aria-label="給付細項">${benefitTypeOptions(benefit.category, benefit.type)}</select>
          </label>
          <label>給付金額
            <input data-benefit-field="amount" type="number" min="0" step="1000" value="${benefit.amount}" aria-label="給付金額">
          </label>
          <label>給付單位
            <select data-benefit-field="unit" aria-label="給付單位">${benefitUnitOptions(benefit.unit)}</select>
          </label>
          <button type="button" class="delete-btn" data-action="delete-benefit" data-benefit-index="${benefitIndex}">刪除細項</button>
        </div>
      `).join("")
    : `<p class="benefit-empty">尚未加入保障細項。</p>`;

  return `
    <tr class="policy-detail-row" data-index="${policyIndex}">
      <td colspan="11">
        <div class="policy-detail-menu">
          <div class="detail-menu-head">
            <strong>${escapeHtml(policy.name)}｜給付細項</strong>
            <button type="button" class="add-benefit-btn" data-action="add-benefit">新增給付細項</button>
          </div>
          <div class="benefit-grid">${benefitRows}</div>
          ${renderPremiumSchedule(policy)}
        </div>
      </td>
    </tr>
  `;
}

function renderPolicies() {
  const currentAge = numberValue("currentAge");
  const rows = document.getElementById("policyRows");
  rows.innerHTML = policies
    .filter((policy) => policy.contractType === "main")
    .map((policy) => {
      const index = policies.findIndex((item) => item.id === policy.id);
      const future = policy.startAge > currentAge;
      const summary = policy.benefits.slice(0, 2).map(benefitLabel).join("<br>");
      const more = policy.benefits.length > 2 ? `<small>另有 ${policy.benefits.length - 2} 項</small>` : "";
      return `
        <tr data-index="${index}">
          <td><strong>${escapeHtml(policy.name)}</strong></td>
          <td><div class="coverage-summary">${summary || "尚無細項"}${more}</div></td>
          <td>${policy.premiumMode === "stepped" ? "非平準" : "平準"}</td>
          <td>${formatMoney(premiumAtAge(policy, currentAge))}</td>
          <td>${policy.startAge}</td>
          <td>${policy.endAge}</td>
          <td><span class="status-pill ${future ? "status-future" : "status-now"}">${future ? "未來" : "現有"}</span></td>
          <td>${escapeHtml(policy.note || "-")}</td>
          <td><div class="row-actions">
            <button type="button" class="detail-btn" data-action="edit-policy">更多編輯</button>
            <button type="button" class="delete-btn" data-action="delete" aria-label="刪除保單">刪除</button>
          </div></td>
        </tr>
      `;
    })
    .join("");
}

function renderInvestments() {
  const container = document.getElementById("investmentRows");
  container.innerHTML = investments.length ? investments.map((item, index) => `
    <tr data-investment-index="${index}">
      <td><strong>${escapeHtml(item.name)}</strong></td>
      <td>${formatMoney(item.lumpSum)}</td>
      <td>${formatMoney(item.recurringAmount)}</td>
      <td>${item.cycle === "monthly" ? "每月" : item.cycle === "quarterly" ? "每季" : "每年"}</td>
      <td>${item.returnRate}%</td>
      <td>${item.startDate || "-"}</td>
      <td>${item.endDate || "持續"}</td>
      <td><div class="row-actions"><button type="button" class="detail-btn" data-action="edit-investment">更多編輯</button><button type="button" class="delete-btn" data-action="delete-investment">刪除</button></div></td>
    </tr>
  `).join("") : `<tr><td colspan="8" class="empty-list">尚未加入投資項目。</td></tr>`;
}

function renderResourceCosts(item, kind, index) {
  const costs = item.costs.length ? item.costs.map((cost, costIndex) => `
    <div class="annual-cost-row" data-cost-index="${costIndex}">
      <label>支出項目<input data-cost-field="name" value="${escapeHtml(cost.name)}" aria-label="年度支出項目"></label>
      <label>每年金額<input data-cost-field="annualAmount" type="number" min="0" step="1000" value="${cost.annualAmount}" aria-label="年度支出金額"></label>
      <button type="button" class="delete-btn" data-action="delete-resource-cost">刪除細項</button>
    </div>
  `).join("") : `<p class="empty-list">尚未加入年度預期支出。</p>`;
  return `
    <div class="resource-detail">
      <div class="detail-menu-head">
        <strong>年度預期支出</strong>
        <button type="button" class="add-benefit-btn" data-action="add-resource-cost">新增支出細項</button>
      </div>
      ${costs}
      <label>文字敘述<textarea data-resource-field="note" rows="2" aria-label="資產負債文字敘述">${escapeHtml(item.note)}</textarea></label>
    </div>
  `;
}

function renderResources(kind) {
  const list = kind === "asset" ? heldAssets : debtItems;
  const container = document.getElementById(kind === "asset" ? "heldAssetRows" : "debtRows");
  if (!list.length) {
    container.innerHTML = `<p class="empty-list">尚未加入${kind === "asset" ? "持有資產" : "負債"}。</p>`;
    return;
  }
  container.className = "resource-list entity-summary-list";
  container.innerHTML = list.map((item, index) => `
    <section class="entity-summary" data-resource-kind="${kind}" data-resource-index="${index}">
      <strong>${escapeHtml(item.name)}</strong>
      <span>${escapeHtml(item.type)}｜${item.startDate || "-"} 至 ${item.endDate || "持續"}</span>
      <span>${kind === "asset" ? `起始價值 ${formatMoney(item.value, true)}｜年增率 ${item.annualGrowthRate}%｜估算年稅 ${formatMoney(annualAssetTax(item), true)}` : `餘額 ${formatMoney(item.value, true)}｜月付 ${formatMoney(item.monthlyPayment)}`}</span>
      <div class="entity-summary-actions"><button type="button" class="detail-btn" data-action="edit-resource">更多編輯</button><button type="button" class="delete-btn" data-action="delete-resource">刪除</button></div>
    </section>`).join("");
}

function renderFinanceStages() {
  const container = document.getElementById("financeStageRows");
  if (!financeStages.length) {
    container.innerHTML = `<p class="finance-stage-empty">尚未設定未來階段。</p>`;
    return;
  }

  container.className = "finance-stage-list entity-summary-list";
  container.innerHTML = financeStages.slice(0, 1).map((stage, index) => {
    const today = readInputs().planStartDate;
    const status = today > stage.endDate ? "已結束" : today >= stage.startDate ? "進行中" : "未來";
    const estimate = estimateStageAnnualExpense(stage);
    return `<section class="entity-summary" data-stage-index="${index}">
      <strong>${escapeHtml(stage.name)}</strong>
      <span>${stage.startDate} 至 ${stage.endDate || "持續"}｜${status}</span>
      <span>年收入 ${formatMoney(stage.annualIncome, true)}｜額外月支出 ${formatMoney(stage.extraMonthlyExpense, true)}｜系統估算年支出 ${formatMoney(estimate.total, true)}｜稅務 ${formatMoney(estimate.tax, true)}</span>
      <div class="entity-summary-actions"><button type="button" class="detail-btn" data-action="edit-stage">編輯第一階段</button></div>
    </section>`;
  }).join("") + (financeStages.length > 1 ? `<button type="button" class="secondary compact-more" data-action="manage-stages">其餘 ${financeStages.length - 1} 個階段｜更多編輯</button>` : "");
}

function renderSummary() {
  const input = readInputs();
  const current = projection[0];
  const worst = projection.reduce(
    (result, row) => (row.totalGap > result.totalGap ? row : result),
    projection[0]
  );
  const depletion = projection.find((row) => row.assets < 0);
  const age100 = projection[projection.length - 1];

  document.getElementById("currentAgeLabel").textContent = input.currentAge;
  document.getElementById("currentGap").textContent = formatMoney(current.totalGap, true);
  document.getElementById("worstAge").textContent = `${worst.age}歲`;
  document.getElementById("depletionAge").textContent = depletion ? `${depletion.age}歲` : "未耗盡";
  document.getElementById("age100Assets").textContent = formatMoney(age100.assets, true);

  const status = document.getElementById("survivalStatus");
  status.textContent = depletion ? `撐到${depletion.age - 1}歲` : "可達100歲";
  status.style.color = depletion ? "#b8463d" : "#166c50";

  const ageSlider = document.getElementById("selectedAge");
  ageSlider.min = input.currentAge;
  if (Number(ageSlider.value) < input.currentAge) {
    ageSlider.value = input.currentAge;
  }
}

function renderAgeTable() {
  const input = readInputs();
  const candidateAges = [
    input.currentAge,
    30,
    40,
    50,
    dateToAge(input.incomeEndDate, input),
    70,
    80,
    90,
    100
  ]
    .filter((age) => age >= input.currentAge && age <= 100)
    .filter((age, index, list) => list.indexOf(age) === index)
    .sort((a, b) => a - b);

  document.getElementById("ageTable").innerHTML = candidateAges
    .map((age) => {
      const row = projection.find((item) => item.age === age);
      const ratio = row.totalGap / Math.max(1, Object.values(row.needs).reduce((a, b) => a + b, 0));
      const riskClass = row.assets < 0 || ratio > 0.7 ? "risk" : ratio > 0.35 ? "warn" : "";
      return `
        <article class="age-item ${riskClass}">
          <span>${age}歲</span>
          <strong>缺口 ${formatMoney(row.totalGap, true)}</strong>
          <small>資產 ${formatMoney(row.assets, true)}｜${row.financeStage}｜${row.activeCount}項保障</small>
        </article>
      `;
    })
    .join("");
}

function setupCanvas(canvas) {
  const ratio = window.devicePixelRatio || 1;
  const width = Math.max(300, canvas.clientWidth);
  const height = Math.max(260, canvas.clientHeight);
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  const context = canvas.getContext("2d");
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);
  return { context, width, height };
}

function drawGrid(context, bounds, yMin, yMax, formatter) {
  context.font = '11px "Microsoft JhengHei", sans-serif';
  context.textAlign = "right";
  context.textBaseline = "middle";
  for (let index = 0; index <= 4; index += 1) {
    const y = bounds.top + ((bounds.bottom - bounds.top) * index) / 4;
    const value = yMax - ((yMax - yMin) * index) / 4;
    context.strokeStyle = "#e3e9e6";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(bounds.left, y);
    context.lineTo(bounds.right, y);
    context.stroke();
    context.fillStyle = "#647276";
    context.fillText(formatter(value), bounds.left - 8, y);
  }
}

function drawLine(context, values, color, bounds, yMin, yMax) {
  context.strokeStyle = color;
  context.lineWidth = 2.5;
  context.lineJoin = "round";
  context.lineCap = "round";
  context.beginPath();
  values.forEach((value, index) => {
    const x = bounds.left + ((bounds.right - bounds.left) * index) / Math.max(1, values.length - 1);
    const y = bounds.bottom - ((value - yMin) / Math.max(1, yMax - yMin)) * (bounds.bottom - bounds.top);
    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  });
  context.stroke();
}

function drawLineChart() {
  const canvas = document.getElementById("lineChart");
  const { context, width, height } = setupCanvas(canvas);
  const bounds = { left: 70, right: width - 18, top: 30, bottom: height - 38 };
  const gapValues = projection.map((row) => row.totalGap);
  const assetValues = projection.map((row) => row.assets);
  const allValues = [...gapValues, ...assetValues, 0];
  let yMin = Math.min(...allValues);
  let yMax = Math.max(...allValues);
  const padding = Math.max(1, (yMax - yMin) * 0.08);
  yMin -= padding;
  yMax += padding;

  drawGrid(context, bounds, yMin, yMax, (value) => formatMoney(value, true));
  drawLine(context, gapValues, "#166c50", bounds, yMin, yMax);
  drawLine(context, assetValues, "#26383d", bounds, yMin, yMax);

  const selectedAge = Number(document.getElementById("selectedAge").value);
  const selectedIndex = Math.max(0, selectedAge - projection[0].age);
  const selectedX =
    bounds.left +
    ((bounds.right - bounds.left) * selectedIndex) / Math.max(1, projection.length - 1);
  if (chartHoverActive) {
    const selectedRow = projection[selectedIndex] || projection[0];
    context.strokeStyle = "#b27716";
    context.lineWidth = 1.5;
    context.setLineDash([5, 4]);
    context.beginPath();
    context.moveTo(selectedX, bounds.top);
    context.lineTo(selectedX, bounds.bottom);
    context.stroke();
    context.setLineDash([]);

    const tooltipWidth = 202;
    const tooltipHeight = 92;
    const tooltipX = selectedX + tooltipWidth + 14 > bounds.right
      ? selectedX - tooltipWidth - 12
      : selectedX + 12;
    const tooltipY = bounds.top + 12;
    context.fillStyle = "rgba(255, 255, 255, 0.97)";
    context.strokeStyle = "#cbd7d3";
    context.lineWidth = 1;
    context.fillRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);
    context.strokeRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);
    context.textAlign = "left";
    context.textBaseline = "top";
    context.fillStyle = "#1e2a2f";
    context.font = '700 13px "Microsoft JhengHei", sans-serif';
    context.fillText(`${selectedRow.age}歲`, tooltipX + 10, tooltipY + 9);
    context.font = '11px "Microsoft JhengHei", sans-serif';
    context.fillStyle = "#166c50";
    context.fillText(`保障缺口 ${formatMoney(selectedRow.totalGap, true)}`, tooltipX + 10, tooltipY + 32);
    context.fillStyle = "#26383d";
    context.fillText(`資產餘額 ${formatMoney(selectedRow.assets, true)}`, tooltipX + 10, tooltipY + 51);
    context.fillStyle = "#647276";
    context.fillText(`階段 ${selectedRow.financeStage}`, tooltipX + 10, tooltipY + 70);
  }

  context.fillStyle = "#647276";
  context.font = '11px "Microsoft JhengHei", sans-serif';
  context.textAlign = "center";
  context.textBaseline = "top";
  const firstAge = projection[0].age;
  [firstAge, 40, 60, 80, 100]
    .filter((age) => age >= firstAge)
    .forEach((age) => {
      const index = age - firstAge;
      const x = bounds.left + ((bounds.right - bounds.left) * index) / Math.max(1, projection.length - 1);
      context.fillText(`${age}歲`, x, bounds.bottom + 10);
    });

  context.textAlign = "left";
  context.textBaseline = "middle";
  context.fillStyle = "#166c50";
  context.fillRect(bounds.left, 8, 18, 3);
  context.fillStyle = "#1e2a2f";
  context.fillText("總保障缺口", bounds.left + 25, 10);
  context.fillStyle = "#26383d";
  context.fillRect(bounds.left + 112, 8, 18, 3);
  context.fillStyle = "#1e2a2f";
  context.fillText("資產餘額", bounds.left + 137, 10);
}

function drawBarChart() {
  const canvas = document.getElementById("barChart");
  const { context, width, height } = setupCanvas(canvas);
  const selectedAge = Number(document.getElementById("selectedAge").value);
  const row = projection.find((item) => item.age === selectedAge) || projection[0];
  const values = CATEGORY_DEFS.map((item) => row.gaps[item.key]);
  const maxValue = Math.max(...values, 1);
  const bounds = { left: 58, right: width - 12, top: 22, bottom: height - 54 };
  const slot = (bounds.right - bounds.left) / values.length;
  const colors = ["#166c50", "#377f8f", "#6b8d5a", "#b27716", "#b8463d", "#765b89"];

  drawGrid(context, bounds, 0, maxValue * 1.1, (value) => formatMoney(value, true));
  values.forEach((value, index) => {
    const barWidth = Math.min(46, slot * 0.58);
    const x = bounds.left + slot * index + (slot - barWidth) / 2;
    const barHeight = (value / (maxValue * 1.1)) * (bounds.bottom - bounds.top);
    const y = bounds.bottom - barHeight;
    context.fillStyle = colors[index];
    context.fillRect(x, y, barWidth, barHeight);
    context.fillStyle = "#1e2a2f";
    context.font = '10px "Microsoft JhengHei", sans-serif';
    context.textAlign = "center";
    context.textBaseline = "bottom";
    context.fillText(formatMoney(value, true), x + barWidth / 2, Math.max(bounds.top + 12, y - 5));
    context.fillStyle = "#647276";
    context.textBaseline = "top";
    context.fillText(CATEGORY_DEFS[index].short, x + barWidth / 2, bounds.bottom + 10);
  });

  document.getElementById("barSubtitle").textContent = `${selectedAge}歲，各保障細項缺口換算。`;
}

function collectState() {
  const inputs = {};
  INPUT_IDS.forEach((id) => {
    inputs[id] = document.getElementById(id).value;
  });
  DATE_IDS.forEach((id) => {
    inputs[id] = document.getElementById(id).value;
  });
  inputs.maritalStatus = document.getElementById("maritalStatus").value;
  return {
    inputs,
    lifeStage: document.getElementById("lifeStage").value,
    descriptions: readDescriptions(),
    financeStages,
    investments,
    heldAssets,
    debtItems,
    policies
  };
}

function setFileStatus(message, type = "") {
  const status = document.getElementById("saveStatus");
  status.textContent = message;
  status.className = `save-status ${type}`.trim();
}

function saveState(showStatus = false) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collectState()));
  if (showStatus) {
    const time = new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" });
    setFileStatus(`已存檔 ${time}`, "success");
  }
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    policies = normalizePolicies(structuredClone(samplePolicies));
    financeStages = [];
    expenseItems = [];
    investments = [];
    heldAssets = [];
    debtItems = [];
    return;
  }
  try {
    const state = JSON.parse(saved);
    if (state.inputs) {
      Object.entries(state.inputs).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
          element.value = value;
        }
      });
    }
    if (state.descriptions) {
      Object.entries(state.descriptions).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.value = value;
      });
    }
    if (state.lifeStage && LIFE_STAGE_PRIORITIES[state.lifeStage]) {
      document.getElementById("lifeStage").value = state.lifeStage;
    }
    policies = normalizePolicies(
      Array.isArray(state.policies) ? state.policies : structuredClone(samplePolicies)
    );
    financeStages = normalizeFinanceStages(
      Array.isArray(state.financeStages) ? state.financeStages : []
    );
    const hasMonthlyLivingExpense = Object.prototype.hasOwnProperty.call(state.inputs || {}, "monthlyLivingExpense");
    const migratedAnnualExpense = Number(state.inputs?.annualExpense) || 0;
    if (!hasMonthlyLivingExpense) {
      const legacyMonthlyExpense = Array.isArray(state.expenseItems)
        ? state.expenseItems.reduce((sum, item) => sum + (Number(item.monthlyAmount) || 0), 0)
        : migratedAnnualExpense / 12;
      document.getElementById("monthlyLivingExpense").value = legacyMonthlyExpense || 35000;
      expenseItems = [];
    } else {
      expenseItems = normalizeExpenseItems(Array.isArray(state.expenseItems) ? state.expenseItems : []);
    }
    investments = normalizeInvestments(Array.isArray(state.investments) ? state.investments : []);
    heldAssets = normalizeResources(Array.isArray(state.heldAssets) ? state.heldAssets : [], "asset");
    const migratedDebt = Number(state.inputs?.debt) || 0;
    debtItems = normalizeResources(
      Array.isArray(state.debtItems)
        ? state.debtItems
        : migratedDebt > 0
          ? [{ name: "既有負債", type: "其他負債", value: migratedDebt, costs: [] }]
          : [],
      "debt"
    );
    setFileStatus("已載入本機存檔", "success");
  } catch {
    policies = normalizePolicies(structuredClone(samplePolicies));
    financeStages = [];
    expenseItems = [];
    investments = [];
    heldAssets = [];
    debtItems = [];
    setFileStatus("本機存檔無法讀取，已載入預設資料", "error");
  }
}

function applyImportedState(state) {
  if (!state || typeof state !== "object") throw new Error("檔案內容不是有效的規劃資料");
  const hasPlanningData = state.inputs || state.policies || state.investments
    || state.heldAssets || state.debtItems || state.expenseItems;
  if (!hasPlanningData) throw new Error("檔案中找不到可匯入的規劃資料");

  if (state.inputs) {
    Object.entries(state.inputs).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.value = value;
    });
  }
  ensureDateDefaults();
  if (state.descriptions) {
    Object.entries(state.descriptions).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.value = value;
    });
  }
  if (state.lifeStage && LIFE_STAGE_PRIORITIES[state.lifeStage]) {
    document.getElementById("lifeStage").value = state.lifeStage;
  }

  policies = normalizePolicies(Array.isArray(state.policies) ? state.policies : []);
  financeStages = normalizeFinanceStages(Array.isArray(state.financeStages) ? state.financeStages : []);
  const hasMonthlyLivingExpense = Object.prototype.hasOwnProperty.call(state.inputs || {}, "monthlyLivingExpense");
  if (!hasMonthlyLivingExpense && Array.isArray(state.expenseItems)) {
    document.getElementById("monthlyLivingExpense").value = state.expenseItems
      .reduce((sum, item) => sum + (Number(item.monthlyAmount) || 0), 0) || 35000;
    expenseItems = [];
  } else {
    expenseItems = normalizeExpenseItems(Array.isArray(state.expenseItems) ? state.expenseItems : []);
  }
  investments = normalizeInvestments(Array.isArray(state.investments) ? state.investments : []);
  heldAssets = normalizeResources(Array.isArray(state.heldAssets) ? state.heldAssets : [], "asset");
  debtItems = normalizeResources(Array.isArray(state.debtItems) ? state.debtItems : [], "debt");
  expandedPolicyIds.clear();
  expandedResourceIds.clear();
  renderPolicies();
  renderFinanceStages();
  renderInvestments();
  renderResources("asset");
  renderResources("debt");
  recalculate();
}

function recalculate() {
  projection = projectPlan();
  renderComputedExpense();
  renderRecommendations();
  renderSummary();
  renderAgeTable();
  drawLineChart();
  drawBarChart();
  saveState();
}

function exportAll() {
  const payload = {
    format: "insurance-planning-complete",
    version: 1,
    exportedAt: new Date().toISOString(),
    state: collectState(),
    projection
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `保障缺口完整規劃_${isoDate(new Date())}.json`;
  link.click();
  URL.revokeObjectURL(url);
  setFileStatus("已匯出完整規劃檔", "success");
}

async function importPlan(file) {
  try {
    const payload = JSON.parse(await file.text());
    applyImportedState(payload.state || payload);
    saveState(true);
    setFileStatus(`已匯入 ${file.name}`, "success");
  } catch (error) {
    setFileStatus(`匯入失敗：${error.message}`, "error");
  }
}

function bindEvents() {
  INPUT_IDS.forEach((id) => {
    document.getElementById(id).addEventListener("input", () => {
      if (id === "currentAge") {
        renderPolicies();
        renderFinanceStages();
      }
      recalculate();
    });
  });

  DATE_IDS.forEach((id) => {
    document.getElementById(id).addEventListener("input", () => {
      renderFinanceStages();
      recalculate();
    });
  });

  document.getElementById("lifeStage").addEventListener("change", recalculate);
  document.getElementById("maritalStatus").addEventListener("change", recalculate);

  document.querySelectorAll("[data-apply-recommendation]").forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.applyRecommendation;
      document.getElementById(targetId).value = lastRecommendations[targetId];
      recalculate();
    });
  });

  DESCRIPTION_IDS.forEach((id) => {
    document.getElementById(id).addEventListener("input", saveState);
  });

  document.getElementById("addFinanceStage").addEventListener("click", () => {
    openStageManager();
  });

  document.getElementById("financeStageRows").addEventListener("input", (event) => {
    const stageElement = event.target.closest("[data-stage-index]");
    const field = event.target.dataset.stageField;
    if (!stageElement || !field) return;
    const stage = financeStages[Number(stageElement.dataset.stageIndex)];
    const numericFields = ["annualIncome", "incomeGrowth"];
    stage[field] = numericFields.includes(field) ? Number(event.target.value) : event.target.value;
    recalculate();
  });

  document.getElementById("financeStageRows").addEventListener("click", (event) => {
    const action = event.target.dataset.action;
    if (action === "manage-stages") {
      openStageManager();
      return;
    }
    const stageElement = event.target.closest("[data-stage-index]");
    if (!action || !stageElement) return;
    const index = Number(stageElement.dataset.stageIndex);
    if (action === "edit-stage") openEntityEditor("stage", index);
    if (action === "delete-stage") {
      financeStages.splice(index, 1);
      renderFinanceStages();
      recalculate();
    }
  });

  document.getElementById("addInvestment").addEventListener("click", () => {
    openEntityEditor("investment");
  });

  document.getElementById("investmentRows").addEventListener("input", (event) => {
    const row = event.target.closest("[data-investment-index]");
    const field = event.target.dataset.investmentField;
    if (!row || !field) return;
    const numericFields = ["lumpSum", "recurringAmount", "returnRate"];
    investments[Number(row.dataset.investmentIndex)][field] = numericFields.includes(field)
      ? Number(event.target.value)
      : event.target.value;
    recalculate();
  });

  document.getElementById("investmentRows").addEventListener("click", (event) => {
    const action = event.target.dataset.action;
    const row = event.target.closest("[data-investment-index]");
    if (!action || !row) return;
    const index = Number(row.dataset.investmentIndex);
    if (action === "edit-investment") openEntityEditor("investment", index);
    if (action === "delete-investment") {
      investments.splice(index, 1);
      renderInvestments();
      recalculate();
    }
  });

  document.getElementById("addHeldAsset").addEventListener("click", () => {
    openEntityEditor("asset");
  });

  document.getElementById("addDebtItem").addEventListener("click", () => {
    openEntityEditor("debt");
  });

  ["heldAssetRows", "debtRows"].forEach((containerId) => {
    const container = document.getElementById(containerId);
    container.addEventListener("input", (event) => {
      const row = event.target.closest("[data-resource-index]");
      if (!row) return;
      const kind = row.dataset.resourceKind;
      const list = kind === "asset" ? heldAssets : debtItems;
      const item = list[Number(row.dataset.resourceIndex)];
      const field = event.target.dataset.resourceField;
      const costField = event.target.dataset.costField;
      if (costField) {
        const costRow = event.target.closest("[data-cost-index]");
        item.costs[Number(costRow.dataset.costIndex)][costField] = costField === "annualAmount"
          ? Number(event.target.value)
          : event.target.value;
      } else if (field) {
        item[field] = field === "value" ? Number(event.target.value) : event.target.value;
      }
      recalculate();
    });

    container.addEventListener("click", (event) => {
      const action = event.target.dataset.action;
      const row = event.target.closest("[data-resource-index]");
      if (!action || !row) return;
      const kind = row.dataset.resourceKind;
      const list = kind === "asset" ? heldAssets : debtItems;
      const index = Number(row.dataset.resourceIndex);
      if (action === "edit-resource") {
        openEntityEditor(kind, index);
        return;
      } else if (action === "delete-resource") {
        list.splice(index, 1);
      } else {
        return;
      }
      renderResources(kind);
      recalculate();
    });
  });

  const lineCanvas = document.getElementById("lineChart");
  lineCanvas.addEventListener("pointermove", (event) => {
    const rect = lineCanvas.getBoundingClientRect();
    const left = 70;
    const right = rect.width - 18;
    const pointerX = Math.max(left, Math.min(right, event.clientX - rect.left));
    const index = Math.round(
      ((pointerX - left) / Math.max(1, right - left)) * Math.max(1, projection.length - 1)
    );
    document.getElementById("selectedAge").value = projection[index].age;
    chartHoverActive = true;
    drawLineChart();
    drawBarChart();
  });
  lineCanvas.addEventListener("pointerleave", () => {
    chartHoverActive = false;
    drawLineChart();
  });

  document.getElementById("addPolicy").addEventListener("click", () => {
    openEntityEditor("policy");
  });

  document.getElementById("loadSample").addEventListener("click", () => {
    policies = normalizePolicies(structuredClone(samplePolicies));
    expandedPolicyIds.clear();
    renderPolicies();
    recalculate();
  });

  document.getElementById("savePlan").addEventListener("click", () => saveState(true));
  document.getElementById("importPlan").addEventListener("click", () => {
    document.getElementById("importFile").click();
  });
  document.getElementById("importFile").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (file) await importPlan(file);
    event.target.value = "";
  });
  document.getElementById("exportAll").addEventListener("click", exportAll);

  document.getElementById("policyRows").addEventListener("input", (event) => {
    const row = event.target.closest("tr[data-index]");
    const field = event.target.dataset.field;
    const benefitField = event.target.dataset.benefitField;
    const premiumField = event.target.dataset.premiumField;
    if (!row || (!field && !benefitField && !premiumField)) {
      return;
    }
    const index = Number(row.dataset.index);
    if (premiumField) {
      const premiumRow = event.target.closest("[data-premium-index]");
      const premiumIndex = Number(premiumRow.dataset.premiumIndex);
      policies[index].premiumSchedule[premiumIndex][premiumField] = Number(event.target.value);
      const currentPremium = document.querySelector(`tr[data-index="${index}"] .premium-current`);
      if (currentPremium) {
        currentPremium.textContent = `目前 ${formatMoney(premiumAtAge(policies[index], numberValue("currentAge")))}`;
      }
    } else if (benefitField) {
      const benefitRow = event.target.closest(".benefit-row");
      const benefitIndex = Number(benefitRow.dataset.benefitIndex);
      const benefit = policies[index].benefits[benefitIndex];
      benefit[benefitField] = benefitField === "amount"
        ? Number(event.target.value)
        : event.target.value;
      if (benefitField === "category") {
        benefit.type = BENEFIT_TYPES[benefit.category][0];
        benefit.unit = defaultUnit(benefit.category, benefit.type);
        renderPolicies();
      } else if (benefitField === "type") {
        benefit.unit = defaultUnit(benefit.category, benefit.type);
        renderPolicies();
      }
    } else {
      const numericFields = ["premium", "startAge", "endAge"];
      policies[index][field] = numericFields.includes(field)
        ? Number(event.target.value)
        : event.target.value;
      if (field === "contractType" && policies[index].contractType === "main") {
        policies[index].parentId = "";
      }
      if (field === "premiumMode" && policies[index].premiumMode === "stepped" && !policies[index].premiumSchedule.length) {
        policies[index].premiumSchedule.push({
          id: makeId("premium"),
          startAge: policies[index].startAge,
          endAge: policies[index].endAge,
          annualPremium: policies[index].premium
        });
      }
    }
    if (field === "startAge" || field === "contractType" || field === "premiumMode") {
      renderPolicies();
    }
    recalculate();
  });

  document.getElementById("policyRows").addEventListener("click", (event) => {
    const action = event.target.dataset.action;
    const row = event.target.closest("tr[data-index]");
    if (!action || !row) return;
    const index = Number(row.dataset.index);
    if (action === "edit-policy") {
      openEntityEditor("policy", index);
      return;
    }
    if (action === "delete") {
      const policyId = policies[index].id;
      policies = policies.filter((policy, policyIndex) => policyIndex !== index && policy.parentId !== policyId);
    } else {
      return;
    }
    renderPolicies();
    recalculate();
  });

  document.getElementById("closeEditModal").addEventListener("click", closeEntityEditor);
  document.querySelectorAll('[data-modal-action="cancel"]').forEach((button) => {
    button.addEventListener("click", closeEntityEditor);
  });

  document.getElementById("editModalForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (editorType === "stage-list") closeEntityEditor();
    else if (editorDraft) commitEntityEditor();
  });

  document.getElementById("editModalFields").addEventListener("input", (event) => {
    if (!editorDraft) return;

    const draftField = event.target.dataset.draftField;
    if (draftField) {
      const numericDraftFields = ["houseTaxRate"];
      editorDraft[draftField] = event.target.type === "number" || numericDraftFields.includes(draftField)
        ? Number(event.target.value)
        : event.target.value;

      if (draftField === "contractType") {
        if (editorDraft.contractType === "main") editorDraft.parentId = "";
        renderEditorFields();
      } else if (draftField === "premiumMode") {
        if (editorDraft.premiumMode === "stepped" && !editorDraft.premiumSchedule.length) {
          editorDraft.premiumSchedule.push({
            id: makeId("premium"),
            startAge: editorDraft.startAge,
            endAge: editorDraft.endAge,
            annualPremium: editorDraft.premium
          });
        }
        renderEditorFields();
      } else if (editorType === "debt" && ["value", "interestRate", "loanYears"].includes(draftField)) {
        const estimate = document.querySelector(".loan-calculator span");
        if (estimate) {
          estimate.textContent = `依目前餘額、利率與年限試算：每月 ${formatMoney(calculateMonthlyLoanPayment(editorDraft.value, editorDraft.interestRate, editorDraft.loanYears))}`;
        }
      } else if (editorType === "asset" && draftField === "taxCategory") {
        renderEditorFields();
      } else if (editorType === "asset" && ["vehicleCC", "houseTaxBase", "houseTaxRate"].includes(draftField)) {
        const estimate = document.querySelector(".loan-calculator span");
        if (estimate) {
          estimate.textContent = `${editorDraft.taxCategory === "vehicle" ? "估算牌照稅與公路養管費" : "估算房屋稅"}：每年 ${formatMoney(annualAssetTax(editorDraft))}`;
        }
      } else if (editorType === "stage" && ["annualIncome", "startDate", "extraMonthlyExpense"].includes(draftField)) {
        const estimate = estimateStageAnnualExpense(editorDraft);
        const preview = document.querySelector(".stage-expense-preview span");
        if (preview) {
          preview.textContent = `系統估算年支出 ${formatMoney(estimate.total)}｜月均 ${formatMoney(estimate.total / 12)}｜其中稅務 ${formatMoney(estimate.tax)}`;
        }
      }
      return;
    }

    const benefitField = event.target.dataset.benefitField;
    if (benefitField) {
      const row = event.target.closest("[data-benefit-index]");
      if (!row) return;
      const benefit = editorDraft.benefits[Number(row.dataset.benefitIndex)];
      benefit[benefitField] = event.target.type === "number"
        ? Number(event.target.value)
        : event.target.value;
      if (benefitField === "category") {
        benefit.type = BENEFIT_TYPES[benefit.category][0];
        benefit.unit = defaultUnit(benefit.category, benefit.type);
        renderEditorFields();
      } else if (benefitField === "type") {
        benefit.unit = defaultUnit(benefit.category, benefit.type);
        renderEditorFields();
      }
      return;
    }

    const premiumField = event.target.dataset.premiumField;
    if (premiumField) {
      const row = event.target.closest("[data-premium-index]");
      if (!row) return;
      editorDraft.premiumSchedule[Number(row.dataset.premiumIndex)][premiumField] = Number(event.target.value);
      return;
    }

    const costField = event.target.dataset.costField;
    if (costField) {
      const row = event.target.closest("[data-cost-index]");
      if (!row) return;
      editorDraft.costs[Number(row.dataset.costIndex)][costField] = event.target.type === "number"
        ? Number(event.target.value)
        : event.target.value;
    }
  });

  document.getElementById("editModalFields").addEventListener("click", (event) => {
    const action = event.target.dataset.editorAction;
    if (!action || !editorDraft) return;

    if (action === "calculate-debt-payment") {
      editorDraft.monthlyPayment = Math.round(
        calculateMonthlyLoanPayment(editorDraft.value, editorDraft.interestRate, editorDraft.loanYears)
      );
      renderEditorFields();
    } else if (action === "add-stage-modal") {
      openEntityEditor("stage");
      return;
    } else if (action === "edit-stage-modal") {
      const row = event.target.closest("[data-stage-index]");
      if (row) openEntityEditor("stage", Number(row.dataset.stageIndex));
      return;
    } else if (action === "delete-stage-modal") {
      const row = event.target.closest("[data-stage-index]");
      if (row) financeStages.splice(Number(row.dataset.stageIndex), 1);
      renderFinanceStages();
      recalculate();
    } else if (action === "add-rider") {
      if (editorIndex === null) return;
      policies[editorIndex] = structuredClone(editorDraft);
      openRiderEditor(editorDraft.id);
      return;
    } else if (action === "edit-rider") {
      const row = event.target.closest("[data-policy-index]");
      if (!row || editorIndex === null) return;
      policies[editorIndex] = structuredClone(editorDraft);
      openRiderEditor(editorDraft.id, Number(row.dataset.policyIndex));
      return;
    } else if (action === "delete-rider") {
      const row = event.target.closest("[data-policy-index]");
      if (row) policies.splice(Number(row.dataset.policyIndex), 1);
      renderPolicies();
      recalculate();
    } else if (action === "add-cost") {
      editorDraft.costs.push({ id: makeId("cost"), name: "年度支出", annualAmount: 0 });
    } else if (action === "delete-cost") {
      const row = event.target.closest("[data-cost-index]");
      if (row) editorDraft.costs.splice(Number(row.dataset.costIndex), 1);
    } else if (action === "add-benefit") {
      editorDraft.benefits.push({
        id: makeId("benefit"),
        category: "death",
        type: BENEFIT_TYPES.death[0],
        amount: 1000000,
        unit: defaultUnit("death", BENEFIT_TYPES.death[0])
      });
    } else if (action === "delete-benefit") {
      const row = event.target.closest("[data-benefit-index]");
      if (row) editorDraft.benefits.splice(Number(row.dataset.benefitIndex), 1);
    } else if (action === "add-premium") {
      const previous = editorDraft.premiumSchedule.at(-1);
      const startAge = previous ? Math.min(100, Number(previous.endAge) + 1) : editorDraft.startAge;
      editorDraft.premiumSchedule.push({
        id: makeId("premium"),
        startAge,
        endAge: editorDraft.endAge,
        annualPremium: previous?.annualPremium ?? editorDraft.premium
      });
    } else if (action === "delete-premium") {
      const row = event.target.closest("[data-premium-index]");
      if (row) editorDraft.premiumSchedule.splice(Number(row.dataset.premiumIndex), 1);
    } else {
      return;
    }
    if (editorDraft) renderEditorFields();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && editorDraft) closeEntityEditor();
  });

  window.addEventListener("resize", () => {
    drawLineChart();
    drawBarChart();
  });
}

ensureDateDefaults();
loadState();
renderPolicies();
renderFinanceStages();
renderInvestments();
renderResources("asset");
renderResources("debt");
bindEvents();
recalculate();
