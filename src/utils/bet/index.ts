import { TBetItem, TBetOrderItem, TbetData, TParlayItem } from '@/apis/commonSports/types';
import _ from 'lodash';
import { EOddsStatus, EOddsType } from '@/apis/commonSports/constants';
import type { TFollowMatch } from '@/core/store/slices/sportSlice';
import { betItemToMatchData } from '@/common/hooks/follow';
import { bigNB } from './bigMath';

/**
 * 投注项实际生效的盘口类型，与下单参数 `getObMarketTypeFinally` 同口径：
 * 需同时满足「用户选了香港盘」+「该投注项支持香港盘」，且串关只支持欧洲盘。
 */
export const getEffectiveOddsType = ({
  isSupportHK,
  currentOddsType,
  isParlay = false,
}: {
  isSupportHK?: boolean;
  currentOddsType: EOddsType;
  isParlay?: boolean;
}): EOddsType =>
  !isParlay && isSupportHK && currentOddsType === EOddsType.HK ? EOddsType.HK : EOddsType.EU;

/**
 * 按已确定的盘口类型换算展示赔率。
 *
 * 换算与 Flutter `getOBOdds` 等价：香港盘 = 欧洲盘 − 1。减的是整数，
 * 不会影响已截断的小数位，所以可以直接在展示层做，不必回到原始赔率重算。
 */
export const getDisplayOddsByType = (baseOdds: number, oddsType: EOddsType) =>
  bigNB(baseOdds || 0)
    .minus(oddsType === EOddsType.HK ? 1 : 0)
    .toFixed(2);

/**
 * 展示用赔率：`baseOdds` 存的恒为欧洲盘，只在「用户选了香港盘」且「该投注项支持香港盘」时才换算。
 *
 * 注意：赔率是否存在（空位、是否可点）仍应判断 `baseOdds`——香港盘下 0 是合法赔率（对应欧洲盘 1.00）。
 */
export const getDisplayOdds = (
  baseOdds: number,
  isSupportHK: boolean,
  currentOddsType: EOddsType,
) => getDisplayOddsByType(baseOdds, getEffectiveOddsType({ isSupportHK, currentOddsType }));

/**
 * 投注项 → 关注赛事（乐观渲染用）。
 * source 由调用方按登录态传入：游客 'tourist'（登录后 sync 上报），登录 'bet'（随后被服务器列表覆盖）。
 * bt/联赛/队伍等完场占位与过期所需字段统一收进 matchData 快照（SportItemInfo JSON）。
 */
export const betItemToFollowSnapshot = (
  detail: TBetItem,
  source: TFollowMatch['source'],
): TFollowMatch => ({
  matchId: detail.matchId,
  sportId: Number(detail.sportId),
  bt: detail.matchStartTime,
  source,
  matchData: betItemToMatchData(detail),
});

export const ordersToFollowMatchInfos = (
  orders: TBetOrderItem[],
  source: TFollowMatch['source'],
): TFollowMatch[] =>
  _.uniqBy(
    orders.flatMap((order) =>
      order.orderDetails
        // 冠军（Outright）投注项不自动关注（后端对 champion+source=2 亦静默跳过）
        .filter((d) => !d.isChampion)
        .map((d) => betItemToFollowSnapshot(d, source)),
    ),
    'matchId',
  );

export const handleAmountInputChange = (v: string) => {
  // 1. 特殊情况：单独输入0返回空（这里放到调用处更灵活）
  if (v === '0') {
    return '';
  }
  return (
    v
      // 2. 替换所有非数字和点为空
      .replace(/[^\d.]/g, '')
      // 3. 将开头连续的点替换为空
      .replace(/^\.+/, '')
      // 4. 将第一个点替换为特殊占位符
      .replace(/\./, '$#$')
      // 5. 将剩余点全部替换为空
      .replace(/\./g, '')
      // 6. 将占位符替换回点
      .replace('$#$', '.')
      // 7. 00.1234 → 0.1234，匹配开头多个0后跟点数字的情况
      .replace(/^0+(?=\.\d)/, '0')
      // 8. 00123 → 123，匹配开头多个0后跟数字的情况
      .replace(/^0+(\d)/, '$1')
      // 9. 限制小数点后最多两位数字
      .replace(/^(\d+)(\.\d{0,2})?.*$/, '$1$2')
  );
};

export const getInputError = ({
  betAmount,
  totalBalance,
  minBet,
  maxBet,
}: {
  betAmount: string;
  totalBalance: string;
  minBet: number;
  maxBet: number;
}) => {
  return (
    +betAmount > 0 && (+betAmount < minBet || +betAmount > maxBet || +betAmount > +totalBalance)
  );
};

export const getBetBtnInfoSingle = ({
  betItem,
  totalBalance,
}: {
  totalBalance: string;
  betItem: TBetItem | undefined;
}) => {
  const result = {
    label: '投注',
    canWinAmount: 0,
    disabled: true,
    showCanWin: true,
  };
  if (!betItem) {
    return result;
  }
  const { betAmount, minBet, maxBet, baseOdds, oddsStatus } = betItem;
  if (+betAmount > 0) {
    if (oddsStatus !== EOddsStatus.Open) {
      result.label = '盘口关闭';
      result.showCanWin = false;
    } else if (+betAmount < minBet) {
      result.label = '投注金额不可小于限额';
      result.showCanWin = false;
    } else if (+betAmount > +totalBalance) {
      result.label = '投注金额不可大于余额';
      result.showCanWin = false;
    } else if (+betAmount > maxBet) {
      result.label = '投注金额不可大于限额';
      result.showCanWin = false;
    } else {
      result.label = '投注';
      result.disabled = false;
      result.canWinAmount = baseOdds * +betAmount;
    }
  }
  return result;
};

export const getBetBtnInfoParlay = ({
  betItemMap,
  parlayList,
  totalBalance,
}: {
  betItemMap: TbetData['entities'];
  totalBalance: string;
  parlayList: TParlayItem[];
}) => {
  const result = {
    label: '投注',
    canWinAmount: 0,
    disabled: true,
    showCanWin: true,
  };

  if (_.some(betItemMap, (bItem) => bItem.oddsStatus !== EOddsStatus.Open)) {
    result.label = '盘口关闭';
    result.showCanWin = false;
    return result;
  }

  let hasInput = false;
  let totalBetAmount = 0;
  for (const item of parlayList) {
    const { betAmount, minBet, maxBet, parlayOdds } = item;
    if (+betAmount > 0) {
      hasInput = true;
      if (+betAmount < minBet) {
        result.label = '投注金额不可小于限额';
        result.showCanWin = false;
        return result;
      } else if (+betAmount > maxBet) {
        result.label = '投注金额不可大于限额';
        result.showCanWin = false;
        return result;
      }
      result.canWinAmount += +parlayOdds * +betAmount;
      totalBetAmount += +betAmount * +item.parlaySum;
    }
  }

  if (totalBetAmount > +totalBalance) {
    result.label = '投注金额不可大于余额';
    result.showCanWin = false;
    return result;
  }

  if (hasInput) {
    result.disabled = false;
  }

  return result;
};
