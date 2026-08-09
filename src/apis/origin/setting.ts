import { useQueryHook } from '@/core/query/hooks';
import request from '@/core/sdk/request';
import type { ResponseData } from '@/core/sdk/request/model';

export interface PreInfoResponse {
  kefuUrlAgent: string;
  isHotlineWithinWindow: boolean;
  kefuWorktimeEnd: string;
  windowEndTime: string | null;
  orderId: string | null;
  fingerPrintKey: string;
  geetestSwitch: string;
  windowStatus: boolean;
  kefuWorktimeStart: string;
  windowTitle: string | null;
  xcUrl: string;
  hjKefuUrl: string | null;
  skype: string;
  kefuName1: string;
  openWebSocket: boolean;
  webSocketUrls: string[];
  kefuName2: string;
  kefuName3: string;
  imageUrl: string;
  email: string;
  qq: string;
  kefuHotline: string;
  kefuWorktime: string;
  windowContent: string | null;
  telegram: string;
  kefuKey2: string;
  switchToOp7: boolean;
  teamLogoUrl: string;
  kefuKey1: string;
  tgUrl: string;
  h5Url: string;
  appXzUrl1: string;
  imgUrl: string;
  jumpHelperCenter: string;
  appXzUrl3: string;
  windowBeginTime: string | null;
  appXzUrl2: string;
  loginGeetestSwitch: string;
  /** 注册极验开关：接口可能返回，预留可选字段 */
  registerGeetestSwitch?: string;
  uploadUrl: string;
  webUrl: string;
  inviterImage: string;
  kefu2: string | null;
  kefu1: string;
  currentHotlineTime: string;
  appXzUrl4: string;
  kefutg1: string | null;
  kefutg2: string | null;
  downUrl: string;
  liveUrlList: string[];
}

/**
 * 获取全局配置信息（与 H5 项目的 getPreInfoReq 一致）
 * 接口：GET /api/website/setting
 */
export const getPreInfoReq = (): Promise<ResponseData<PreInfoResponse>> =>
  request.get('/api/website/setting', {
    isErrorToast: false,
  });

/**
 * 获取全局配置信息的 React Query Hook
 */
export const usePreInfoQuery = (): ReturnType<
  typeof useQueryHook<PreInfoResponse | null, Error>
> => {
  return useQueryHook<PreInfoResponse | null, Error>({
    queryKey: ['origin', 'website', 'setting'],
    queryFn: () =>
      getPreInfoReq()
        .then((res) => res.data)
        .catch(() => null),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};
