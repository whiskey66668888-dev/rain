import { useQuery } from '@tanstack/react-query';
import request from '@/core/sdk/request';
import { useQueryHook } from '@/core/query';
import { getSystemTheme } from '@/utils';

/* ====================== */
/* ===== types ========== */
/* ====================== */
export interface DiscountType {
  default: boolean;
  name: string;
  typeId: number;
  hot: boolean;
}

export interface DiscountItem {
  id: number;
  title: string;
  imageUrl: string; // 接口字段直接改为 imageUrl
  content?: string;
  typeId: number;
  endTime?: string;
  url?: string;
}

/* ====================== */
/* ===== request ======== */
/* ====================== */

// 获取活动分类
export const getDiscountTypeReq = async (): Promise<DiscountType[]> => {
  const res = await request.post('/api/website/discount/type3', {
    isErrorToast: false,
  });
  return (res?.data || []) as DiscountType[];
};

// 获取活动列表
export const getDiscountListReq = async (params: {
  typeId: number;
  colorType: string;
}): Promise<DiscountItem[]> => {
  const res = await request.post('/api/website/discount/list2', {
    isErrorToast: false,
    body: params,
  });
  return (res?.data || []) as DiscountItem[];
};

/* ====================== */
/* ===== hooks ========== */
/* ====================== */

export const useDiscountTypeQuery = () => {
  return useQueryHook({
    queryKey: ['discountType'],
    queryFn: getDiscountTypeReq,
    staleTime: 0,
    refetchOnMount: 'always',
  });
};

export const useDiscountListQuery = (typeId?: number, theme?: string) => {
  const currentTheme =
    typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : null;
  const colorType = (currentTheme ?? getSystemTheme()) === 'dark' ? 'black' : '';
  return useQuery({
    queryKey: ['discountList', typeId, theme],
    queryFn: () =>
      getDiscountListReq({
        typeId: typeId!,
        colorType,
      }),
    enabled: !!typeId,
    staleTime: 0,
    refetchOnMount: 'always',
  });
};
