/** 推荐项（统计/洞察 + 快速投注） */
export interface MatchRecommendItem {
  /** 推荐文案，如「最近2场赫塔菲的客场比赛均至少赢1球」 */
  tip: string;
  /** 玩法名称，如「全场让球」 */
  betTypeName: string;
  /** 盘口文案，如「西雅图海湾人 -2.5」 */
  handicap: string;
  /** 赔率，如「2.31」 */
  odds: string;
  marketId?: string;
  selectionId?: string;
}

export interface VideoLine {
  url: string;
  refererUrl?: string;
}
