/**
 * OpenIM / 主站 IM 相关常量
 *
 * H5 WASM（对齐 tf90）：getImMessage 与 login 均固定 platform=5（Web）。
 * Flutter App 用 1/2，不可照搬到 WASM。
 */

/** 主站 /api/im/* 成功码（对齐 emc isOpenIMPath） */
export const API_CODE_IM_SUCCESS_CODES: ReadonlyArray<number | string> = [
  0,
  1,
  '0',
  '1',
  '0000',
] as const;

/** H5 / WASM Web 平台 */
export const IM_PLATFORM_WEB = '5';

/** H5 走 /api 代理时的 IM 主站接口前缀 */
export const IM_ORIGIN_API_PREFIX = '/api/im';

export const isImOriginPath = (url: string): boolean => {
  const pathname = url.split('?')[0] ?? url;
  return pathname.startsWith('/im/') || pathname.startsWith('/api/im/');
};

/** /api/im/getImMessage 的 platform query */
export const getImPlatform = (): string => IM_PLATFORM_WEB;

/** OpenIM WASM login 的 platformID */
export const getImSdkPlatformId = (): number => Number(IM_PLATFORM_WEB);

export const isImOriginSuccessCode = (code: number | string): boolean =>
  API_CODE_IM_SUCCESS_CODES.includes(code);
