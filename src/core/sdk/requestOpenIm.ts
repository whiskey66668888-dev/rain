'use client';

import { API_CODE_OPENIM_SUCCESS } from '@/utils/constants/apiCodeOpenIm';

import { getOpenImConfig } from '@/apis/origin/discover/imConfig';
import type { RequestConf } from './request/config';
import { createRequest } from './request/index';
import type { ResponseData } from './request/model';

// const OPEN_IM_DEV_PREFIX = '/open-im';

const openImConfig: RequestConf = {
  sharedHeaders: () => {
    const cfg = getOpenImConfig();
    console.log('cfg@@@@@', cfg);
    if (!cfg) return {};

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Site-Code': cfg.siteCodeThl,
      'Sport-Data': cfg.sportData,
    };
    if (cfg.reqToken) {
      headers.token = cfg.reqToken;
    }
    return headers;
  },
  sharedUrl: (_method, url) => {
    const cfg = getOpenImConfig();
    const path = url.startsWith('/') ? url : `/${url}`;

    // if (import.meta.env.DEV) {
    //   return `${OPEN_IM_DEV_PREFIX}${path}`;
    // }

    const base = cfg?.reqApiUrl?.replace(/\/$/, '') ?? '';
    return `${base}${path}`;
  },
  sharedData: (_method, _url, data) => {
    if (data && typeof data === 'object' && !(data instanceof FormData)) {
      return JSON.stringify(data);
    }
    return data;
  },
  handleResponseSuccess: <TTransformResponse>(
    data: ResponseData<TTransformResponse>,
  ): ResponseData<TTransformResponse> | null => {
    return Number(data.code) === API_CODE_OPENIM_SUCCESS ? data : null;
  },
  handleResponseFail: (_error, _isErrorToast) => null,
};

const requestOpenIm = createRequest(openImConfig);

export default requestOpenIm;
