import request from '@/core/sdk/request';
import type { ResponseData } from '@/core/sdk/request/model';

/** 呼朋唤友活动固定优惠 ID（与 H5 / App 约定一致） */
export const INVITE_FRIENDS_DISCOUNT_ID = 297;

const silent = {
  isErrorToast: false,
  tokenExpiresnotGoLogin: true,
} as const;

export interface FavoritesCheckBody {
  discountId: number;
}

export interface FavoritesCheckResult {
  favorites?: boolean;
}

export const favoritesCheck = (
  body: FavoritesCheckBody,
): Promise<ResponseData<FavoritesCheckResult>> => {
  return request.post<FavoritesCheckResult, FavoritesCheckBody>('/api/website/favorites/check', {
    body,
    ...silent,
  });
};

export interface DiscountFavoritesBody {
  discountId: number;
}

export const saveDiscountFavorite = (
  body: DiscountFavoritesBody,
): Promise<ResponseData<unknown>> => {
  return request.post<unknown, DiscountFavoritesBody>('/api/website/discount/favorites/save', {
    body,
  });
};

export const cancelDiscountFavorite = (
  body: DiscountFavoritesBody,
): Promise<ResponseData<unknown>> => {
  return request.post<unknown, DiscountFavoritesBody>('/api/website/discount/favorites/cancel', {
    body,
  });
};

export interface DiscountGetBody {
  id: number;
  isMobile: boolean;
}

export const getDiscountItem = (
  body: DiscountGetBody,
): Promise<ResponseData<Record<string, unknown>>> => {
  return request.post<Record<string, unknown>, DiscountGetBody>('/api/website/discount/get', {
    body,
    headers: {
      visitType: body.isMobile ? 'APP' : 'WEB',
      visitSource: body.isMobile ? 'H5' : 'PC',
    },
    ...silent,
  });
};

export interface Discount297Info {
  beginTime?: string;
  endTime?: string;
  [key: string]: unknown;
}

export const getDiscount297Info = (): Promise<ResponseData<Discount297Info>> => {
  return request.post<Discount297Info, Record<string, never>>('/api/home/discount297', {
    body: {},
    ...silent,
    headers: { 'Content-Type': 'application/json' },
  });
};

export interface InviterDepositListBody {
  [key: string]: unknown;
}

export const getFirstAwardDetails = (
  body?: InviterDepositListBody,
): Promise<ResponseData<Record<string, unknown>>> => {
  return request.post<Record<string, unknown>, InviterDepositListBody>(
    '/v2/api/inviterDeposit/getFirstAwardDetails',
    { body: body ?? {}, ...silent },
  );
};

export const getAccumulatedAwardDetails = (
  body?: InviterDepositListBody,
): Promise<ResponseData<Record<string, unknown>>> => {
  return request.post<Record<string, unknown>, InviterDepositListBody>(
    '/v2/api/inviterDeposit/getAccumulatedAwardDetails',
    { body: body ?? {}, ...silent },
  );
};

export const getLatestAwardRecords = (
  body?: InviterDepositListBody,
): Promise<ResponseData<Record<string, unknown>>> => {
  return request.post<Record<string, unknown>, InviterDepositListBody>(
    '/v2/api/inviterDeposit/getLatestAwardRecords',
    { body: body ?? {}, ...silent },
  );
};

export const getBonusStatement = (
  body?: InviterDepositListBody,
): Promise<ResponseData<Record<string, unknown>>> => {
  return request.post<Record<string, unknown>, InviterDepositListBody>(
    '/v2/api/inviterDeposit/getBonusStatement',
    { body: body ?? {}, ...silent },
  );
};

export const getRewards = (
  body?: InviterDepositListBody,
): Promise<ResponseData<Record<string, unknown>>> => {
  return request.post<Record<string, unknown>, InviterDepositListBody>(
    '/v2/api/inviterDeposit/getRewards',
    { body: body ?? {}, tokenExpiresnotGoLogin: true },
  );
};

export const getInvitationDataDSummary = (
  body?: InviterDepositListBody,
): Promise<ResponseData<Record<string, unknown>>> => {
  return request.post<Record<string, unknown>, InviterDepositListBody>(
    '/v2/api/inviterDeposit/getInvitationDataDSummary',
    { body: body ?? {}, ...silent },
  );
};

export const getCycle = (
  body?: InviterDepositListBody,
): Promise<ResponseData<Record<string, unknown>>> => {
  return request.post<Record<string, unknown>, InviterDepositListBody>(
    '/v2/api/inviterDeposit/getCycle',
    { body: body ?? {}, ...silent },
  );
};

export const getTotalRevenueDetails = (
  body?: InviterDepositListBody,
): Promise<ResponseData<Record<string, unknown>>> => {
  return request.post<Record<string, unknown>, InviterDepositListBody>(
    '/v2/api/inviterDeposit/getTotalRevenueDetails',
    { body: body ?? {}, ...silent },
  );
};

export interface UpVipBody {
  loginName: string;
  isNew?: boolean;
  [key: string]: unknown;
}

export const upVip = (body: UpVipBody): Promise<ResponseData<unknown>> => {
  return request.post<unknown, UpVipBody>('/api/inviter/up/vip', {
    body: { isNew: true, ...body },
    tokenExpiresnotGoLogin: true,
  });
};

/** 好友邀请记录 */
export const getInviteMemberList = (
  body?: InviterDepositListBody,
): Promise<ResponseData<Record<string, unknown>>> => {
  return request.post<Record<string, unknown>, InviterDepositListBody>(
    '/api/inviter/inviteMember/list',
    {
      body: { isNew: true, ...(body ?? {}) },
      ...silent,
    },
  );
};

/** 直升历史列表 */
export const upVipList = (
  body?: InviterDepositListBody,
): Promise<ResponseData<Record<string, unknown>>> => {
  return request.post<Record<string, unknown>, InviterDepositListBody>('/api/inviter/upvip/list', {
    body: { isNew: true, ...(body ?? {}) },
    ...silent,
  });
};

export const getweekBonusList = (
  body?: InviterDepositListBody,
): Promise<ResponseData<Record<string, unknown>>> => {
  return request.post<Record<string, unknown>, InviterDepositListBody>(
    '/api/inviter/weekBonus/list',
    { body: { isNew: true, ...(body ?? {}) }, ...silent },
  );
};

export const weekBonusGet = (
  body?: InviterDepositListBody,
): Promise<ResponseData<Record<string, unknown>>> => {
  return request.post<Record<string, unknown>, InviterDepositListBody>(
    '/api/inviter/weekBonus/get',
    { body: body ?? {}, ...silent },
  );
};

export { getInviterInfoReq as getInviterInfo } from '@/apis/origin/inviter/inviterInfo';
