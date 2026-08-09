import request from '@core/sdk/request';
import type { ResponseData } from '@core/sdk/request/model';

/**
 * 福利中心列表接口入参
 */
export interface WelfareCenterParams {
  /** 状态：'' 全部，0 未领取，-2 已过期，9 已领取 */
  status?: string | number;
  pageSize: number;
  pageNumber: number;
  /** 开始日期 YYYY-MM-DD */
  start: string;
  /** 结束日期 YYYY-MM-DD */
  end: string;
}

/**
 * 福利中心单条活动
 */
export interface WelfareCenterItem {
  id: number;
  /** 状态：0 未领取；-2 已过期；9 已领取 */
  status: number;
  statusName?: string;
  /** 有效期文案：如“9天23小时59分” */
  validTime?: string;
  /** 过期时间 */
  validDate?: string;
  /** 领取时间 */
  confirmTime?: string;

  /** 角标文案，如“存送优惠” */
  bonusTagName?: string;
  /** 活动名称 */
  bonusType?: string;
  /** 适用场馆，如“全平台” */
  platformType?: string;
  /** 流水倍数 */
  multiple?: number | string;
  /** 礼金金额字符串，如“120.00” */
  cashStr?: string;
  /** 钱包类型（用于判断是否返水等） */
  walletType?: number;
  /** 是否返水标记 */
  isRebate?: number;
  /** 取款流水金额 */
  turnoverAmount?: number | string;

  /** 发放时间 */
  addTime?: string;
}

/**
 * 福利中心列表接口返回结构
 */
export interface WelfareCenterResponse {
  dataList: WelfareCenterItem[];
  /** 总页数 */
  totalPages: number;
  /** 记录总数 */
  totalSize: number;
  /** 总金额 */
  totalCash: string;
}

/**
 * 福利中心列表
 */
export const getWelfareCenterReq = (
  data: WelfareCenterParams,
): Promise<ResponseData<WelfareCenterResponse>> => {
  return request.post<WelfareCenterResponse, WelfareCenterParams>('/api/center/welfareCenter3', {
    body: data,
  });
};

/**
 * 领取福利入参
 */
export interface DistributeBonusParams {
  id: number;
}

/**
 * 领取福利
 */
export const distributeBonusReq = (data: DistributeBonusParams): Promise<ResponseData<unknown>> => {
  return request.post<unknown, DistributeBonusParams>('/api/bonusjson/distributeBonus', {
    body: data,
  });
};
