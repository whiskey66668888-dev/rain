import type { MessageItem } from '@front-openim/wasm-client-sdk';
import { IM_CONTENT_TYPES } from '../constants/contentTypes';
import {
  isBetShareDescription,
  isConfigEditDescription,
  isHotWordDescription,
  isMatchShareDescription,
  isRetractDescription,
} from '../constants/emcMessage';
import {
  ChatMessageType,
  type BetShareCard,
  type BetShareTeamItem,
  type ChatMessage,
  type ChatUserInfo,
  type MatchShareInfo,
} from '../types/message';

const getString = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
};

const getScore = (value: unknown): string | number | undefined => {
  if (typeof value === 'number' || typeof value === 'string') return value;
  return undefined;
};

const getBool = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') return value;
  if (value === 1 || value === '1' || value === 'true') return true;
  if (value === 0 || value === '0' || value === 'false') return false;
  return undefined;
};

const parseJson = <T>(value?: string): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const clampVip = (level: number): number => Math.max(0, Math.min(10, Math.floor(level) || 0));

const buildMessageId = (message: MessageItem): string =>
  message.clientMsgID || message.serverMsgID || `local_${message.sendTime}_${message.seq}`;

/** 解析本场比赛 payload（对齐 emc SportItemInfo） */
export const normalizeMatchShareInfo = (
  raw: Record<string, unknown> | null | undefined,
): MatchShareInfo | undefined => {
  if (!raw || typeof raw !== 'object') return undefined;
  const homeTeamName = getString(raw.homeTeamName, getString(raw.homeTeam));
  const awayTeamName = getString(raw.awayTeamName, getString(raw.awayTeam));
  return {
    ...raw,
    leagueName: getString(raw.leagueName, getString(raw.league_name)),
    homeTeamName,
    awayTeamName,
    homeTeamIcon: getString(raw.homeTeamIcon, getString(raw.home_team_icon)),
    awayTeamIcon: getString(raw.awayTeamIcon, getString(raw.away_team_icon)),
    homeScore: getScore(raw.homeScore ?? raw.home_score),
    awayScore: getScore(raw.awayScore ?? raw.away_score),
    matchStatusId: getString(raw.matchStatusId, getString(raw.match_status_id)),
    isLive: Boolean(raw.isLive ?? raw.is_live),
    matchId: getString(raw.matchId, getString(raw.match_id)),
    sportId: getString(raw.sportId, getString(raw.sport_id)),
    homeTeam: homeTeamName,
    awayTeam: awayTeamName,
  };
};

/**
 * 序列化为 Flutter SportItemInfo.fromJson 兼容结构。
 * 注意：App 侧 `sportId as String?` / `homeScore as num?` 类型不匹配会整条消息丢弃。
 */
export const serializeMatchShareForFlutter = (info: MatchShareInfo): Record<string, unknown> => {
  const toInt = (value: unknown, fallback = 0): number => {
    if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value);
    if (typeof value === 'string' && value.trim() !== '') {
      const n = Number(value);
      if (Number.isFinite(n)) return Math.trunc(n);
    }
    return fallback;
  };

  const homeTeamName = getString(info.homeTeamName, getString(info.homeTeam));
  const awayTeamName = getString(info.awayTeamName, getString(info.awayTeam));

  return {
    sportId: getString(info.sportId),
    sportName: getString(info.sportName),
    leagueId: getString(info.leagueId),
    leagueName: getString(info.leagueName),
    placeNum: toInt(info.placeNum, 1),
    homeTeamName,
    homeScore: toInt(info.homeScore),
    tennisHomeScore: getString(info.tennisHomeScore),
    halfTimeScore: getString(info.halfTimeScore),
    homeRedCard: toInt(info.homeRedCard),
    homeYellowCard: toInt(info.homeYellowCard),
    homeCornerKick: toInt(info.homeCornerKick),
    homeTeamIcon: getString(info.homeTeamIcon),
    awayTeamName,
    awayScore: toInt(info.awayScore),
    tennisAwayScore: getString(info.tennisAwayScore),
    awayRedCard: toInt(info.awayRedCard),
    awayYellowCard: toInt(info.awayYellowCard),
    awayCornerKick: toInt(info.awayCornerKick),
    awayTeamIcon: getString(info.awayTeamIcon),
    firstHalfScore: getString(info.firstHalfScore),
    matchId: getString(info.matchId),
    matchTime: getString(info.matchTime),
    matchNum: getString(info.matchNum),
    matchStatusId: getString(info.matchStatusId, '0'),
    matchStatus: getString(info.matchStatus),
    matchLiveStatus: getString(info.matchLiveStatus),
    matchDate: getString(info.matchDate),
    bt: toInt(info.bt),
    isLive: Boolean(info.isLive),
    isCountdown: Boolean(info.isCountdown),
    isPreSettle: Boolean(info.isPreSettle),
    scoreList: Array.isArray(info.scoreList) ? info.scoreList : [],
    scoreAll: Array.isArray(info.scoreAll)
      ? (info.scoreAll as unknown[]).map((item) => getString(item))
      : [],
    colType: toInt(info.colType, 1),
    obMatchType: toInt(info.obMatchType, 1),
    detailHomeScore: toInt(info.detailHomeScore, toInt(info.homeScore)),
    detailAwayScore: toInt(info.detailAwayScore, toInt(info.awayScore)),
    fbFlvHD: getString(info.fbFlvHD),
    fbFlvSD: getString(info.fbFlvSD),
    fbM3u8HD: getString(info.fbM3u8HD),
    fbM3u8SD: getString(info.fbM3u8SD),
    mfo: getString(info.mfo),
  };
};

/** 比分文案（对齐 emc getMatchScore） */
export const getMatchScoreText = (info: MatchShareInfo): string => {
  const statusId = String(info.matchStatusId ?? '');
  const isLive = statusId !== '4' && !!info.isLive;
  if (isLive) {
    return `${info.homeScore ?? 0} : ${info.awayScore ?? 0}`;
  }
  return 'VS';
};

/** 规范化晒单 teamList 单项 */
const normalizeBetShareTeam = (raw: unknown): BetShareTeamItem | null => {
  if (!raw || typeof raw !== 'object') return null;
  const t = raw as Record<string, unknown>;
  const marketId = getString(t.marketId, getString(t.market_id, getString(t.mrid)));
  const type = getString(t.type, getString(t.ty));
  const playOptionsId = getString(
    t.playOptionsId,
    getString(t.play_options_id, marketId && type ? `${marketId}_${type}` : ''),
  );
  return {
    ...t,
    matchId: getString(t.matchId, getString(t.match_id, getString(t.mid))),
    sportId: getString(t.sportId, getString(t.sport_id, getString(t.sid))),
    marketId,
    type,
    playOptionsId,
    oddsId: getString(t.oddsId, getString(t.odds_id, playOptionsId)),
    playName: getString(t.playName, getString(t.play_name, getString(t.scoreName))),
    scoreName: getString(t.scoreName, getString(t.score_name, getString(t.playName))),
    marketValue: getString(t.marketValue, getString(t.market_value)),
    oddFinally: getString(t.oddFinally, getString(t.odd_finally)),
    decimalOdds: getScore(t.decimalOdds ?? t.decimal_odds ?? t.oddFinally),
    leagueName: getString(t.leagueName, getString(t.league_name, getString(t.matchName))),
    matchInfo: getString(t.matchInfo, getString(t.match_info)),
    matchName: getString(t.matchName, getString(t.match_name)),
    homeName: getString(t.homeName, getString(t.home_name, getString(t.homeTeamName))),
    awayName: getString(t.awayName, getString(t.away_name, getString(t.awayTeamName))),
    score: getString(t.score, getString(t.resultScore)),
    handicap: getString(t.handicap),
    startTime: getString(t.startTime, getString(t.start_time, getString(t.matchDate))),
    betScore: getString(t.betScore, getString(t.bet_score)),
    betResult: getString(t.betResult, getString(t.bet_result)),
    betStatus: getBool(t.betStatus ?? t.bet_status) ?? false,
    bt: typeof t.bt === 'number' ? t.bt : Number(t.bt || t.matchStartTime || 0) || undefined,
    isChampion: getBool(t.isChampion ?? t.is_champion) ?? false,
    isSingleSettled: getBool(t.isSingleSettled ?? t.is_single_settled) ?? false,
    playId: getString(t.playId, getString(t.play_id)),
    leagueId: getScore(t.leagueId ?? t.league_id),
  };
};

/**
 * 晒单 JSON → BetShareCard（对齐 emc _convertBetCardJsonToBetDataItem 常用字段）
 */
export const normalizeBetShareCard = (
  raw: Record<string, unknown> | null | undefined,
): BetShareCard | undefined => {
  if (!raw || typeof raw !== 'object') return undefined;

  // Data 可能是对象或 JSON 字符串
  let nested: Record<string, unknown> = raw;
  const dataRaw = raw.Data ?? raw.data;
  if (dataRaw && typeof dataRaw === 'object' && !Array.isArray(dataRaw)) {
    nested = dataRaw as Record<string, unknown>;
  } else if (typeof dataRaw === 'string') {
    const parsed = parseJson<Record<string, unknown>>(dataRaw);
    if (parsed) nested = parsed;
  }

  const orderNo = getString(nested.orderNo, getString(nested.order_no));
  const id = getString(nested.id, orderNo);
  const title = getString(
    nested.title,
    (() => {
      const home = getString(nested.homeTeam, getString(nested.home_team));
      const away = getString(nested.awayTeam, getString(nested.away_team));
      if (home && away) return `${home} vs ${away}`;
      return '晒单';
    })(),
  );

  const rawTeamList = (nested.teamList ?? nested.team_list) as unknown[] | undefined;
  const teamList = Array.isArray(rawTeamList)
    ? rawTeamList.map(normalizeBetShareTeam).filter((t): t is BetShareTeamItem => !!t)
    : undefined;

  const firstTeam = teamList?.[0];

  return {
    ...nested,
    id,
    orderNo: orderNo || id,
    title,
    amount: getScore(nested.amount ?? nested.betAmount ?? nested.bet_amount),
    backAmount: getScore(nested.backAmount ?? nested.back_amount ?? nested.winAmount),
    remainingAmt: getScore(nested.remainingAmt ?? nested.remaining_amt),
    oddFinally: getString(nested.oddFinally, getString(nested.odd_finally)),
    venueId: getString(nested.venueId, getString(nested.venue_id)),
    matchId: getString(
      nested.matchId,
      getString(nested.match_id, getString(nested.mid, firstTeam?.matchId ?? '')),
    ),
    isSingle: getBool(nested.isSingle ?? nested.is_single),
    isSettled: getBool(nested.isSettled ?? nested.is_settled),
    betResult: getString(nested.betResult, getString(nested.bet_result)),
    isSettlement: getBool(nested.isSettlement ?? nested.is_settlement) ?? false,
    seriesType: Number(nested.seriesType ?? nested.series_type ?? 0),
    teamList,
  };
};

/** 是否像晒单 JSON（字段兜底识别） */
const looksLikeBetSharePayload = (data: Record<string, unknown> | null): boolean => {
  if (!data) return false;
  return (
    'order_no' in data ||
    'orderNo' in data ||
    (('id' in data || 'Id' in data) && ('teamList' in data || 'team_list' in data))
  );
};

const looksLikeMatchSharePayload = (data: Record<string, unknown> | null): boolean => {
  if (!data) return false;
  return 'matchId' in data && 'homeTeamName' in data && 'awayTeamName' in data;
};

const looksLikeHotWordPayload = (data: Record<string, unknown> | null): boolean => {
  if (!data) return false;
  return 'hotWord' in data;
};

/**
 * 解析未登录历史 content 信封（对齐 emc _parseNotLoginContentEnvelope）
 * 输入可能是 Map / JSON 字符串 / 纯文本
 */
export const parseNotLoginContentEnvelope = (
  raw: unknown,
): {
  description: string;
  payloadMap: Record<string, unknown> | null;
  payloadText: string;
  plainText: string;
} => {
  let envelope: Record<string, unknown> | null = null;
  let plainText = '';

  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    envelope = raw as Record<string, unknown>;
  } else if (typeof raw === 'string') {
    plainText = raw.trim();
    if (plainText) {
      const decoded = parseJson<Record<string, unknown>>(plainText);
      if (decoded) envelope = decoded;
    }
  }

  if (!envelope) {
    return { description: '', payloadMap: null, payloadText: '', plainText };
  }

  const description = getString(envelope.Description, getString(envelope.description)).trim();
  const hasDataField = 'Data' in envelope || 'data' in envelope;
  const dataRaw = envelope.Data ?? envelope.data;

  let payloadMap: Record<string, unknown> | null = null;
  let payloadText = '';

  if (dataRaw && typeof dataRaw === 'object' && !Array.isArray(dataRaw)) {
    payloadMap = dataRaw as Record<string, unknown>;
  } else if (typeof dataRaw === 'string') {
    payloadText = dataRaw.trim();
    if (payloadText) {
      const decoded = parseJson<Record<string, unknown>>(payloadText);
      if (decoded) {
        payloadMap = decoded;
        payloadText = '';
      }
    }
  } else if (typeof dataRaw === 'number' || typeof dataRaw === 'boolean') {
    payloadText = String(dataRaw);
  }

  // 兼容「没有 Data 包装，业务字段直接在顶层」
  if (!hasDataField && !payloadMap) {
    payloadMap = envelope;
  }

  return { description, payloadMap, payloadText, plainText };
};

const extractNotLoginText = (
  payloadMap: Record<string, unknown> | null,
  payloadText: string,
  plainText: string,
): string => {
  const fromMap = getString(
    payloadMap?.text,
    getString(payloadMap?.content, getString(payloadMap?.msg)),
  ).trim();
  if (fromMap) return fromMap;
  if (payloadText.trim()) return payloadText.trim();
  return plainText.trim();
};

/**
 * 游客 not_login/msg_content → ChatMessage
 * 对齐 emc ChatRepository.convertNotLoginHistoryItem
 */
export const convertNotLoginMsgContentToChatMessage = (
  item: Record<string, unknown>,
  options?: { allowedVenueId?: string },
): ChatMessage | null => {
  try {
    const seq = Number(item.seq ?? Date.now());
    const sendTime = Number(item.send_time ?? item.sendTime ?? Date.now());
    const sendId = getString(item.user_id);
    const nickname = getString(item.nickname, '匿名用户');
    const memberLevel = Number(item.member_level ?? 0);
    const contentType = Number(item.content_type ?? item.contentType ?? 0);

    const { description, payloadMap, payloadText, plainText } = parseNotLoginContentEnvelope(
      item.content,
    );

    // 配置变更 / 软撤回信令不展示（对齐登录态）
    if (isConfigEditDescription(description) || isRetractDescription(description)) {
      return null;
    }

    const user: ChatUserInfo = {
      userId: sendId,
      nickname,
      vipLevel: clampVip(memberLevel),
    };

    const clientMsgId = getString(
      item.client_msg_id,
      getString(item.clientMsgID, getString(item.client_msgID)),
    ).trim();

    const base = {
      id: clientMsgId || `not_login_${seq}_${sendTime}`,
      sendTime,
      isMine: false,
      user,
      isImAdmin: sendId === 'imAdmin',
    };

    const isMatchShare =
      isMatchShareDescription(description) || looksLikeMatchSharePayload(payloadMap);
    const isHotWord = isHotWordDescription(description) || looksLikeHotWordPayload(payloadMap);
    // 空 description 不单独判为晒单（需 payload 字段兜底，对齐 Flutter）
    const isBetShare =
      (!!description.trim() && isBetShareDescription(description)) ||
      looksLikeBetSharePayload(payloadMap);

    if (isMatchShare && payloadMap) {
      const matchInfo = normalizeMatchShareInfo(payloadMap);
      return {
        ...base,
        type: ChatMessageType.MatchShare,
        content:
          matchInfo?.homeTeamName && matchInfo?.awayTeamName
            ? `${matchInfo.homeTeamName} vs ${matchInfo.awayTeamName}`
            : matchInfo?.leagueName || '本场比赛',
        matchShareInfo: matchInfo,
      };
    }

    if (isHotWord) {
      const text = getString(payloadMap?.hotWord, payloadText).trim();
      if (!text) return null;
      return { ...base, type: ChatMessageType.HotWord, content: text, hotWord: text };
    }

    if (isBetShare && payloadMap) {
      const betInfo = normalizeBetShareCard(payloadMap);
      if (!betInfo) return null;

      // 仅晒单按场馆过滤（对齐 Flutter）
      const allowedVenueId = options?.allowedVenueId?.toLowerCase();
      const venueId = String(betInfo.venueId || '').toLowerCase();
      if (allowedVenueId && venueId && venueId !== allowedVenueId) {
        return null;
      }

      return {
        ...base,
        type: ChatMessageType.BetShare,
        content: betInfo.title || '晒单',
        betInfo,
      };
    }

    // 超管非文本丢弃
    if (sendId === 'imAdmin' && contentType !== 101 && contentType !== IM_CONTENT_TYPES.TEXT) {
      return null;
    }

    const text = extractNotLoginText(payloadMap, payloadText, plainText);
    if (!text) return null;

    return {
      ...base,
      type: ChatMessageType.Text,
      content: text,
    };
  } catch {
    return null;
  }
};

/**
 * 游客历史批量转换：先收集软撤回目标，再过滤（对齐登录态 retractMap）
 */
export const convertNotLoginMsgContentList = (
  list: Record<string, unknown>[],
  options?: { allowedVenueId?: string },
): ChatMessage[] => {
  const retractIds = new Set<string>();

  for (const item of list) {
    const { description, payloadMap } = parseNotLoginContentEnvelope(item.content);
    if (!isRetractDescription(description) || !payloadMap) continue;
    const id = getString(payloadMap.client_msg_id, getString(payloadMap.clientMsgID)).trim();
    if (id) retractIds.add(id);
  }

  return list
    .map((item) => {
      const clientId = getString(
        item.client_msg_id,
        getString(item.clientMsgID, getString(item.client_msgID)),
      ).trim();
      if (clientId && retractIds.has(clientId)) return null;
      return convertNotLoginMsgContentToChatMessage(item, options);
    })
    .filter((item): item is ChatMessage => !!item)
    .sort((a, b) => a.sendTime - b.sendTime);
};

/**
 * 解析软撤回（对齐 emc _extractRetractInfo）
 * data: { client_msg_id, visible_for_self_only }
 */
export const extractRetractInfo = (
  message: MessageItem,
): { clientMsgId: string; visibleForSelfOnly: boolean } | null => {
  if (Number(message.contentType) !== IM_CONTENT_TYPES.CUSTOM) return null;
  const description = message.customElem?.description ?? '';
  if (!isRetractDescription(description)) return null;
  const payload = parseJson<Record<string, unknown>>(message.customElem?.data);
  const clientMsgId = getString(payload?.client_msg_id, getString(payload?.clientMsgID));
  if (!clientMsgId) return null;
  return {
    clientMsgId,
    visibleForSelfOnly: Boolean(payload?.visible_for_self_only ?? payload?.visibleForSelfOnly),
  };
};

export interface ConvertImMessageOptions {
  selfUserId?: string;
  usersInfoMap?: Map<string, ChatUserInfo>;
  selfVipLevel?: number;
}

const resolveUserInfo = (
  message: MessageItem,
  selfUserId?: string,
  usersInfoMap?: Map<string, ChatUserInfo>,
  selfVipLevel = 0,
): ChatUserInfo => {
  const userId = message.sendID || '';
  const nickname = message.senderNickname || userId || '匿名用户';
  const isMine = !!selfUserId && userId === selfUserId;

  if (isMine) {
    return { userId, nickname, vipLevel: clampVip(selfVipLevel) };
  }

  const fromMap = usersInfoMap?.get(userId);
  if (fromMap) {
    return {
      userId: fromMap.userId || userId,
      nickname: fromMap.nickname || nickname,
      vipLevel: clampVip(fromMap.vipLevel),
    };
  }

  return { userId, nickname, vipLevel: 0 };
};

/**
 * OpenIM Message → 本地 ChatMessage（对齐 emc convertImMessageToMessage）
 */
export const convertImMessageToChatMessage = (
  message: MessageItem,
  selfUserIdOrOptions?: string | ConvertImMessageOptions,
): ChatMessage | null => {
  const options: ConvertImMessageOptions =
    typeof selfUserIdOrOptions === 'string' || selfUserIdOrOptions === undefined
      ? { selfUserId: selfUserIdOrOptions }
      : selfUserIdOrOptions;

  const { selfUserId, usersInfoMap, selfVipLevel = 0 } = options;
  const userId = message.sendID || '';
  if (!userId) return null;

  // 配置变更 / 软撤回：不入列表（由上层单独处理撤回）
  if (Number(message.contentType) === IM_CONTENT_TYPES.CUSTOM) {
    const description = message.customElem?.description ?? '';
    if (isConfigEditDescription(description)) return null;
    if (isRetractDescription(description)) return null;
  }

  const user = resolveUserInfo(message, selfUserId, usersInfoMap, selfVipLevel);
  const base: Omit<ChatMessage, 'type' | 'content'> = {
    id: buildMessageId(message),
    sendTime: Number(message.sendTime || Date.now()),
    isMine: !!selfUserId && userId === selfUserId,
    user,
    rawMessage: message,
    extension: message.customElem?.extension,
  };

  // —— 文本 ——
  if (Number(message.contentType) === IM_CONTENT_TYPES.TEXT) {
    return {
      ...base,
      type: ChatMessageType.Text,
      isImAdmin: userId === 'imAdmin',
      content: message.textElem?.content ?? '',
    };
  }

  // —— 引用（114）：仍为 Text，可内嵌赛事卡片 ——
  if (Number(message.contentType) === IM_CONTENT_TYPES.QUOTE) {
    let quotedMatch: MatchShareInfo | undefined;
    try {
      const quoteMsg = message.quoteElem?.quoteMessage;
      if (
        quoteMsg &&
        Number(quoteMsg.contentType) === IM_CONTENT_TYPES.CUSTOM &&
        isMatchShareDescription(quoteMsg.customElem?.description)
      ) {
        quotedMatch = normalizeMatchShareInfo(
          parseJson<Record<string, unknown>>(quoteMsg.customElem?.data) ?? undefined,
        );
      }
    } catch {
      // ignore
    }
    return {
      ...base,
      type: ChatMessageType.Text,
      content: message.quoteElem?.text ?? '',
      quotedMatchShareInfo: quotedMatch,
      matchShareInfo: quotedMatch,
    };
  }

  // —— 系统通知 ——
  if (Number(message.contentType) === IM_CONTENT_TYPES.OA_NOTIFICATION) {
    return {
      ...base,
      type: ChatMessageType.SystemNotice,
      content: message.notificationElem?.detail || message.content || '系统通知',
    };
  }

  if (Number(message.contentType) !== IM_CONTENT_TYPES.CUSTOM) return null;

  const description = (message.customElem?.description || '').trim();
  const payload = parseJson<Record<string, unknown>>(message.customElem?.data);

  // 热词（value HotWord / label 热词消息）
  if (isHotWordDescription(description)) {
    const text = getString(payload?.hotWord, getString(payload?.content, getString(payload?.text)));
    return {
      ...base,
      type: ChatMessageType.HotWord,
      hotWord: text,
      content: text,
    };
  }

  // 本场比赛（value MatchShare / label 本场比赛）
  if (isMatchShareDescription(description)) {
    const matchInfo = normalizeMatchShareInfo(payload ?? undefined);
    const content =
      matchInfo?.leagueName ||
      (matchInfo?.homeTeamName && matchInfo?.awayTeamName
        ? `${matchInfo.homeTeamName} vs ${matchInfo.awayTeamName}`
        : getString(payload?.title, getString(payload?.content, '本场比赛')));
    return {
      ...base,
      type: ChatMessageType.MatchShare,
      content,
      matchShareInfo: matchInfo,
    };
  }

  // 晒单（Emc1 / 晒单消息 / 大单消息 / 空 / 字段兜底）
  if (isBetShareDescription(description) || looksLikeBetSharePayload(payload)) {
    if (!payload && !message.customElem?.data) return null;
    const betInfo = normalizeBetShareCard(payload ?? undefined);
    return {
      ...base,
      type: ChatMessageType.BetShare,
      content: betInfo?.title || '晒单',
      betInfo,
    };
  }

  return null;
};
