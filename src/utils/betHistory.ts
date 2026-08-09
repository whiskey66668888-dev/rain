import { EBetOrderStatus } from '@/apis/commonSports/constants';
import { TBetHistoryOrderItem } from '@/apis/commonSports/types';
import { bigNB } from '@/utils/bet/bigMath';

/** 是否预约投注单 */
export const isUnsettledOrder = (order: TBetHistoryOrderItem) => {
  return !!order.isPreBetOrder;
};

// orderOdds: isParlay
// ? calcParlayOdds(
//     oItem.sv,
//     oItem.ops.map((op) => op.od),
//   )
// : (oItem.ops[0]?.od ?? 0),

// double handleValidBet(List<FbBetRecordItem> list) {
//   double valid = 0;
//   List<int> failStatus = [2, 3];

//   for (var item in list) {
//     if (failStatus.contains(item.st)) continue;
//     var amount = calculationValid(
//       amount: item.sat, // orderBetAmount
//       backAmt: item.sa!, // orderSettledBackAmount
//       profitAmount: double.parse(item.uwl), // 返还  -  本金
//       odds: item.ops[0].od, //  orderOdds
//       isPreSettle: item.crl!.isNotEmpty, // isEarlySettleOrder
//       seriesType: item.sert == 1, // isParlayOrder
//     );
//     valid += amount;
//   }
//   return valid;
// }

// double calculationValid({
//   required double amount, // 本金
//   required double backAmt, // 返还金额
//   required double profitAmount, // 输赢
//   required double odds, // 赔率
//   required bool isPreSettle, // 是否提前结算
//   required bool seriesType, // 是否串关
// }) {
//   var _odds = (profitAmount.abs() / amount).abs();
//   var hkOdds = getHKOdds(odds);

//   if (seriesType) {
//     // 输
//     if (profitAmount <= 0) {
//       return profitAmount.abs();
//     }
//     // 赢
//     if (_odds + 0.001 >= 0.7) {
//       return amount;
//     }
//   } else {
//     // 提前结算
//     if (isPreSettle) {
//       if (profitAmount <= 0) {
//         // 输
//         return profitAmount.abs();
//       }

//       if (_odds + 0.001 >= 0.7) {
//         return amount;
//       }
//     }

//     if (_odds + 0.01 > hkOdds &&
//         _odds < hkOdds + 0.01 &&
//         hkOdds > 0.7 &&
//         !isPreSettle) {
//       // 全赢
//       return amount;
//     }

//     if ((_odds * 2 + 0.01) > hkOdds &&
//         _odds * 2 < hkOdds + 0.01 &&
//         hkOdds >= 0.7) {
//       // 赢半
//       return amount / 2;
//     }

//     if (backAmt == 0 && !isPreSettle) {
//       // 全输
//       return amount;
//     }

//     if (amount / 2 + 0.1 > backAmt && amount / 2 - 0.1 < backAmt) {
//       // 输半
//       return amount / 2;
//     }
//   }
//   return 0;
// }

/** 计算有效投注额（1:1 对照 Flutter calculationValid + handleValidBet） */
export const calcValidBetAmout = ({ list }: { list: TBetHistoryOrderItem[] }) => {
  return list.reduce((prev, curr) => {
    // failStatus [2, 3] → EBetOrderStatus.Fail
    if (curr.orderStatus === EBetOrderStatus.Fail) return prev;

    const amount = +curr.orderBetAmount;
    const backAmt = +curr.orderSettledBackAmount;
    // profitAmount = uwl = 返还 - 本金
    const profitAmount = backAmt - amount;
    const _odds = Math.abs(profitAmount) / amount;
    const hkOdds = curr.orderOdds - 1; // getHKOdds: 欧盘 - 1

    let valid = 0;

    if (curr.isParlayOrder) {
      if (profitAmount <= 0) {
        valid = Math.abs(profitAmount);
      } else if (_odds + 0.001 >= 0.7) {
        valid = amount;
      }
    } else {
      if (curr.isEarlySettleOrder) {
        if (profitAmount <= 0) {
          valid = Math.abs(profitAmount);
        } else if (_odds + 0.001 >= 0.7) {
          valid = amount;
        }
      } else if (_odds + 0.01 > hkOdds && _odds < hkOdds + 0.01 && hkOdds > 0.7) {
        valid = amount; // 全赢
      } else if (_odds * 2 + 0.01 > hkOdds && _odds * 2 < hkOdds + 0.01 && hkOdds >= 0.7) {
        valid = amount / 2; // 赢半
      } else if (backAmt === 0) {
        valid = amount; // 全输
      } else if (amount / 2 + 0.1 > backAmt && amount / 2 - 0.1 < backAmt) {
        valid = amount / 2; // 输半
      }
    }

    return prev + valid;
  }, 0);
};

/** 从订单派生提前结算相关数值，供各端展示组件共用 */
export const calcEarlySettleStats = (order: TBetHistoryOrderItem, maxCount: number) => {
  const history = order.earlySettleHistory ?? [];
  const count = order.earlySettleCount ?? 0;
  const { usedStake, earlyPayout } = history.reduce(
    (acc, r) => ({ usedStake: acc.usedStake + r.stake, earlyPayout: acc.earlyPayout + r.payout }),
    { usedStake: 0, earlyPayout: 0 },
  );
  const remainingStake = +order.orderBetAmount - usedStake;
  const remainingPayable = remainingStake + (order.earlySettleRemainingWin ?? 0);
  const hasPartialEarlySettle = !order.isSettledOrder && history.length > 0;
  const remainingCount = Math.max(0, maxCount - count);
  const displayStake = hasPartialEarlySettle ? remainingStake : order.orderBetAmount;

  return {
    history,
    count,
    usedStake,
    earlyPayout,
    remainingStake,
    remainingPayable,
    hasPartialEarlySettle,
    remainingCount,
    displayStake,
  };
};

/** 提前结算详情展示条目，已结算和未结算各返回一套 */
export const getEarlySettleDetailItems = (
  order: TBetHistoryOrderItem,
  stats: ReturnType<typeof calcEarlySettleStats>,
) => {
  const totalStake = order.earlySettleTotalStake ?? stats.usedStake;
  const totalPayout = order.earlySettleTotalPayout ?? stats.earlyPayout;

  if (order.isSettledOrder) {
    return [
      { label: '提前结算本金', value: bigNB(totalStake).toFixed(2) },
      { label: '提前结算返还', value: bigNB(totalPayout).toFixed(2) },
      { label: '自动结算本金', value: bigNB(stats.remainingStake).toFixed(2) },
      { label: '自动结算返还', value: bigNB(order.orderSettledBackAmount).toFixed(2) },
    ];
  }
  return [
    { label: '提前结算本金', value: bigNB(totalStake).toFixed(2) },
    { label: '提前结算返还', value: bigNB(totalPayout).toFixed(2) },
    { label: '剩余提前结算次数', value: String(stats.remainingCount) },
    { label: '初始本金', value: bigNB(order.orderBetAmount).toFixed(2) },
  ];
};

// ── 预约提前结算共用类型（与 useBetHistory.ts 的 TReserveEarlySettleStep 保持一致）──
type TReserveStep = 'viewing' | 'selecting' | 'editing' | 'confirming' | 'submitting';

/**
 * 预约提前结算滑条所有派生值。
 * order 可 undefined（H5 Sheet 在 guard 前调用），undefined 时返回安全的零值默认。
 */
export const calcReserveSliderValues = (
  order: TBetHistoryOrderItem | undefined,
  config: { cashOutRate?: number } | undefined,
  entry: { stakePercent?: number; payoutPercent?: number } | undefined,
) => {
  const history = order?.earlySettleHistory ?? [];
  const usedStake = history.reduce((s, r) => s + r.stake, 0);
  const remainingStake = +(order?.orderBetAmount ?? '0') - usedStake;
  const canAdjustStake = !order?.isParlayOrder && remainingStake > 10;
  const minStake = 10;
  const stakeRange = remainingStake - minStake;

  const defaultPayout =
    history.length > 0
      ? remainingStake + (order?.earlySettleRemainingWin ?? 0)
      : (order?.earlySettleCurrentPayable ?? 0);

  const stakePercent = entry?.stakePercent ?? 1;
  const stakeNum = canAdjustStake ? minStake + stakePercent * stakeRange : remainingStake;

  const minPayout = bigNB(stakeNum)
    .times(config?.cashOutRate ?? 0)
    .toNumber();
  const maxPayout = bigNB(stakeNum)
    .times(order?.orderOdds ?? 1)
    .minus(canAdjustStake && stakePercent < 1 ? 0.01 : 0)
    .toNumber();
  const payoutRange = maxPayout - minPayout;

  const payoutPercent = entry?.payoutPercent ?? 1;
  const payoutNum = payoutRange > 0 ? minPayout + payoutPercent * payoutRange : defaultPayout;

  return {
    remainingStake,
    canAdjustStake,
    minStake,
    stakeRange,
    defaultPayout,
    stakePercent,
    stakeNum,
    minPayout,
    maxPayout,
    payoutRange,
    payoutPercent,
    payoutNum,
  };
};

/** 预约提前结算 step 布尔状态派生 */
export const calcReserveStepState = (
  entry: { step: TReserveStep; isUpdate?: boolean } | undefined,
) => {
  const step: TReserveStep = entry?.step ?? 'selecting';
  const isUpdate = !!entry?.isUpdate;
  const isViewing = step === 'viewing';
  const isConfirming = step === 'confirming';
  const isSubmitting = step === 'submitting';
  const isEditing = step === 'editing' || ((isConfirming || isSubmitting) && isUpdate);
  const isSelecting = step === 'selecting' || ((isConfirming || isSubmitting) && !isUpdate);
  const buttonsDisabled = isConfirming || isSubmitting;
  const sliderDisabled = isViewing || buttonsDisabled;
  return {
    step,
    isUpdate,
    isViewing,
    isConfirming,
    isSubmitting,
    isEditing,
    isSelecting,
    buttonsDisabled,
    sliderDisabled,
  };
};

/** 将 activeReserve 的实际金额反算为 stakePercent / payoutPercent（0~1） */
export const calcReservePercentsFromActive = (
  order: TBetHistoryOrderItem,
  config: { cashOutRate?: number },
  activeReserve: { stake: number; payout: number },
): { stakePercent: number; payoutPercent: number } => {
  const { remainingStake } = calcEarlySettleStats(order, 0);
  const canAdj = !order.isParlayOrder && remainingStake > 10;
  const minStake = 10;
  const sRange = remainingStake - minStake;
  const stakePercent =
    canAdj && sRange > 0 ? Math.min(1, Math.max(0, (activeReserve.stake - minStake) / sRange)) : 1;

  const minPayout = bigNB(activeReserve.stake)
    .times(config.cashOutRate ?? 0)
    .toNumber();
  const isPartialStake = canAdj && sRange > 0 && activeReserve.stake < remainingStake;
  const maxPayout = bigNB(activeReserve.stake)
    .times(order.orderOdds ?? 1)
    .minus(isPartialStake ? 0.01 : 0)
    .toNumber();
  const payoutRange = maxPayout - minPayout;
  const payoutPercent =
    payoutRange > 0
      ? Math.min(1, Math.max(0, (activeReserve.payout - minPayout) / payoutRange))
      : 1;

  return { stakePercent, payoutPercent };
};
