/**
 * 单场比赛数据结构（TS 版本）
 *
 * 复刻自 App 端 Dart 模型：
 * emc/lib/pages/homeSport/index/list.model.dart -> class SportItemInfo
 *
 * 用途：收藏（关注）单场比赛时，向 App 端约定的数据结构对齐。
 *
 * 说明：
 * - 源数据 match 为 web 端的 MatchBaseInfo。
 * - Dart 中很多 id/数值字段是 String 类型，这里映射时按 Dart 的类型做了 String() 转换。
 * - 凡是 MatchBaseInfo 中【缺少】或【含义不确定】的字段，均在对应位置用 TODO 注释标出。
 */

import type { MatchBaseInfo } from './types';

// 赔率数据模型（对应 Dart OddsItemInfo）
export class OddsItemInfo {
  type = ''; // 类型
  isLock = true; // 是否锁定
  oddsId = ''; // 比分id
  oddsType = ''; // 投注项
  marketId = ''; // 盘口id
  handicap = ''; // 赔率名称
  group = -1; // bti: selections 分组号（相同 group 为一组）
  lineValue = ''; // 盘口线值（用于多线分组）
  isSupportHK = false; // 是否支持香港盘
  oddsValue: unknown = 0; // 比分赔率未计算之前值 (投注使用)
  odds = ''; // 比分赔率
  oddsHK = ''; // 比分赔率(香港盘)
  teamIcon?: string = ''; // 队伍icon
}

// 比分数据模型（对应 Dart ScoreItemInfo）
export class ScoreItemInfo {
  scoreName = ''; // 比分名称
  scoreLocalName = ''; // 比分本地名称
  scoreId = ''; // 比分id
  isSupportStray = false; // 是否支持串关
  playId = ''; // 玩法id
  lineTypeId = 0; // bti LineTypeId
  lineTypeName = ''; // bti LineTypeName
  sIndex = 0; // 当前条目在 scoreList 中的 index
  list: OddsItemInfo[] = []; // 赔率列表
}

// 赛事模型（对应 Dart SportItemInfo）
export class SportItemInfo {
  sportId = ''; // 赛种id（Dart 为 String）
  /**
   * 赛种展示 id（web 端 MatchBaseInfo.viewId）。
   * App 端 SportItemInfo 无此字段，但 Dart fromJson 会忽略未知键，故存到 matchData 中不影响 App。
   * web 关注列表按 viewId 分组/筛选，存下它才能在从服务器还原时正确归类。
   */
  viewId = 0;
  sportName = ''; // 赛种名称
  leagueId = ''; // 联赛id（Dart 为 String）
  leagueName = ''; // 联赛名称
  placeNum = 1; // 坑位(OB投注使用)
  homeTeamName = ''; // 主队名称
  homeScore = 0; // 主队比分
  tennisHomeScore?: string = ''; // 网球比分(主队)
  homeRedCard?: number = 0; // 主队红牌比分<足球有>
  homeYellowCard?: number = 0; // 主队黄牌比分<足球有>
  homeCornerKick?: number = 0; // 主队角球比分<足球有>
  homeTeamIcon = ''; // 主队icon
  awayTeamName = ''; // 客队名称
  awayScore = 0; // 客队比分
  tennisAwayScore?: string = ''; // 网球比分(客队)
  halfTimeScore = ''; // 半场比分 ob使用
  awayRedCard?: number = 0; // 客队红牌比分<足球有>
  awayYellowCard?: number = 0; // 客队黄牌比分<足球有>
  awayCornerKick?: number = 0; // 客队角球比分<足球有>
  awayTeamIcon = ''; // 客队icon
  firstHalfScore = ''; // 上半场比分
  matchId = ''; // 赛事id（Dart 为 String）
  matchTime = ''; // 赛事进行时间（Dart 为 String）
  matchNum = ''; // 赛事数目（Dart 为 String）
  matchStatusId = '0'; // 赛事状态id（Dart 为 String）
  matchStatus = ''; // 赛事状态
  matchLiveStatus = ''; // 进行中赛事状态
  matchDate = ''; // 赛事开始时间
  bt = 0; // 赛事开始时间(时间戳)
  isLive = false; // 比赛阶段
  isCountdown = false; // 显示倒计时
  isPreSettle = false; // 提前结算
  scoreList: ScoreItemInfo[] = []; // 比分列表
  scoreAll: string[] = []; // 一场赛事不同阶段的比分
  colType?: number = 1; // 栏目类型 滚球 今日 早盘
  obMatchType?: number = 1; // 1-早盘 2-滚球 3-冠军 4-虚拟 5-电竞
  detailHomeScore = 0; // 详情主队比分
  detailAwayScore = 0; // 详情客队比分
  fbFlvHD = ''; // 详情视频坑位
  fbFlvSD = '';
  fbM3u8HD = '';
  fbM3u8SD = '';
  mfo = ''; // 电竞赛制回合 BO1/BO3…，非电竞或未录入为空

  /**
   * 将 web 端 MatchBaseInfo 映射为 App 端约定的 SportItemInfo。
   * 收藏（关注）时调用。
   */
  static fromMatch(match: MatchBaseInfo): SportItemInfo {
    const item = new SportItemInfo();

    // ===== 可直接映射的字段 =====
    item.sportId = String(match.sportId);
    item.viewId = Number(match.viewId);
    item.sportName = match.sportName;
    item.leagueId = String(match.leagueId);
    item.leagueName = match.leagueName;
    item.homeTeamName = match.homeName;
    item.homeScore = match.homeScore;
    item.tennisHomeScore = match.tennisHomeScore ?? '';
    item.homeRedCard = match.homeRedCard ?? 0;
    item.homeYellowCard = match.homeYellowCard ?? 0;
    item.homeCornerKick = match.homeCornerKick ?? 0;
    item.homeTeamIcon = match.homeLogo;
    item.awayTeamName = match.awayName;
    item.awayScore = match.awayScore;
    item.tennisAwayScore = match.tennisAwayScore ?? '';
    item.halfTimeScore = match.halfTimeScore;
    item.awayRedCard = match.awayRedCard ?? 0;
    item.awayYellowCard = match.awayYellowCard ?? 0;
    item.awayCornerKick = match.awayCornerKick ?? 0;
    item.awayTeamIcon = match.awayLogo;
    item.firstHalfScore = match.firstHalfScore;
    item.matchId = String(match.matchId);
    item.matchTime = String(match.matchTime);
    item.matchNum = String(match.matchNum);
    item.matchStatusId = String(match.matchStatusId);
    item.matchStatus = match.matchStatus;
    item.matchDate = match.matchDate;
    item.bt = match.bt;
    item.isLive = match.isLive;
    item.isCountdown = match.isCountdown;
    item.scoreAll = match.scoreAll ?? [];
    item.detailHomeScore = match.detailHomeScore;
    item.detailAwayScore = match.detailAwayScore;

    // matchLiveStatus（进行中赛事状态）：App 端非接口原始字段，由 isLive + mmp(matchStatusId) 派生。
    // 主规则：滚球中且 mmp==0 显示“即将开始”，否则为空。
    // 注：电竞(局名)/完场("Ended") 的特判此处未覆盖，web 列表若需要可再补。
    item.matchLiveStatus = match.isLive && match.matchStatusId === 0 ? '即将开始' : '';

    // ===== 含义不确定 / 缺失的字段（TODO 待确认） =====
    // TODO: placeNum（坑位，OB投注使用）—— MatchBaseInfo 中无该字段，暂用默认 1
    // TODO: isPreSettle（提前结算）—— MatchBaseInfo 无对应字段；match.canPreBet 是“是否可提前投注”，语义不同，待确认
    // TODO: scoreList（比分/赔率列表 ScoreItemInfo[]）—— match.children 为 MatchMarket[]，结构不同，需另写转换逻辑
    // TODO: colType（栏目类型 滚球/今日/早盘）—— MatchBaseInfo 中无该字段
    // TODO: obMatchType（早盘/滚球/冠军/虚拟/电竞）—— MatchBaseInfo 中无该字段，可考虑由 isLive/isChampion 推导
    // TODO: fbFlvHD / fbFlvSD / fbM3u8HD / fbM3u8SD（视频坑位）—— MatchBaseInfo 仅有 TVUrl，无清晰对应字段
    // TODO: mfo（电竞赛制回合 BO1/BO3）—— MatchBaseInfo 中无该字段

    return item;
  }
}
