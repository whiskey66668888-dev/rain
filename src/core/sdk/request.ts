'use client';

import Cookies from 'js-cookie';

import { toast } from '@/common/components/Toast';
import { navigateTo } from '@/common/hooks/useGlobalNavigate';

import { getGlobalStoreForApiRequest } from '@/core/store/util';
import { PATHS } from '@/sites/op7/routes/paths';
import { querystringStringify } from '@/utils';
import {
  API_CODE_ORIGIN_LOGIN_EXPIRED,
  API_CODE_ORIGIN_LOGIN_SUCCESS,
} from '@/utils/constants/apiCodeOrigin';
import { needRemoveCookies, needRemoveSession } from '@/utils/constants/cacheKey';
import { ORIGIN_LANGUAGE_TYPE, Locale } from '@/utils/constants/local';
import { VERSION } from '@/utils/constants/system';
import { isIos } from '@/utils/env';

import { i18n } from '../i18n';
import type { RequestConf } from './request/config';
import { createRequest, RequestMethod, ResponseData, ResponseError } from './request/index';
import { encryption } from './request/util';
import { openOtherDeviceLoginModal } from '@/common/components/OtherDeviceLoginModal';

import { clearLoginInfo, clearUserInfo } from '../store/slices/userSlice';
import { clearThirdPartyApiConfig } from '../store/slices/thirdApiConfigSlice';
import { resetOpenImSession } from '@/core/sdk/IMManager/utils/resetOpenImSession';
import { isEmbeddedInNativeApp } from '@/utils/appEmbed';
import { safeGetLocalString, safeRemoveSession } from '@/utils/storage/webStorage';
const _successCode: ReadonlyArray<number | string> = [
  1,
  '1',
  // /api/messageUpload
  200,
  '0000',
  '1200',
  '9002',
] as const;
const JSON_POST_URLS = new Set([
  '/api/home/discount297',
  '/json/discount/save/submitPrizeQuestion',
]);
type RequestDataValue = string | number | boolean | null | undefined;

interface RequestData {
  [key: string]: RequestDataValue;
}

interface SharedDataParams extends RequestData {
  visitType: string;
  visitSource: string;
  version: string;
  colorType: string;
  isRefactoring: boolean; // 是否是重构接口
}

/**
 * 类型守卫：检查 data 是否为可序列化的对象（用于 querystring.stringify）
 */
function isSerializableObject(data: unknown): data is RequestData {
  return data !== null && typeof data === 'object' && !(data instanceof FormData);
}

/**
 * 类型守卫：检查 error.response 是否为包含 code 的对象
 */
export function isErrorResponseWithCode(
  response: unknown,
): response is { code: string | number; info?: string; message?: string } {
  return (
    response !== null &&
    typeof response === 'object' &&
    'code' in response &&
    (typeof response.code === 'string' || typeof response.code === 'number')
  );
}

// Origin（主站）API 配置
const originConfig: RequestConf = {
  host: __SITE_CONFIG__?.api?.baseUrl ?? '',
  timeout: 10000,
  sharedHeaders: () => {
    return {
      'Content-Type': 'application/x-www-form-urlencoded',
      version: VERSION,
      visitType: 'APP',
      visitSource: 'h5',
      'X-Site-Id': __SITE_ID__,
    };
  },
  sharedUrl: (method: string | undefined, url: string) => {
    let colorType = '';

    if (typeof window !== 'undefined') {
      const theme = safeGetLocalString('themeMode');
      colorType = theme === 'dark' ? 'black' : '';
    }
    if (method === RequestMethod.get) {
      return `${url}${url.includes('?') ? '&' : '?'}platform=${isIos() ? 'ios' : 'android'}&colorType=${colorType}&version=${VERSION}&isRefactoring=true`;
    }
    return url;
  },
  sharedData: (
    method: string | undefined,
    url: string,
    data: BodyInit | null | undefined,
  ): BodyInit | null | undefined => {
    let colorType = '';

    if (typeof window !== 'undefined') {
      const theme = safeGetLocalString('themeMode');
      colorType = theme === 'dark' ? 'black' : '';
    }
    const isEncrypted = url.includes('/v3/');

    if (data instanceof FormData) {
      data.append('version', VERSION);
      data.append('isRefactoring', 'true');
      data.append('visitSource', 'h5');
      data.append('visitType', 'APP');
      data.append('isRefactoring', 'true');
      return data;
    }

    if (JSON_POST_URLS.has(url) && isSerializableObject(data)) {
      const requestData: SharedDataParams = Object.assign(
        {
          visitType: 'APP',
          visitSource: 'h5',
          version: VERSION,
          isRefactoring: true,
          colorType: colorType,
          language: ORIGIN_LANGUAGE_TYPE[i18n.language as Locale],
        },
        data,
      );
      return JSON.stringify(requestData);
    }

    if (method === RequestMethod.post && !url.includes('visitType=APP')) {
      // 类型守卫：确保 data 是对象类型
      if (isSerializableObject(data)) {
        const requestData: SharedDataParams = Object.assign(
          {
            visitType: 'APP',
            visitSource: 'h5',
            version: VERSION,
            isRefactoring: true,
            colorType: colorType,
            language: ORIGIN_LANGUAGE_TYPE[i18n.language as Locale],
          },
          data,
        );
        if (isEncrypted) {
          if (__NODE_ENV__ !== 'production') {
            console.log('[request] 加密前参数', url, requestData);
          }
          return encryption.zip_data(requestData);
        }
        return querystringStringify(requestData);
      }
    }
    if (data) {
      if (isEncrypted) {
        return JSON.stringify(data);
      }
      // 类型守卫：确保 data 是对象类型
      if (isSerializableObject(data)) {
        const queryData: RequestData = Object.assign({}, data);
        return querystringStringify(queryData);
      }
    }
    return data;
  },
  /** 进行中请求去重用：登录前后、不同账号不会复用同一 Promise */
  getRequestIdentity: () => {
    try {
      const userInfo = getGlobalStoreForApiRequest()?.getState()?.user?.userInfo;
      if (!userInfo?.isLogin) return 'guest';
      return `user:${userInfo.loginName || ''}`;
    } catch {
      return 'guest';
    }
  },
  handleResponseSuccess: <TTransformResponse = unknown>(
    data: ResponseData<TTransformResponse>,
    url?: string,
  ) => {
    // 登录成功提示
    if (String(data.code) === API_CODE_ORIGIN_LOGIN_SUCCESS && url?.includes('/v3/login')) {
      toast({
        description: '登录成功，已退出其他设备的登录状态。',
        type: 'info',
      });
    }

    return _successCode.includes(data.code) ? data : null;
  },
  handleResponseFail: <
    TCode extends number | string = number | string,
    TResponse = { code: number | string; message: string; info?: string } | Response,
  >(
    error: ResponseError<TCode, TResponse>,
    isErrorToast: boolean,
    // tokenExpiresnotGoLogin?: boolean,
  ) => {
    // 类型守卫：确保 error.response 是包含 code 的对象
    if (!isErrorResponseWithCode(error.response)) {
      return;
    }

    const { code, info } = error.response;

    if (API_CODE_ORIGIN_LOGIN_EXPIRED.includes(String(code))) {
      const inApp = isEmbeddedInNativeApp();
      if (inApp) return;

      navigateTo(PATHS.home, { replace: true });
      // 打开其他设备登录弹窗
      openOtherDeviceLoginModal({ info, code });
      for (const item of needRemoveCookies) {
        Cookies.remove(item);
      }
      for (const item of needRemoveSession) {
        safeRemoveSession(item);
      }
      getGlobalStoreForApiRequest().dispatch(clearUserInfo());
      getGlobalStoreForApiRequest().dispatch(clearLoginInfo());
      getGlobalStoreForApiRequest().dispatch(clearThirdPartyApiConfig());
      void resetOpenImSession();
      return;
    }

    // 只有一种校验解绑后接口报错 不toast
    if (code === '9019') return;

    if (isErrorToast) {
      toast({
        description: info || '请求失败',
        type: 'error',
        duration: 1500,
      });
    }
    console.log('@error:', error.response);
  },
};

const request = createRequest(originConfig);

export default request;
