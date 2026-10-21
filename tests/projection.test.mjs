import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';

const source = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const baseInputs = {
  currentAge: 24, planStartDate: '2026-01-01', incomeStartDate: '2026-01-01', incomeEndDate: '',
  annualIncome: 0, sideIncome: 0, incomeGrowth: 0, sideIncomeGrowth: 0,
  incomeGrowthMode: 'compound', sideIncomeGrowthMode: 'compound', incomeType: 'salary',
  monthlyLivingExpense: 0, assets: 1000000, cashReturnRate: 0, returnRate: 4, inflation: 0,
  dependentsCount: 0, dependentSupportYears: 0, maritalStatus: 'single', premiumCashCapRate: 0,
  premiumCashCapStartAge: 24, premiumCashCapEndAge: 65, accidentTarget: 0,
  medicalDaily: 0, cancerTarget: 0, criticalTarget: 0, ltcMonthly: 0, ltcYears: 8,
};

function model(fixture = {}) {
  const context = vm.createContext({ structuredClone });
  vm.runInContext(source.slice(0, source.lastIndexOf('\nensureDateDefaults();')), context);
  context.fixture = { ...fixture, inputs: { ...baseInputs, ...fixture.inputs } };
  vm.runInContext(`
    readInputs = () => fixture.inputs;
    policies = normalizePolicies(fixture.policies || []);
    investments = normalizeInvestments(fixture.investments || []);
    debtItems = normalizeResources(fixture.debtItems || [], 'debt');
    heldAssets = normalizeResources(fixture.heldAssets || [], 'asset');
    fixedExpenses = normalizeFixedExpenses(fixture.fixedExpenses || []);
    financeStages = normalizeFinanceStages(fixture.financeStages || []);
  `, context);
  return { context, run: (code) => vm.runInContext(code, context), rows: () => vm.runInContext('projectPlan()', context) };
}
function approx(actual, expected, tolerance = 0.001) {
  assert.ok(Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance, `預期 ${expected}，實際 ${actual}`);
}
const policy = { name: '保障', premium: 120000, startAge: 24, endAge: 100, category: 'death', coverage: 0 };
const debt = { name: '信貸', value: 120000, interestRate: 0, monthlyPayment: 10000, startDate: '2026-01-01' };

test('財務比率使用正確資產與負債，還本後的淨資產不重複扣本金', () => {
  const row = model({ inputs: { annualIncome: 600000, monthlyLivingExpense: 10000 }, debtItems: [debt] }).rows()[0];
  approx(row.debtValue, 0);
  approx(row.financialRatios.overallDebt, 0);
  approx(row.financialRatios.financialBurden, 120000 / (600000 - row.incomeTax) * 100);
  approx(row.assets, 1000000 + 600000 - row.incomeTax - 120000 - 120000);
});
test('保費門檻只分攤收入與存款來源，不會重複扣除保費', () => {
  const fixture = { inputs: { annualIncome: 600000, premiumCashCapRate: 10 }, policies: [policy] };
  const capped = model(fixture).rows()[0];
  const uncapped = model({ ...fixture, inputs: { ...fixture.inputs, premiumCashCapRate: 0 } }).rows()[0];
  approx(capped.liquidAssets, uncapped.liquidAssets);
  approx(capped.premiumCashCharge, 60000);
});
test('負現金不套用存款利率，不憑空產生借款利息', () => {
  const rows = model({ inputs: { assets: 0, monthlyLivingExpense: 100, cashReturnRate: 10 } }).rows();
  approx(rows[0].liquidAssets, -1200);
  approx(rows[1].liquidAssets, -2400);
});
test('投資到期後不再多計一整年報酬', () => {
  const rows = model({ investments: [{ id: 'a', lumpSum: 100000, returnRate: 10, startDate: '2026-01-01', endDate: '2027-01-01' }] }).rows();
  approx(rows[0].investmentLiquidation, 110000);
  approx(rows[0].assets, 1010000);
  approx(rows[1].assets, 1010000);
});
test('年中開始並到期的短期投資仍會被計算', () => {
  const row = model({ investments: [{ lumpSum: 100000, returnRate: 10, startDate: '2026-04-01', endDate: '2026-10-01' }] }).rows()[0];
  approx(row.investmentContribution, 100000);
  assert.ok(row.investmentLiquidation > 100000 && row.investmentLiquidation < 110000);
  approx(row.investmentAssets, 0);
});
test('投資起訖同日只歸還本金，不產生報酬或定期投入', () => {
  const row = model({ investments: [{ lumpSum: 100000, recurringAmount: 1000, returnRate: 10, startDate: '2026-04-01', endDate: '2026-04-01' }] }).rows()[0];
  approx(row.investmentContribution, 100000);
  approx(row.investmentLiquidation, 100000);
  approx(row.assets, 1000000);
});
test('再平衡權重超過一時不會創造資產，不足一時餘款轉現金', () => {
  for (const weight of [0.5, 2]) {
    const rows = model({ investments: [{ id: 'a', lumpSum: 100000, returnRate: 0, rebalanceSchedule: [{ age: 25, targetWeight: weight }] }] }).rows();
    approx(rows[1].assets, 1000000);
    approx(rows[1].investmentAssets, weight < 1 ? 50000 : 100000);
  }
});
test('貸款最後一期不超扣，零月付仍累計明示貸款利息', () => {
  const m = model();
  approx(m.run("debtPaymentForYear({value:15000, monthlyPayment:10000, interestRate:0, startDate:'2026-01-01'}, '2026-01-01')"), 15000);
  approx(m.run("debtBalanceAtDate({value:100000, monthlyPayment:0, interestRate:12, startDate:'2026-01-01'}, '2027-01-01')"), 100000 * 1.01 ** 12);
});
test('貸款到期會扣清餘額，避免負債憑空消失', () => {
  for (const endDate of ['2026-07-01', '2027-01-01']) {
    const rows = model({ debtItems: [{ ...debt, monthlyPayment: 0, endDate }] }).rows();
    approx(rows[0].expense, 120000);
    approx(rows[0].debtValue, 0);
    approx(rows[0].assets, 880000);
    approx(rows[1].expense, 0);
    approx(rows[1].assets, 880000);
  }
});
test('日期按完整月與週年計算，閏日加年不跨到三月', () => {
  const m = model();
  assert.equal(m.run("addYearsToIso('2024-02-29', 1)"), '2025-02-28');
  assert.equal(m.run("monthsBetween('2026-01-31', '2026-02-01')"), 0);
  assert.equal(m.run("monthsBetween('2026-01-31', '2026-02-28')"), 1);
  assert.equal(m.run("dateToAge('2027-01-01', {currentAge:24, planStartDate:'2026-10-21'})"), 24);
});
test('單利減值與極端投資報酬不產生負本金或 NaN', () => {
  const m = model();
  approx(m.run("applyAnnualChange(100, -80, 3, 'simple')"), 0);
  approx(m.run("periodicContributionFutureValue(1000, -150, 'monthly')"), 0);
  approx(m.run("periodicContributionFutureValue(1000, 0.000000000001, 'monthly')"), 12000);
});
test('投資型保單使用相同投入時點與報酬計算', () => {
  const row = model({ policies: [{ ...policy, premium: 0, productType: 'investmentLinked', investmentMode: 'lumpSum', investmentAmount: 100000, investmentReturnRate: 10 }] }).rows()[0];
  approx(row.policyInvestmentAssets, 110000);
  approx(row.assets, 1010000);
});

test('月定期投入按實際月份計算，年中起始不誤算整年', () => {
  const row = model({ investments: [{ recurringAmount: 1000, returnRate: 0, startDate: '2026-07-01', endDate: '2027-01-01' }] }).rows()[0];
  approx(row.investmentContribution, 6000);
  approx(row.investmentLiquidation, 6000);
  approx(row.assets, 1000000);
});
test('匯入文字數字的保費仍是數值，起保與結束年齡正確', () => {
  const row = model({ policies: [{ ...policy, premium: '120000', startAge: '24', endAge: '100' }] }).rows()[0];
  assert.equal(typeof row.premium, 'number');
  approx(row.premium, 120000);
  approx(row.assets, 880000);
});
test('貸款在本年度起始日到期時仍會清償剩餘餘額', () => {
  const row = model({ debtItems: [{ ...debt, monthlyPayment: 0, endDate: '2026-01-01' }] }).rows()[0];
  approx(row.debtRepayment, 120000);
  approx(row.assets, 880000);
});
test('極低貸款利率的月付額接近零利率月付額', () => {
  approx(model().run('calculateMonthlyLoanPayment(120000, 0.000000000001, 1)'), 10000);
});
test('完整舊版規劃檔可計算至百歲，每年現金與淨資產符合會計恆等式', async () => {
  const { state } = JSON.parse(await readFile(new URL('../output/林向野_主副業收入表_v10_網站可匯入.json', import.meta.url), 'utf8'));
  const inputs = { ...state.inputs };
  for (const [key, value] of Object.entries(baseInputs)) {
    if (typeof value === 'number' && key in inputs) inputs[key] = Number(inputs[key]);
  }
  const rows = model({ ...state, inputs }).rows();
  assert.equal(rows.length, 101 - inputs.currentAge);
  for (const row of rows) {
    approx(row.liquidAssets, row.openingCash + row.cashInterest + row.income - row.expense - row.premium
      - row.investmentContribution + row.investmentLiquidation, 0.01);
    approx(row.assets, row.liquidAssets + row.investmentAssets + row.heldAssetValue - row.debtValue, 0.01);
    for (const key of ['assets', 'liquidAssets', 'investmentAssets', 'premium', 'debtValue', 'totalGap']) {
      assert.ok(Number.isFinite(row[key]), `${row.age}歲的 ${key} 不是有限值`);
    }
    assert.ok(row.investmentAssets >= 0 && row.debtValue >= 0);
  }
});
