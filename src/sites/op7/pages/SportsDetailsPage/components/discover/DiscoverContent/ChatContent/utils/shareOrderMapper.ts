import { EVenue } from '@/apis/commonSports/constants';
import type { TBetHistoryOrderItem, THistoryBetItem } from '@/apis/commonSports/types';
import { getFBTime } from '@/apis/fbSports/common/fbFormat';
import type { BetShareCard, BetShareTeamItem } from '@/core/sdk/IMManager';

const asStr = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return fallback;
};

/** 金额两位小数（对齐 Flutter toStringAsFixed(2)） */
const asMoney = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '';
  const n = Number(value);
  if (!Number.isFinite(n)) return asStr(value);
  return n.toFixed(2);
};

const FB_ODDS_FORMAT_LABEL: Record<string, string> = {
  '1': '欧洲盘',
  '2': '香港',
};

/**
 * 投注历史 → 晒单 teamList（对齐 emc ShareOrderLogic + TeamItem.toJson）
 * 注意：Flutter BetDataItem.fromJson 对多数字段是 `as String?`，数字会直接抛错导致整条消息被丢弃。
 */
const mapHistoryDetailToTeam = (
  detail: THistoryBetItem,
  options: { orderSettled: boolean },
): BetShareTeamItem => {
  const marketId = asStr(detail.marketId);
  const ty = asStr(detail.fb?.ty);
  const playOptionsId = ty ? `${marketId}_${ty}` : asStr(detail.betItemId || marketId);
  const matchInfo =
    detail.homeName && detail.awayName
      ? `${detail.homeName} VS ${detail.awayName}`
      : asStr(detail.leagueName);
  const leagueName = asStr(detail.leagueName);
  const handicap = FB_ODDS_FORMAT_LABEL[asStr(detail.fb?.of, '1')] ?? FB_ODDS_FORMAT_LABEL['1'];
  const bt = typeof detail.matchStartTime === 'number' ? detail.matchStartTime : 0;
  const startTime = bt > 0 ? getFBTime(bt) : '';
  // 对齐 Flutter isSingleSettled: (sr ?? 0) > 0 —— 未结算注单不因提前结算 crl 误标已结
  const isSingleSettled = options.orderSettled && Number(detail.orderSettleResult) > 0;
  // 赛果比分：仅已结算携带（未结算 rs 可能有滚球比分，会导致跟单按钮被隐藏）
  const score = options.orderSettled ? asStr(detail.resultScore) : '';

  return {
    matchName: leagueName,
    marketValue: asStr(detail.betItemFullName || detail.betItemShortName || detail.marketValue),
    oddFinally: asStr(detail.baseOdds),
    playName: asStr(detail.playName),
    matchInfo,
    matchId: asStr(detail.matchId),
    sportId: asStr(detail.sportId),
    handicap,
    startTime,
    score,
    betResult: options.orderSettled ? asStr(detail.orderSettleResult) : '',
    betScore: asStr(detail.scoreWhileBetting),
    betStatus: isSingleSettled && !!score,
    marketId,
    playOptionsId,
    isSingleSettled,
    isChampion: !!detail.isChampion,
    matchDate: startTime,
    bt,
    oddsId: playOptionsId,
    oddsType: ty,
    playId: asStr(detail.playId),
    placeNum: 1,
    leagueName,
    scoreName: asStr(detail.playName),
    type: ty,
    leagueId: '',
    sportName: '',
    decimalOdds: asStr(detail.baseOdds),
    selectionClientOdds: '',
    homeName: asStr(detail.homeName),
    awayName: asStr(detail.awayName),
  };
};

/**
 * 序列化为 Flutter BetDataItem.toJson 兼容结构（字段类型对齐 json_serializable）
 */
export const serializeBetShareForFlutter = (card: BetShareCard): Record<string, unknown> => {
  const teamList = (card.teamList ?? []).map((team) => ({
    matchName: asStr(team.matchName || team.leagueName),
    marketValue: asStr(team.marketValue),
    oddFinally: asStr(team.oddFinally ?? team.decimalOdds),
    playName: asStr(team.playName || team.scoreName),
    matchInfo: asStr(team.matchInfo),
    matchId: asStr(team.matchId),
    sportId: asStr(team.sportId),
    handicap: asStr(team.handicap),
    startTime: asStr(team.startTime || team.matchDate),
    score: asStr(team.score),
    betResult: asStr(team.betResult),
    betScore: asStr(team.betScore),
    betStatus: Boolean(team.betStatus),
    isSingleSettled: Boolean(team.isSingleSettled),
    isChampion: Boolean(team.isChampion),
    marketId: asStr(team.marketId),
    playOptionsId: asStr(team.playOptionsId),
    matchDate: asStr(team.matchDate || team.startTime),
    bt: typeof team.bt === 'number' && Number.isFinite(team.bt) ? team.bt : 0,
    oddsId: asStr(team.oddsId || team.playOptionsId),
    oddsType: asStr(team.type || team.oddsType),
    playId: asStr(team.playId),
    placeNum: 1,
    leagueName: asStr(team.leagueName || team.matchName),
    scoreName: asStr(team.scoreName || team.playName),
    type: asStr(team.type),
    leagueId: asStr(team.leagueId),
    sportName: '',
    decimalOdds: asStr(team.decimalOdds ?? team.oddFinally),
    selectionClientOdds: '',
    // 冠军跟单拼单需要主客队名
    homeName: asStr(team.homeName),
    awayName: asStr(team.awayName),
  }));

  const isSingle = card.isSingle !== false && Number(card.seriesType ?? 0) <= 1;

  return {
    id: asStr(card.id || card.orderNo),
    title: asStr(card.title, '晒单'),
    status: '1',
    createTime: asStr(card.createTime),
    handicap: asStr(card.handicap),
    amount: asMoney(card.amount) || asStr(card.amount),
    // 可返还 / 返还：对齐 Flutter mla(未结算) / sa(已结算)
    backAmount: asMoney(card.backAmount) || asStr(card.backAmount),
    settlementPrice: '',
    betResult: asStr(card.betResult),
    isSingle,
    settlementTip: 'FB',
    showSettlement: false,
    isSettlement: Boolean(card.isSettlement),
    showPreSettlement: false,
    isPreSettlement: false,
    showCancelPreBet: false,
    showUpdatePreBet: false,
    preStatus: '',
    remainingAmt: asMoney(card.remainingAmt) || asStr(card.remainingAmt),
    isPreOrder: false,
    teamList,
    // 串关默认收起（对齐 Flutter 晒单选择页）
    isExpand: isSingle,
    oddFinally: asStr(card.oddFinally),
    venueId: asStr(card.venueId),
    orderNo: asStr(card.orderNo || card.id),
    // 不发送 showFollowBetBtn（对齐 Flutter remove）
  };
};

/**
 * TBetHistoryOrderItem → BetShareCard（本地展示 + 序列化源头）
 */
export const mapBetHistoryOrderToShareCard = (
  order: TBetHistoryOrderItem,
  venueId: string = EVenue.FB,
): BetShareCard => {
  const orderSettled = !!order.isSettledOrder;
  const teamList = (order.orderDetails ?? []).map((detail) =>
    mapHistoryDetailToTeam(detail, { orderSettled }),
  );
  const first = teamList[0];
  const title = order.isParlayOrder
    ? asStr(order.orderLabel)
    : first?.matchInfo || asStr(order.orderLabel) || '晒单';

  // 对齐 Flutter share_order_logic：未结算用 mla，已结算用 sa
  const backAmount = orderSettled
    ? asMoney(order.orderSettledBackAmount)
    : asMoney(order.orderMaxWinAmount);

  return {
    id: asStr(order.orderId),
    orderNo: asStr(order.orderId),
    title,
    amount: asMoney(order.orderBetAmount) || asStr(order.orderBetAmount),
    backAmount,
    remainingAmt: '',
    // 串关总赔率（对齐 OddsUtil / 历史 orderOdds）
    oddFinally: order.isParlayOrder ? asStr(order.orderOdds) : '',
    venueId: asStr(venueId, EVenue.FB),
    matchId: first?.matchId,
    isSingle: !order.isParlayOrder,
    isSettled: orderSettled,
    // 总单结算结果（对齐 Flutter share_order_logic betResult）
    betResult: orderSettled ? asStr(order.orderSettleResult) : '',
    // 提前结算 → header 展示 advance 图标
    isSettlement: !!(order.isEarlySettleOrder || Number(order.orderSettleResult) === 9),
    seriesType: order.isParlayOrder ? Number(order.orderSum || 0) : 1,
    handicap: first?.handicap || FB_ODDS_FORMAT_LABEL['1'],
    createTime: order.orderConfirmTime > 0 ? getFBTime(order.orderConfirmTime) : '',
    teamList,
  };
};
