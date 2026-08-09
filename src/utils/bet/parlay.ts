import { TBetItem, TParlayItem } from '@/apis/commonSports/types';
import { bigNB } from './bigMath';

/**
 * DP 求「所有 m 个赔率组合的乘积之和」，等价于 Flutter 的 combinationProductSumDP
 * dp[j] = 已处理赔率中取 j 个的组合乘积和
 */
function combinationProductSum(odds: number[], m: number): number {
  const dp = new Array<number>(m + 1).fill(0);
  dp[0] = 1;
  for (const odd of odds) {
    for (let j = m; j >= 1; j--) {
      dp[j]! += dp[j - 1]! * odd;
    }
  }
  return dp[m] ?? 0;
}

/**
 * 计算串关总赔率（欧盘）
 * @param n    每注选几场：n>0 = n串1，n=0 = 全串关（2串1 + 3串1 + … + len串1）
 * @param odds 每个选项的欧盘赔率数组
 */
export function calcParlayOdds(n: number, odds: number[]): number {
  if (odds.length === 0) return 0;

  if (n > 0) {
    return combinationProductSum(odds, n);
  }

  // 全串关：2串1 + 3串1 + … + len串1
  let total = 0;
  for (let m = 2; m <= odds.length; m++) {
    total += combinationProductSum(odds, m);
  }
  return total;
}

function combinations<T>(arr: T[], k: number): T[][] {
  const result: T[][] = [];

  function dfs(start: number, path: T[]) {
    if (path.length === k) {
      result.push([...path]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      const item = arr[i];
      if (item) {
        path.push(item);
        dfs(i + 1, path);
        path.pop();
      }
    }
  }

  dfs(0, []);
  return result;
}
function calcSingleParlayOdds(items: TBetItem[]) {
  return items.reduce((acc, cur) => acc.times(cur.baseOdds), bigNB(1)).toNumber();
}

function sum(list: number[]) {
  // 这里保留真实赔率，后续显示过程中才截取2位小数
  return list.reduce((acc, cur) => acc.add(cur), bigNB(0)).toNumber();
}

export function buildParlayList(betItems: TBetItem[]): TParlayItem[] {
  const startTime = Date.now();
  const len = betItems.length;
  if (len < 2 || len > 110) return [];

  const result: TParlayItem[] = [];
  const xChuan1Map = new Map<number, number[]>();

  // 1️⃣ 正常顺序生成 2串1 → n串1
  // for (let x = 2; x <= len; x++) {
  // 1️⃣ 倒序生成 n串1 → 2串1
  for (let x = len; x >= 2; x--) {
    const groups = combinations(betItems, x);
    const oddsList = groups.map(calcSingleParlayOdds);

    xChuan1Map.set(x, oddsList);

    result.push({
      parlayLabel: `${x}串1`,
      parlayCode: `${x}001`,
      parlayOdds: sum(oddsList),
      parlayCombinationNum: x,
      parlaySum: oddsList.length,
      betAmount: '',
      minBet: 0,
      maxBet: 0,
      isFocus: false,
    });
  }

  // 2️⃣ 生成 n串m（系统串关，放最后）
  if (len >= 3) {
    const allOdds: number[] = [];

    for (let x = 2; x <= len; x++) {
      allOdds.push(...(xChuan1Map.get(x) ?? []));
    }

    result.push({
      parlayLabel: `${len}串${allOdds.length}`,
      parlayCode: `${len}00${allOdds.length}`,
      parlayOdds: sum(allOdds),
      parlayCombinationNum: 0,
      parlaySum: allOdds.length,
      betAmount: '',
      minBet: 0,
      maxBet: 0,
      isFocus: false,
    });
  }

  // 3️⃣ ⭐ 把 n串1 提到最前
  // const index = result.findIndex((item) => item.parlayCode === `${len}001`);

  // if (index > 0) {
  //   const [target] = result.splice(index, 1);
  //   result.unshift(target);
  // }
  console.log('js---计算时长', Date.now() - startTime);
  return result;
}
