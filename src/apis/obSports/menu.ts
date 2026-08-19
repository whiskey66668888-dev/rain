import { useQueryHook } from '@/core/query';
import { ResponseData } from '@/core/sdk/request/model';
import requestOB from '@/core/sdk/requestOB';
import { PlayType } from '@/apis/commonSports/constants';
import type { MenuInfo } from '../commonSports/types';
import { formatMenuList } from './common/obFormat';
import type { OBMenuListResponse } from './common/types';

export type { OBMenuListResponse } from './common/types';

const EMPTY_MENU_INFO: MenuInfo = {
  hotSportMatchIds: [],
  menus: {
    [PlayType.Living]: [],
    [PlayType.Today]: [],
    [PlayType.Early]: [],
    [PlayType.Champion]: [],
    [PlayType.Follow]: [],
  },
  playTypes: [],
};

/**
 * 获取 OB 体育菜单
 * 对齐 Flutter getOBMenuListReq：GET initPB?sys=7，缓存约 1 分钟
 */
export const getMenuListReq = (): Promise<ResponseData<MenuInfo>> => {
  return requestOB.get<OBMenuListResponse[], object, MenuInfo>(
    '/yewu11/pub/v1/m/menu/initPB?sys=7',
    {
      isErrorToast: false,
      transformResponse: (data) => {
        const list = Array.isArray(data.data) ? data.data : [];
        return {
          ...data,
          data: formatMenuList(list),
        };
      },
    },
  );
};

/**
 * OB 菜单 Hook
 * 参数位仅对齐 VenueService / FB statistical 签名，OB 侧不使用
 */
export const useGetMenuListQuery = (_params: object = {}, enabled = true) => {
  return useQueryHook<MenuInfo, Error>({
    // Flutter buildCacheOptions 过期 1 分钟
    refetchInterval: 60_000,
    staleTime: 60_000,
    queryKey: ['ob', 'menu', 'list', 'initPB'],
    queryFn: () =>
      getMenuListReq()
        .then((res) => res.data ?? EMPTY_MENU_INFO)
        .catch(() => EMPTY_MENU_INFO),
    enabled,
    retry: false,
  });
};
