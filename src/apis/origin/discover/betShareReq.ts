import request from '@/core/sdk/request';
import type { ResponseData } from '@/core/sdk/request/model';

import type { BetShareSubmitResult, SubmitFollowParams, SubmitShareParams } from './betShareTypes';

/**
 * 晒单 / 跟单写接口以 JSON body 提交。
 * 主站默认 sharedData 会把对象转成 form-urlencoded；这里与 follow/http 一致：
 * 传 JSON 字符串 + Content-Type: application/json。
 */
const postBetShareJson = <TResponse>(
  url: string,
  params: object,
): Promise<ResponseData<TResponse>> =>
  request.post<TResponse, string>(url, {
    isErrorToast: false,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

const normalizeResult = (data: unknown): BetShareSubmitResult => {
  const raw = (data ?? {}) as Partial<BetShareSubmitResult>;
  return {
    success: !!raw.success,
    inserted: !!raw.inserted,
    message: typeof raw.message === 'string' ? raw.message : '',
  };
};

/**
 * 注单晒单
 * POST /api/betshare/submitShare
 * 登录态由服务端解析；重复 orderId 返回 inserted=false（仍算成功）
 */
export const submitShareReq = (params: SubmitShareParams): Promise<BetShareSubmitResult | null> =>
  postBetShareJson<BetShareSubmitResult>('/api/betshare/submitShare', {
    orderId: String(params.orderId ?? '').trim(),
    ...(params.seq != null && Number(params.seq) > 0 ? { seq: Number(params.seq) } : {}),
    ...(params.venueCode ? { venueCode: String(params.venueCode).trim() } : {}),
  })
    .then((res) => (res?.data != null ? normalizeResult(res.data) : null))
    .catch(() => null);

/**
 * 注单跟单
 * POST /api/betshare/submitFollow
 * shareOrderId 须已存在晒单记录；同一晒单+跟单注单幂等
 */
export const submitFollowReq = (params: SubmitFollowParams): Promise<BetShareSubmitResult | null> =>
  postBetShareJson<BetShareSubmitResult>('/api/betshare/submitFollow', {
    shareOrderId: String(params.shareOrderId ?? '').trim(),
    orderId: String(params.orderId ?? '').trim(),
    betAmount: params.betAmount,
    ...(params.venueCode ? { venueCode: String(params.venueCode).trim() } : {}),
  })
    .then((res) => (res?.data != null ? normalizeResult(res.data) : null))
    .catch(() => null);

/** venueId（如 fb）→ 接口推荐的 venueCode（如 FB） */
export const toBetShareVenueCode = (venueId?: string): string => {
  const raw = String(venueId || '').trim();
  if (!raw) return 'FB';
  return raw.toUpperCase();
};
