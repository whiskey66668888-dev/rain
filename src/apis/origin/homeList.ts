import { useQueryHook } from '@/core/query/hooks';
import request from '@/core/sdk/request';
import { ResponseData } from '@/core/sdk/request/model';
import { isSSR } from '@/utils/env';
import { HomeListId } from '@/utils/constants/entertainment';

export enum HomeListSwitch {
  MAINTENANCE = '0', // 维护
  NORMAL = '1', // 正常
  EXPECT = '2', // 期待
}

export interface HomeListResponse {
  backImageUrl: string;
  homeId: HomeListId;
  imageUrl: string;
  name: string;
  childList: {
    gameId: number;
    gameType: string;
    gameIntroduce: string;
    backgroundColor: string;
    hideGameTransfer: boolean;
    imageUrl: string;
    maintenanceDesc: string;
    choice: boolean;
    homeId: number;
    name: string;
    switch: HomeListSwitch;
    titleColor: string;
    menu: Array<{
      backgroundColor: string;
      reload: boolean;
      titleColor: string;
      mobileModel: number;
      hasTest: boolean;
      name: string;
      menuId: number;
      testUrl: string;
      type: string;
      url: string;
    }>;
  }[];
}

/**
 * 获取 娱乐页菜单栏以及主列表场馆入口相关导航卡片数据
 * @param params
 * @returns Promise<HomeListResponse>
 */
export const getHomeListReq = (): Promise<ResponseData<HomeListResponse[]>> => {
  return request.post<HomeListResponse[], object>('/api/website/home/list', {
    body: {},
  });
};

/**
 * @returns Promise<HomeListResponse[]>
 */
export const useHomeListQuery = (
  config: { enabled?: boolean } = {},
): ReturnType<typeof useQueryHook<HomeListResponse[], Error>> => {
  return useQueryHook<HomeListResponse[], Error>({
    queryKey: ['origin', 'home', 'list'],
    queryFn: () =>
      getHomeListReq()
        .then((res) => {
          const data = res.data ?? [];
          if (isSSR()) {
            // 场馆维护的真实状态需要登陆后才能获取，服务端默认强行把场馆维护状态设置为正常，等到客户端接手后根据登陆状态再次请求
            return data.map((item) => ({
              ...item,
              childList: (item.childList ?? []).map((child) => ({
                ...child,
                switch: HomeListSwitch.NORMAL,
              })),
            }));
          }
          return data;
        })
        .catch(() => {
          return [];
        }),
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled: config.enabled ?? true,
    // refetchOnMount: 'always',
  });
};
