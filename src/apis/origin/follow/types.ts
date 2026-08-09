/**
 * 体育赛事关注（v2 三端同步）相关类型
 *
 * 说明：
 * - 关注数据以 JSON 原样存储在后端表 `member_sports_match_follow`，App / Web / H5 三端共享。
 * - 与旧接口 `/api/game/match/follow/*` 相互独立，新端只对接 v2 接口。
 * - 详见 .claude/api.md
 */

/** 关注来源 */
export enum EFollowSource {
  /** 手动关注（默认） */
  Manual = 1,
  /** 投注成功自动关注 */
  Betting = 2,
}

/** 添加/更新关注请求参数 */
export interface FollowAddParams {
  /** 体育平台编码，如 `FB` */
  gameType: string;
  /** 赛事 ID */
  matchId: string;
  /** 赛事 JSON 字符串，与 App 本地缓存结构一致，后端原样存取 */
  matchData: string;
  /** 开赛时间，格式 `yyyy-MM-dd HH:mm:ss` */
  matchTime?: string;
  /** 完赛时间，用于完赛后 24h 自动过期 */
  matchEndTime?: string;
  /** 关注来源：1 手动（默认），2 投注自动 */
  source?: EFollowSource;
  /** 是否冠军赛事；`true` 且 `source=2` 时后端静默跳过不写入 */
  champion?: boolean;
}

/** 查询关注列表请求参数 */
export interface FollowListParams {
  /** 体育平台编码，如 `FB` */
  gameType: string;
}

/** 关注列表项 */
export interface FollowItem {
  /** 赛事 ID */
  matchId: string;
  /** 赛事 JSON 字符串（原样返回，由前端解析） */
  matchData: string;
  /** 开赛时间 */
  matchTime: string;
  /** 完赛时间，可为 null */
  matchEndTime: string | null;
  /** 关注来源：1 手动，2 投注自动 */
  source: EFollowSource;
  /** 首次关注时间 */
  addTime: string;
  /** 最后更新时间 */
  updateTime: string;
}

/** 取消关注请求参数 */
export interface FollowDelParams {
  /** 体育平台编码，如 `FB` */
  gameType: string;
  /** 赛事 ID */
  matchId: string;
}

/** 批量同步的单条关注项（字段同 add，额外带 updateTime 用于冲突合并） */
export interface FollowSyncItem {
  /** 赛事 ID */
  matchId: string;
  /** 赛事 JSON */
  matchData: string;
  /** 开赛时间 */
  matchTime?: string;
  /** 完赛时间 */
  matchEndTime?: string;
  /** 客户端最后更新时间，用于冲突合并 */
  updateTime?: string;
  /** 关注来源 */
  source?: EFollowSource;
  /** 是否冠军赛事 */
  champion?: boolean;
}

/** 批量同步请求参数 */
export interface FollowSyncParams {
  /** 体育平台编码，如 `FB` */
  gameType: string;
  /** 本地关注列表（发送前会序列化为 JSON 数组字符串） */
  list: FollowSyncItem[];
}

/** 批量同步响应数据 */
export interface FollowSyncResult {
  /** 实际写入或更新的条数 */
  syncCount: number;
  /** 同步后云端最终关注列表 */
  list: FollowItem[];
}
