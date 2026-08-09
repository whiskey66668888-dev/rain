import request from '@/core/sdk/request';

export interface TAddressMap {
  mailbox: string;
  province: string;
  city: string;
  addressDetails: string;
}

export const saveAddressReq = (data: TAddressMap) =>
  request.post<unknown, TAddressMap>('/api/member/saveAddress', {
    body: data,
  });
