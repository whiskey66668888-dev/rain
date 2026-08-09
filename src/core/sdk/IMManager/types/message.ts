import type { MessageItem } from '@front-openim/wasm-client-sdk';
import type { ChatMuteInfo } from './mute';

export enum ChatMessageType {
  Text = 101,
  BetShare = 1101,
  HotWord = 1102,
  MatchShare = 1103,
  SystemNotice = 1400,
  MuteNotice = 1500,
}

export interface ChatUserInfo {
  userId: string;
  nickname: string;
  vipLevel: number;
  hasSharedOrder?: boolean;
}

/** 晒单 teamList 单项（对齐 emc TeamItem 跟单关键字段） */
export interface BetShareTeamItem {
  matchId?: string;
  sportId?: string;
  marketId?: string;
  /** 选项类型 ty，FB 跟单匹配用 */
  type?: string;
  /** FB: `${mrid}_${ty}`；匹配时优先用 type */
  playOptionsId?: string;
  oddsId?: string;
  playName?: string;
  scoreName?: string;
  marketValue?: string;
  oddFinally?: string;
  decimalOdds?: string | number;
  leagueName?: string;
  matchInfo?: string;
  matchName?: string;
  homeName?: string;
  awayName?: string;
  score?: string;
  /** 盘口数值（如 +0.5） */
  handicap?: string;
  /** 开赛时间文案或时间戳字符串 */
  startTime?: string;
  /** 下注时比分 */
  betScore?: string;
  betResult?: string;
  betStatus?: boolean;
  bt?: number;
  matchDate?: string;
  isChampion?: boolean;
  isSingleSettled?: boolean;
  playId?: string;
  leagueId?: string | number;
  [key: string]: unknown;
}

/** 晒单卡片（对齐 emc BetDataItem 常用字段，其余透传） */
export interface BetShareCard {
  id?: string;
  title?: string;
  amount?: string | number;
  /** 可返还 / 返还金额 */
  backAmount?: string | number;
  remainingAmt?: string | number;
  /** 串关总赔率 */
  oddFinally?: string;
  orderNo?: string;
  venueId?: string;
  matchId?: string;
  isSingle?: boolean;
  isSettled?: boolean;
  /** 总单结算结果（对齐 emc BetDataItem.betResult：2和/3输/4赢/5赢半/6输半/7取消…） */
  betResult?: string;
  /** 是否提前结算（对齐 emc isSettlement → advance 图标） */
  isSettlement?: boolean;
  seriesType?: number;
  teamList?: BetShareTeamItem[];
  [key: string]: unknown;
}

/**
 * 本场比赛分享（对齐 emc SportItemInfo 聊天卡片用字段）
 * Flutter MatchStageWidget 实际展示：联赛名 / 主客队 / 队徽 / 比分或 VS
 */
export interface MatchShareInfo {
  leagueName?: string;
  homeTeamName?: string;
  awayTeamName?: string;
  homeTeamIcon?: string;
  awayTeamIcon?: string;
  homeScore?: string | number;
  awayScore?: string | number;
  matchStatusId?: string;
  isLive?: boolean;
  matchId?: string;
  sportId?: number | string;
  /** 兼容旧字段 */
  homeTeam?: string;
  awayTeam?: string;
  [key: string]: unknown;
}

export interface ChatMessage {
  id: string;
  type: ChatMessageType;
  content: string;
  sendTime: number;
  isMine: boolean;
  user?: ChatUserInfo;
  betInfo?: BetShareCard;
  hotWord?: string;
  matchShareInfo?: MatchShareInfo;
  /** 引用消息内嵌的赛事卡片（contentType=114） */
  quotedMatchShareInfo?: MatchShareInfo;
  isImAdmin?: boolean;
  rawMessage?: MessageItem;
  extension?: string;
  muteSnapshot?: ChatMuteInfo | null;
}

export interface SendMessageResult {
  message?: MessageItem;
  errorCode?: number;
  errorMsg?: string;
  clientMsgID?: string;
  sessionType?: number;
}

export interface RetractInfo {
  clientMsgId: string;
  visibleForSelfOnly: boolean;
}

export interface NewIncomingMessagePayload {
  message: ChatMessage;
  shouldSyncConfig?: boolean;
  isRetractEvent?: boolean;
  retractClientMsgId?: string;
  retractVisibleForSelfOnly?: boolean;
}
