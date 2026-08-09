'use client';

import { querystringStringify } from '@/utils';
import { getImPlatform, isImOriginSuccessCode } from '@/utils/constants/apiCodeIm';
import { VERSION } from '@/utils/constants/system';
import { isSSR } from '@/utils/env';

import type { RequestConf } from './request/config';
import { createRequest, RequestMethod } from './request/index';
import type { ResponseData } from './request/model';

type RequestDataValue = string | number | boolean | null | undefined;

interface RequestData {
  [key: string]: RequestDataValue;
}

function isSerializableObject(data: unknown): data is RequestData {
  return data !== null && typeof data === 'object' && !(data instanceof FormData);
}

/**
 * 主站 /api/im/* 专用请求（对齐 emc isOpenIMPath）
 * 与 request.ts 隔离，不影响现有主站接口逻辑
 */
const imOriginConfig: RequestConf = {
  host: __SITE_CONFIG__?.api?.baseUrl ?? '',
  timeout: isSSR() ? 5000 : 10000,
  sharedHeaders: () => ({
    'Content-Type': 'application/x-www-form-urlencoded',
    version: VERSION,
    visitType: 'APP',
    visitSource: 'h5',
    'X-Site-Id': __SITE_ID__,
  }),
  sharedUrl: (method, url) => {
    if (method === RequestMethod.get) {
      return `${url}${url.includes('?') ? '&' : '?'}platform=${getImPlatform()}`;
    }
    return url;
  },
  sharedData: (method, _url, data) => {
    if (method === RequestMethod.post) {
      const imBody: RequestData = isSerializableObject(data) ? Object.assign({}, data) : {};
      imBody.platform = getImPlatform();
      return querystringStringify(imBody);
    }
    if (data && isSerializableObject(data)) {
      return querystringStringify(Object.assign({}, data));
    }
    return data;
  },
  handleResponseSuccess: <TTransformResponse>(
    data: ResponseData<TTransformResponse>,
  ): ResponseData<TTransformResponse> | null => {
    return isImOriginSuccessCode(data.code) ? data : null;
  },
  handleResponseFail: (_error, _isErrorToast) => null,
};

const requestImOrigin = createRequest(imOriginConfig);

export default requestImOrigin;
