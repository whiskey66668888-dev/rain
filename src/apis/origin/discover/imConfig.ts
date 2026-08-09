import { useQueryHook } from '@/core/query/hooks';
import requestImOrigin from '@/core/sdk/requestImOrigin';
import { IM_ORIGIN_API_PREFIX } from '@/utils/constants/apiCodeIm';

import {
  normalizeImInfoData,
  normalizeImMessageData,
  type ImMessageRaw,
  type ImMessageResponse,
} from './types';

let cachedConfig: ImMessageResponse | null = null;

/**
 * 维护状态复查节流：配置已缓存时，原先每次 ensureReady 都要同步等一次 getInfo，
 * 直接卡在分享链路最前面。维护开关不需要秒级精度（useOpenImConfigQuery 本就 5min staleTime）。
 */
const MAINTAIN_STATUS_TTL_MS = 60_000;
let maintainCheckedAt = 0;

export const getOpenImConfig = (): ImMessageResponse | null => cachedConfig;

export const resetOpenImConfigCache = (): void => {
  cachedConfig = null;
  maintainCheckedAt = 0;
};

/**
 * 获取 IM 基础配置（游客 / 发现页）
 * 接口：GET /api/im/getInfo
 */
export const getImInfoReq = (): Promise<ImMessageResponse | null> =>
  requestImOrigin
    .get<string, void, ImMessageResponse>(`${IM_ORIGIN_API_PREFIX}/getInfo`, {
      isErrorToast: false,
      transformResponse: (data) => ({
        ...data,
        data: normalizeImInfoData(data.data),
      }),
    })
    .then((res) => (res.data?.reqApiUrl ? res.data : null))
    .catch(() => null);

/**
 * 获取 IM 完整配置（登录后，含 imToken / reqToken）
 * 接口：GET /api/im/getImMessage?platform=5
 */
export const getImMessageReq = (): Promise<ImMessageResponse | null> =>
  requestImOrigin
    .get<ImMessageRaw, void, ImMessageResponse>(`${IM_ORIGIN_API_PREFIX}/getImMessage`, {
      isErrorToast: false,
      transformResponse: (data) => ({
        ...data,
        data: normalizeImMessageData(data.data),
      }),
    })
    .then((res) => (res.data?.reqApiUrl ? res.data : null))
    .catch(() => null);

const refreshMaintainStatus = async (): Promise<boolean> => {
  if (maintainCheckedAt && Date.now() - maintainCheckedAt < MAINTAIN_STATUS_TTL_MS) {
    return !cachedConfig?.imIsMaintain;
  }
  const info = await getImInfoReq();
  // 请求失败不刷新时间戳，避免网络抖一下就进入 60s 静默期；降级仍用上一次的维护态
  if (!info) return !cachedConfig?.imIsMaintain;
  maintainCheckedAt = Date.now();
  if (cachedConfig) {
    cachedConfig = { ...cachedConfig, imIsMaintain: info.imIsMaintain };
  }
  return !cachedConfig?.imIsMaintain;
};

/**
 * 发现页加载 IM 配置（仅需 reqApiUrl / siteCode / sportData）
 * 注意：getImMessage 需有效登录态，发现 tab 不调用它。
 */
export const ensureOpenImConfigLoaded = async (): Promise<boolean> => {
  if (cachedConfig) {
    return refreshMaintainStatus();
  }

  const config = await getImInfoReq();
  if (!config) return false;

  cachedConfig = config;
  return !config.imIsMaintain;
};

/**
 * 登录后加载完整 IM 配置，供 OpenIM WASM login。
 * 缓存需含 imToken / reqToken；否则重新 getImMessage。
 * getImMessage 失败不回落到 getInfo（无 token，无法 login）。
 */
export const ensureOpenImAuthConfigLoaded = async (): Promise<boolean> => {
  const cacheUsable =
    !!cachedConfig?.reqApiUrl && !!cachedConfig.reqToken && !!cachedConfig.imToken;

  if (cacheUsable) {
    return refreshMaintainStatus();
  }

  const authConfig = await getImMessageReq();
  if (!authConfig?.imToken) {
    return false;
  }

  cachedConfig = authConfig;
  return !authConfig.imIsMaintain;
};

export const OPEN_IM_CONFIG_QUERY_KEY = ['origin', 'im', 'config'] as const;

/** 发现页 OpenIM 配置 */
export const useOpenImConfigQuery = (
  enabled: boolean,
): ReturnType<typeof useQueryHook<boolean, Error>> =>
  useQueryHook<boolean, Error>({
    queryKey: [...OPEN_IM_CONFIG_QUERY_KEY],
    enabled,
    queryFn: () => ensureOpenImConfigLoaded().catch(() => false),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
