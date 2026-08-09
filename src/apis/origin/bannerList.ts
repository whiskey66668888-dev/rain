import { useQueryHook } from '@/core/query/hooks';
import request from '@/core/sdk/request';
import { ResponseData } from '@/core/sdk/request/model';
import { useQuery } from '@tanstack/react-query';

export interface BannerItem {
  image: string;
  openValue: string;
  bannerId: number;
  imageUrl: string;
  imageUrlMedium: string;
  title: string;
  imageUrlSmall: string;
  openType: string;
}

export interface GetBannerListParams {
  colorType: string;
}

export type GetBannerListResponse = BannerItem[];

/**
 * 获取 Banner 列表
 * @param params
 * @returns Promise<GetBannerListResponse>
 */
export const getBannerListReq = (
  params: GetBannerListParams = { colorType: '' },
): Promise<ResponseData<GetBannerListResponse>> => {
  return request.post<GetBannerListResponse, GetBannerListParams>('/api/website/banner/list', {
    body: params,
  });
};

/**
 * 获取 Banner 列表的 React Query Hook
 * 使用 useSuspenseQuery，支持 SSR 自动收集请求数据
 */
export const useBannerListQuery = (
  params: GetBannerListParams = { colorType: '' },
  enabled = false,
): ReturnType<typeof useQueryHook<GetBannerListResponse, Error>> => {
  return useQuery<GetBannerListResponse, Error>({
    queryKey: ['origin', 'banner', 'list', params],
    queryFn: () =>
      getBannerListReq(params)
        .then((res) => res.data)
        .catch(() => {
          return [];
        }),
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled,
    // refetchOnMount: 'always', // 对于一些实效性比较高的数据，即使服务端注入了数据，客户端接手后也立即重新请求
  });
};

// /**
//  * 转换后的数据结构（示例）
//  */
// interface TransformedBannerListResponse {
//     banners: BannerItem[];
//     count: number;
//   }

// /**
//  * 示例：带自定义 transformResponse 的请求
//  * 如果后端返回的数据结构不同，可以使用 transformResponse 进行转换
//  */

// export const postBannerListWithTransform = (
//     params: GetBannerListParams = { colorType: '' },
//   ): Promise<TransformedBannerListResponse> => {
//     // 传三个泛型参数：
//     // 1. TTransformResponse: 后端返回的原始数据结构
//     // 2. TBody: 请求体类型
//     // 3. TResponse: 转换后的数据类型（如果没传，默认使用 TTransformResponse）
//     return request.post<
//       GetBannerListResponse, // TTransformResponse: 后端返回的原始数据结构
//       GetBannerListParams, // TBody: 请求体类型
//       TransformedBannerListResponse // TResponse: 转换后的数据类型
//     >('/api/website/banner/list', {
//       body: params,
//       isErrorToast: false,
//       // 自定义响应转换逻辑：将后端数据结构转换为前端需要的格式
//       transformResponse: (data): TransformedBannerListResponse => {
//         // data.data 的类型是 GetBannerListResponse（后端原始数据）
//         const backendData: GetBannerListResponse = data.data;
//         // 返回转换后的数据（TransformedBannerListResponse）
//         return {
//           banners: backendData.list,
//           count: backendData.total,
//         };
//       },
//     });
//   };
