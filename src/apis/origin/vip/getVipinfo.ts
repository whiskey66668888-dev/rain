import { useQuery } from '@tanstack/react-query';
import request from '@/core/sdk/request';
import { ResponseData } from '@/core/sdk/request/model';

/* ====================== */
/* ===== Types ========== */
/* ====================== */

/**
 * VIP 等级信息
 */
export interface VipLevelInfo {
  /* ===== 基本信息 ===== */
  /** VIP 等级 (0-10) */
  level: number;
  /** VIP 名称 */
  name: string;
  /** 分组 ID */
  groupId: number;
  /** 是否显示该等级 */
  showLevel: boolean;
  /** 礼物描述 */
  gift: string;

  /* ===== 打码/存款要求 ===== */
  /** 累计打码量 */
  betCash: string;
  /** 累计存款金额 */
  depositCash: string;
  /** 保级所需打码量 */
  keepBetCash: string;

  /* ===== 返水比例 ===== */
  /** 电竞返水比例 */
  esportRebates: string;
  /** 足球返水比例 */
  footballRebates: string;
  /** 体育返水比例 */
  sportsRebates: string;
  /** 老虎机返水比例 */
  slotRebates: string;
  /** 视频游戏返水比例 */
  videoRebates: string;
  /** 扑克返水比例 */
  pokerRebates: string;

  /* ===== 救援金 ===== */
  /** 老虎机救援金 */
  slotRescueCash: string;
  /** 扑克救援金 */
  pokerRescueCash: string;

  /* ===== 返水上限 ===== */
  /** 视频游戏返水上限 */
  videoRebatesMax: string;
  /** 红包次数上限 */
  hongbaoNumsMax: string;

  /* ===== 提款限制 ===== */
  /** 单次提款上限 */
  outMoneyMax: string;
  /** 每日提款次数上限 */
  outNumsMax: number;

  /* ===== 生日礼金 ===== */
  /** 生日礼金金额 */
  birthdayCash: string;
  /** 生日礼金状态 (-1: 未到生日, 0: 可领取, 1: 已领取) */
  birthdayCashStatus: number;

  /* ===== 月俸禄 ===== */
  /** 月俸禄金额 */
  monthCash: string;
  /** 月俸禄状态 (-1: 未满足条件, 0: 可领取, 1: 已领取) */
  monthStatus: number;

  /* ===== 周俸禄 ===== */
  /** 周俸禄金额 */
  weekCash: string;
  /** 周俸禄流水要求 */
  weekCashLiquid: string;
  /** 周俸禄状态 (-1: 未满足条件, 0: 可领取, 1: 已领取) */
  weekBonusStatus: number;

  /* ===== 晋级礼金 ===== */
  /** 晋级礼金金额 */
  upgradeHelpCash: string;
  /** 晋级礼金状态 (-9: 未满足条件, 0: 可领取, 1: 已领取) */
  upgradeHelpCashStatus: number;

  /* ===== 优惠活动 ===== */
  /** 优惠金额 */
  promotionCash: string;
  /** 优惠状态 (-1: 未满足条件, 0: 可领取, 1: 已领取) */
  promotionStatus: number;

  /* ===== 基金费率 ===== */
  /** 基金费率 */
  fundRate: string;
}

/**
 * VIP 信息完整结构
 */
export interface VipInfo {
  /** 登录名 */
  loginName: string;
  /** 当前 VIP 等级 (0-10) */
  level: number;
  /** 下一个等级 */
  nextLevel: number;
  /** VIP 名称 */
  name: string;

  /* ===== 升级相关 ===== */
  /** 升级所需打码量 */
  nextBetCash: string;
  /** 升级所需存款金额 */
  nextDepositCash: string;
  /** 升级所需保级打码量 */
  nextKeepBetCash: string;
  /** 升级礼金 */
  memberVipUpgradeHelpBonus: number;
  /** 是否已领取升级礼金 */
  isAlreadyGetMemberVipUpgradeHelpBonus: boolean;

  /* ===== 保级相关 ===== */
  /** 保级所需打码量 */
  needKeepBetCash: string;
  /** 保级时间 */
  keepDate: string;
  /** 保级返水比例 */
  keepSchedule: string;
  /** 保级打码金额 */
  keepBetCash: string;
  /** 是否有保级要求 */
  hasKeep: boolean;

  /* ===== 累计数据 ===== */
  /** 累计打码量 */
  betCash: string;
  /** 累计存款金额 */
  depositCash: string;

  /* ===== 返水相关 ===== */
  /** 当前返水比例 */
  schedule: string;
  /** 是否超过 75% 进度 */
  isOver75Percent: boolean;

  /* ===== 状态标识 ===== */
  /** 是否已领取升级礼金状态码 (-9: 未满足条件, 0: 未领取, 1: 已领取) */
  statusAlreadyGetMemberVipUpgradeHelpBonus: number;
  /** 升级帮助奖励来源 */
  vipUpgradeHelpBonusFrom: string;

  /* ===== VIP 等级列表 ===== */
  /** 所有 VIP 等级信息 */
  levelList: VipLevelInfo[];
}

/**
 * VIP 规则项
 */
export interface VipRuleItem {
  /** 规则 ID */
  id: number;
  /** 信息类型 */
  infoType: string;
  /** 规则标题 */
  title: string;
  /** 规则内容 (HTML 格式) */
  content: string;
  /** 排序顺序 */
  sort: number;
}

/**
 * VIP 规则响应（数组类型）
 */
export type VipRuleInfo = VipRuleItem[];

/* ====================== */
/* ===== Request ======== */
/* ====================== */

/**
 * 获取 VIP 信息
 */
export const getVipinfoReq = (): Promise<ResponseData<VipInfo>> => {
  return request.post<VipInfo, void>('/api/member/vip/info', {
    isErrorToast: false,
  });
};

/**
 * 获取 VIP 规则
 */
export const getRuleInfoReq = (): Promise<ResponseData<VipRuleInfo>> => {
  return request.post<VipRuleInfo, void>('/api/home/text/info/vip', {
    isErrorToast: false,
  });
};

/* ====================== */
/* ===== Hooks ========== */
/* ====================== */

/**
 * 获取 VIP 信息 Hook
 */
export const useVipInfo = () => {
  return useQuery({
    queryKey: ['vipInfo'],
    queryFn: getVipinfoReq,
    staleTime: 5 * 60 * 1000, // 5 分钟
    select: (response) => response.data,
  });
};

/**
 * 获取 VIP 规则 Hook
 */
export const useVipRule = () => {
  return useQuery({
    queryKey: ['vipRule'],
    queryFn: getRuleInfoReq,
    staleTime: 5 * 60 * 1000, // 30 分钟
    select: (response) => response.data,
  });
};
