import request from '@/core/sdk/request';
import { useQueryHook } from '@/core/query/hooks';

export interface SponsorItem {
  id: number;
  resourceName: string;
  daytimeMaterialContent: string;
  nightMaterialContent: string;
  jumpType: number;
  targetAddress: string;
  webTargetAddress: string;
  sort: number;
}

export const getSponsorListReq = async (): Promise<SponsorItem[]> => {
  const res = await request.post('/api/website/getSponsoredResourcePosition', {
    isErrorToast: false,
    body: { carrierEnd: 'H5' },
  });
  return (res?.data || []) as SponsorItem[];
};

export const useSponsorListQuery = () => {
  return useQueryHook<SponsorItem[]>({
    queryKey: ['sponsorList'],
    queryFn: getSponsorListReq,
    staleTime: 5 * 60 * 1000, // 数据过期时间为5分钟
    refetchOnMount: 'always',
  });
};
