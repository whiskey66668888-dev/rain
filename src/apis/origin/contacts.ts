import { useQueryHook } from '@/core/query';
import request from '@/core/sdk/request';

export interface TContactsData {
  skype: string;
  skypeReal: string;
  telegram: string;
  kefu: string;
  emailReal: string;
  telegramReal: string;
  email: string;
  kefuReal: string;
}

export const getContactsReq = () => {
  return request.get<TContactsData, unknown>('/api/website/contacts');
};

export const useContactsQuery = () => {
  return useQueryHook<TContactsData, Error>({
    queryKey: ['origin', 'contacts'],
    queryFn: () =>
      getContactsReq()
        .then((res) => res.data)
        .catch(() => {
          return {} as TContactsData;
        }),
    staleTime: 0,
    retry: false,
    // refetchOnMount: 'always', // 对于一些实效性比较高的数据，即使服务端注入了数据，客户端接手后也立即重新请求
  });
};
