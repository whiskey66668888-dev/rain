import { useQueryHook } from '@/core/query/hooks';
import request from '@/core/sdk/request';
import type { ResponseData } from '@/core/sdk/request/model';
import { useAppSelector } from '@/core/store/hooks';

/** 单条配置项 */
export interface SocialConfigItem {
  id: number;
  itemCode: string;
  del: boolean;
  dicGroupCode: string;
  dicGroupName: string;
  dicGroupId: number;
  itemName: string;
  itemValue: string;
  sort: number;
  itemMore?: string;
}

/** 已知配置 key */
export type SocialConfigKey =
  | 'upload_address_s3'
  | 'show_address_s3'
  | 'is_open_social'
  | 'is_open_official_social'
  | 'nickname_audit_enable'
  | 'official_cover_audit_enable'
  | 'signature_audit_enable'
  | 'total_recharge_min_amount';

/** 朋友圈全局配置：key -> 配置项 */
export type SocialConfigResponse = Record<string, SocialConfigItem | undefined>;

export const SOCIAL_CONFIG_QUERY_KEY = ['origin', 'social', 'config'] as const;

/**
 * 获取朋友圈全局配置
 * 接口：GET /api/social/config/getConfig
 */
export const getSocialConfigReq = (): Promise<ResponseData<SocialConfigResponse>> =>
  request.get('/api/social/config/getConfig', {
    isErrorToast: false,
  });

/** 读取配置项 itemValue */
export const getSocialConfigValue = (
  config: SocialConfigResponse | null | undefined,
  key: SocialConfigKey,
): string | undefined => config?.[key]?.itemValue;

/** 配置开关：'1' / 'true' 视为开启 */
export const isSocialConfigEnabled = (value?: string | null): boolean =>
  value === '1' || value === 'true';

/** 读取开关类配置是否开启 */
export const isSocialConfigItemEnabled = (
  config: SocialConfigResponse | null | undefined,
  key: SocialConfigKey,
): boolean => isSocialConfigEnabled(getSocialConfigValue(config, key));

/**
 * 获取朋友圈全局配置的 React Query Hook（登录后才会请求）
 */
export const useSocialConfigQuery = (): ReturnType<
  typeof useQueryHook<SocialConfigResponse | null, Error>
> => {
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);

  return useQueryHook<SocialConfigResponse | null, Error>({
    queryKey: [...SOCIAL_CONFIG_QUERY_KEY],
    enabled: isLogin,
    queryFn: () =>
      getSocialConfigReq()
        .then((res) => res.data ?? null)
        .catch(() => null),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};
