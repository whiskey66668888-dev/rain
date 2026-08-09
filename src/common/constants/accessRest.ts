export const ACCESS_REST_PATH = '/accessRest';

/** 后端返回该 code 时跳转访问限制页 */
export const API_CODE_IP_ACCESS_DENIED = '9005';

/**
 * 去掉语言前缀后的 pathname，如 /zh/accessRest → /accessRest
 */
export function getPurePathname(pathname: string): string {
  return pathname.replace(/^\/[^/]+/, '') || '/';
}

/**
 * 这些路径不触发 IP 校验
 * - /accessRest：避免在限制页上反复 replace
 * - /onlineCustomerService：打开客服流程
 * - /newFriend：邀请链路
 */
const EXCEPT_PURE_PATH_PREFIXES = ['/newFriend'];

const EXACT_EXCEPT_PURE_PATHS = [ACCESS_REST_PATH, '/onlineCustomerService', '/newFriend'];

export function shouldSkipIpAccessCheck(purePath: string): boolean {
  if (EXACT_EXCEPT_PURE_PATHS.includes(purePath)) return true;
  return EXCEPT_PURE_PATH_PREFIXES.some(
    (prefix) => purePath === prefix || purePath.startsWith(`${prefix}/`),
  );
}
