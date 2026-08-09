import request from '@/core/sdk/request';

// ✅ 定义请求参数类型
interface GroupIdParams {
  groupId: string | number;
}

// ✅ 定义响应类型
interface UcUrlData {
  ucUrl: string;
}

interface VipCashResponse {
  code: string;
  info: string;
  data?: unknown;
}

interface BirthdayResponse {
  code: string;
  info: string;
}

interface WeekBonusResponse {
  code: string;
  info: string;
}

// vip手动升级(新)
export const upgradeNew = () => {
  return request.post<number, void>('/api/member/upgrade/save', {
    isErrorToast: true,
  });
};

// 查询可否升级
export const checkUpgrade = () => {
  return request.post<number, void>('/api/member/upgrade/get', {
    // isErrorToast: true,
  });
};

// ✅ 领取升级助力金
export const getLevelHelpAmount = (params: GroupIdParams) => {
  return request.post<UcUrlData, GroupIdParams>('/api/member/cash/vip/help', {
    isErrorToast: true,
    body: params,
  });
};

// ✅ 领取VIP升级奖金
export const cashVipMoneyReq = (params: GroupIdParams) => {
  return request.post<VipCashResponse, GroupIdParams>('/api/member/cash/vip', {
    isErrorToast: true,
    body: params,
  });
};

// ✅ 领取VIP生日奖金
export const birthdayMoneyReq = () => {
  return request.post<BirthdayResponse, void>('/api/member/cash/birthdayGiftMoney', {
    isErrorToast: true,
  });
};

// ✅ 领取每周红包
export const weekVipMoneyReq = () => {
  return request.post<WeekBonusResponse, void>('/json/discount/dis238', {
    isErrorToast: true,
  });
};
