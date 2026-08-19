import { EBetType, EOddsStatus, EVenue } from '@/apis/commonSports/constants';
import type { MatchBaseInfo, TBaseBetItem } from '@/apis/commonSports/types';
import { EFbMatchStatus } from '@/apis/fbSports/common/constants/enum';
import { getMatchDetailReq } from '@/apis/fbSports/getMatchDetail';
import { findOptionByMarketAndSelection } from '@/apis/fbSports/getSportRecommend';
import { fetchOBMatchDetail, type OBDetailTypeItem } from '@/apis/obSports/getMatchDetail';
import type { BetShareCard, BetShareTeamItem } from '@/core/sdk/IMManager';
import { toast } from '@/common/components/Toast';
import { clearChatFollowContext, setChatFollowContext } from '@/common/hooks/bet/chatFollowContext';
import type { TClickBetItemPayload } from '@/common/hooks/bet/useClickBetItem';
import { toBetShareVenueCode } from '@/apis/origin/discover';
import { getGlobalStoreForApiRequest } from '@/core/store/util';
import { setBetType, setIsChatBet } from '@/core/store/slices/betSlice';
import { buildBaseBetItemFromOption } from '@/sites/op7/pages/SportsDetailsPage/components/BettingMarket';

/** 已支持跟单的场馆（对齐 Flutter FollowBetHandler） */
const SUPPORT_FOLLOW_VENUES = new Set<string>([EVenue.FB, EVenue.OB]);

/** 已结束/取消等不可跟单的赛事状态（FB） */
const CLOSED_MATCH_STATUS = new Set<number>([
  EFbMatchStatus.Ended,
  EFbMatchStatus.Postponed,
  EFbMatchStatus.Interrupted,
  EFbMatchStatus.Cancelled,
  EFbMatchStatus.Abandoned,
]);

/** OB 全场结束等阶段 id（对齐 Flutter OB constants） */
const OB_ENDED_STATUS_IDS = new Set(['100', '120', '999']);

const getTeam = (betInfo: BetShareCard): BetShareTeamItem | undefined => betInfo.teamList?.[0];

/** 从 team 解析选项 ty（对齐 Flutter type / playOptionsId 末段）——仅 FB */
const resolveSelectionTy = (team: BetShareTeamItem): string => {
  if (team.type) return String(team.type);
  const playOptionsId = String(team.playOptionsId || team.oddsId || '');
  if (playOptionsId.includes('_')) {
    return playOptionsId.split('_').pop() || '';
  }
  return playOptionsId;
};

const isParlayBet = (betInfo: BetShareCard): boolean => {
  if (betInfo.isSingle === false) return true;
  const seriesType = Number(betInfo.seriesType ?? 0);
  return seriesType > 1;
};

/** OB 赛果文案/阶段是否已关闭（对齐 Flutter combinedStatus 判断） */
const isObMatchClosed = (match: MatchBaseInfo): boolean => {
  if (match.isEnded) return true;
  if (OB_ENDED_STATUS_IDS.has(String(match.matchStatusId ?? ''))) return true;
  const text = `${match.periodName || ''} ${match.matchStatus || ''}`.toLowerCase();
  return /结束|完场|完赛|取消|中断|finish|ended|cancelled|abandoned/.test(text);
};

/**
 * OB 详情盘口匹配：marketId + oid(playOptionsId)
 * 对齐 Flutter selection.oddsId == playOptionsId && selection.marketId == marketId
 */
const findObBetItem = (
  typeList: OBDetailTypeItem[],
  marketId: string,
  playOptionsId: string,
): TBaseBetItem | null => {
  if (!marketId || !playOptionsId) return null;
  for (const typeItem of typeList) {
    for (const market of typeItem.markets ?? []) {
      for (const item of market.lists ?? []) {
        const oid = String(item.ob?.oid || '');
        if (item.marketId !== marketId) continue;
        if (oid !== playOptionsId && item.betItemId !== playOptionsId) continue;
        if (item.betItemId.startsWith('empty_')) continue;
        if (item.oddsStatus === EOddsStatus.Closed) continue;
        return item;
      }
    }
  }
  return null;
};

/**
 * FB 冠军跟单：不拉详情盘口，直接用 teamList 静态字段拼单（对齐 emc _handleChampionFollowBet）
 */
const buildFbChampionBetItem = (team: BetShareTeamItem): TBaseBetItem | null => {
  const marketId = String(team.marketId || '');
  const ty = resolveSelectionTy(team);
  if (!marketId || !ty) return null;
  const odds = Number(team.decimalOdds ?? team.oddFinally ?? 0);
  return {
    isSupportHK: false,
    canParlay: false,
    canPreBet: true,
    playName: team.scoreName || team.playName || '冠军',
    playId: team.playId || '',
    marketId,
    marketValue: team.marketValue || '',
    betItemShortName: team.marketValue || team.betItemShortName?.toString() || '',
    betItemFullName: team.marketValue || team.betItemFullName?.toString() || '',
    betItemId: String(team.oddsId || `${marketId}_${ty}`),
    baseOdds: odds > 0 ? odds : 0,
    oddsStatus: EOddsStatus.Open,
    fb: {
      mty: Number(team.mty ?? 0),
      pe: Number(team.pe ?? 0),
      ty: Number(ty) || 0,
    },
  };
};

const asStr = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return fallback;
};

/** OB 冠军跟单：静态拼单（对齐 Flutter VenueType.OB 分支） */
const buildObChampionBetItem = (team: BetShareTeamItem): TBaseBetItem | null => {
  const marketId = String(team.marketId || '');
  const oid = String(team.oddsId || team.playOptionsId || '');
  if (!marketId || !oid) return null;
  const odds = Number(team.decimalOdds ?? team.oddFinally ?? 0);
  return {
    isSupportHK: false,
    canParlay: false,
    canPreBet: true,
    playName: team.scoreName || team.playName || '冠军',
    playId: String(team.playId || ''),
    marketId,
    marketValue: team.marketValue || '',
    betItemShortName: team.marketValue || team.betItemShortName?.toString() || '',
    betItemFullName: team.marketValue || team.betItemFullName?.toString() || '',
    betItemId: oid,
    baseOdds: odds > 0 ? odds : 0,
    oddsStatus: EOddsStatus.Open,
    ob: {
      hmt: 0,
      placeNum: Number(team.placeNum) || 0,
      oid,
      ot: asStr(team.oddsType),
    },
  };
};

export interface FollowBetHandlers {
  clickBetItem: (payload: TClickBetItemPayload) => void;
}

/**
 * 聊天晒单跟单（对齐 emc FollowBetHandler.handleFollowBet）
 * 1. 校验单关 / 未结算 / 必要字段 / 场馆一致
 * 2. 普通赛事：FB 拉 getMatchDetail；OB 拉 fetchOBMatchDetail → 匹配盘口
 * 3. 冠军：用 teamList 静态字段直拼
 * 4. 强制切单关 tab，经 clickBetItem 写入投注单并打开抽屉
 */
export const handleFollowBet = async (
  betInfo: BetShareCard,
  handlers: FollowBetHandlers,
): Promise<boolean> => {
  if (isParlayBet(betInfo)) {
    toast({ type: 'warning', description: '串关不支持跟单' });
    return false;
  }

  const team = getTeam(betInfo);
  if (team?.isSingleSettled || betInfo.isSettled) {
    toast({ type: 'warning', description: '该注单已结算' });
    return false;
  }

  const venueId = String(betInfo.venueId || '').toLowerCase();
  const matchId = String(team?.matchId || betInfo.matchId || '');
  if (!matchId || !venueId) {
    toast({ type: 'warning', description: '赛事信息缺失，无法跟单' });
    return false;
  }

  const store = getGlobalStoreForApiRequest();
  const currentVenue = store.getState().sport.venue;
  // 晒单场馆需与当前场馆一致
  if (venueId !== String(currentVenue)) {
    toast({ type: 'warning', description: '请切换到对应场馆后再跟单' });
    return false;
  }
  if (!SUPPORT_FOLLOW_VENUES.has(String(currentVenue))) {
    toast({ type: 'warning', description: '当前场馆暂不支持跟单' });
    return false;
  }

  const isOb = currentVenue === EVenue.OB;

  // 跟单强制单关（对齐 Flutter isSupportStray=false + 聊天单关 tab）
  store.dispatch(setBetType({ venue: currentVenue, betType: EBetType.Single }));

  const shareOrderId = String(betInfo.orderNo || betInfo.id || '').trim();
  const rememberChatFollow = () => {
    if (!shareOrderId) {
      clearChatFollowContext();
      return;
    }
    setChatFollowContext({
      shareOrderId,
      venueCode: toBetShareVenueCode(venueId || currentVenue),
    });
  };

  // —— 冠军 ——
  if (team?.isChampion) {
    const baseBetItem = isOb ? buildObChampionBetItem(team) : buildFbChampionBetItem(team);
    if (!baseBetItem) {
      toast({ type: 'warning', description: '盘口已关闭' });
      return false;
    }
    store.dispatch(setIsChatBet({ venue: currentVenue, isChatBet: true }));
    rememberChatFollow();
    handlers.clickBetItem({
      baseMatch: {
        sportId: Number(team.sportId) || 0,
        matchId: matchId,
        leagueId: Number(team.leagueId) || 0,
        leagueName: team.leagueName || '',
        homeName: team.homeName || '',
        awayName: team.awayName || '',
        isLive: false,
        isChampion: true,
        bt: team.bt || 0,
      },
      baseBetItem,
    });
    return true;
  }

  const marketId = String(team?.marketId || '');

  try {
    if (isOb) {
      // —— OB 普通赛事：拉详情盘口，按 marketId + oid 匹配 ——
      const playOptionsId = String(team?.playOptionsId || team?.oddsId || '');
      if (!marketId || !playOptionsId) {
        toast({ type: 'warning', description: '盘口信息缺失，无法跟单' });
        return false;
      }

      const detail = await fetchOBMatchDetail({
        matchId,
        sportId: team?.sportId,
      });
      const matchInfo = detail?.matchInfo;
      if (!matchInfo?.matchId) {
        toast({ type: 'warning', description: '盘口已关闭' });
        return false;
      }
      if (isObMatchClosed(matchInfo)) {
        toast({ type: 'warning', description: '盘口已关闭' });
        return false;
      }

      const found = findObBetItem(detail?.typeList ?? [], marketId, playOptionsId);
      if (!found) {
        toast({ type: 'warning', description: '盘口已关闭' });
        return false;
      }

      store.dispatch(setIsChatBet({ venue: currentVenue, isChatBet: true }));
      rememberChatFollow();
      handlers.clickBetItem({
        baseMatch: {
          sportId: matchInfo.sportId,
          matchId: String(matchInfo.matchId),
          leagueId: matchInfo.leagueId ?? 0,
          leagueName: matchInfo.leagueName || '',
          homeName: matchInfo.homeName || '',
          awayName: matchInfo.awayName || '',
          isLive: !!matchInfo.isLive,
          isChampion: false,
          bt: matchInfo.bt || 0,
        },
        baseBetItem: { ...found, canParlay: false },
      });
      return true;
    }

    // —— FB 普通赛事：拉实时详情拼完整投注单 ——
    const selectionTy = team ? resolveSelectionTy(team) : '';
    if (!marketId || !selectionTy) {
      toast({ type: 'warning', description: '盘口信息缺失，无法跟单' });
      return false;
    }

    const res = await getMatchDetailReq({ matchId: matchId });
    const matchData = res.data;
    if (!matchData?.id) {
      toast({ type: 'warning', description: '盘口已关闭' });
      return false;
    }

    if (CLOSED_MATCH_STATUS.has(Number(matchData.ms))) {
      toast({ type: 'warning', description: '盘口已关闭' });
      return false;
    }

    const found = findOptionByMarketAndSelection(matchData.mg, marketId, selectionTy);
    if (!found) {
      toast({ type: 'warning', description: '盘口已关闭' });
      return false;
    }

    // 跟单强制不进串关
    const baseBetItem: TBaseBetItem = {
      ...buildBaseBetItemFromOption(found.marketGroup, found.market, found.option),
      canParlay: false,
    };

    store.dispatch(setIsChatBet({ venue: currentVenue, isChatBet: true }));
    rememberChatFollow();
    handlers.clickBetItem({
      baseMatch: {
        sportId: matchData.sid,
        matchId: String(matchData.id),
        leagueId: matchData.lg?.id ?? 0,
        leagueName: matchData.lg?.na ?? '',
        homeName: matchData.ts?.[0]?.na ?? '',
        awayName: matchData.ts?.[1]?.na ?? '',
        isLive: matchData.ms === Number(EFbMatchStatus.Live),
        isChampion: matchData.ty === 1,
        bt: matchData.bt,
      },
      baseBetItem,
    });
    return true;
  } catch (error) {
    console.error('handleFollowBet failed', error);
    toast({ type: 'error', description: '跟单失败' });
    return false;
  }
};
