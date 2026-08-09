import request from '@core/sdk/request';
import type { ResponseData } from '@core/sdk/request/model';

export interface GetRebateParams {
  [key: string]: unknown;
}

export interface RebateTop10Item {
  id?: number;
  bonusName?: string;
  addTime?: string;
  cash?: string | number;
  statusName?: string;
  status?: number;
}

export interface RebateTop10Response {
  data?: RebateTop10Item[];
  totalPage?: number;
}

// 获取实时返水（可领取金额）
export const getRebate = (data?: GetRebateParams): Promise<ResponseData<string | number>> => {
  return request.post<string | number, GetRebateParams>('/api/discount/rebate/get', {
    body: data ?? {},
  });
};

export interface RebateSaveParams {
  [key: string]: unknown;
}

// 领取返水
export const rebateSave = (data?: RebateSaveParams): Promise<ResponseData<unknown>> => {
  return request.post<unknown, RebateSaveParams>('/api/discount/rebate/save', {
    body: data ?? {},
  });
};

export interface RebateTop10Params {
  [key: string]: unknown;
}

// 返水记录（最近10条）
export const rebateTop10 = (
  data?: RebateTop10Params,
): Promise<ResponseData<RebateTop10Response>> => {
  return request.post<RebateTop10Response, RebateTop10Params>('/api/discount/rebate/top10', {
    body: data ?? {},
  });
};

export interface RebateListParams {
  type: '0' | '1' | '2';
  start: string;
  end: string;
  pageSize: number;
  pageNumber: number;
}

export interface RebateListResponse {
  data?: RebateTop10Item[];
  totalPage?: number;
  totalSize?: number;
  totalCash?: string | number;
}

// 返水记录（分页）
export const getRebateList = (
  data: RebateListParams,
): Promise<ResponseData<RebateListResponse>> => {
  return request.post<RebateListResponse, RebateListParams>('/api/discount/rebate/list', {
    body: data,
  });
};
