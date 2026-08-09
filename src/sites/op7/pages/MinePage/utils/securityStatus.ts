import { SecurityBindItem, SecurityCenterResponse } from '@/apis/origin/login';

const hasBoundSecurityKey = (list: SecurityBindItem[] | undefined, keys: string[]): boolean => {
  if (!Array.isArray(list)) return false;
  return list.some(
    (item) => !!item.securityKey && keys.includes(item.securityKey) && item.bind === true,
  );
};

export const hasCashPassword = (data: SecurityCenterResponse | null | undefined): boolean => {
  return (
    data?.haveCashPass === true || hasBoundSecurityKey(data?.securityBindList, ['Pay_Password'])
  );
};

const hasSecurityVerificationFields = (
  data: SecurityCenterResponse | null | undefined,
  bindKeys: string[],
): boolean => {
  return (
    !!data?.phone ||
    !!data?.email ||
    data?.securityCode === true ||
    hasBoundSecurityKey(data?.securityBindList, bindKeys)
  );
};

/** 是否已绑定任意动态验证（含手势密码） */
export const hasAnySecurityVerification = (
  data: SecurityCenterResponse | null | undefined,
): boolean => {
  return hasSecurityVerificationFields(data, [
    'Safety_Phone',
    'Safety_Email',
    'Microsoft_Token',
    'Gesture_Password',
  ]);
};

/** 忘记登录密码可用动态验证（不含手势密码，与 SecurityVerifyModal excludeKeys 一致） */
export const hasForgotPasswordSecurityVerification = (
  data: SecurityCenterResponse | null | undefined,
): boolean => {
  return hasSecurityVerificationFields(data, ['Safety_Phone', 'Safety_Email', 'Microsoft_Token']);
};
