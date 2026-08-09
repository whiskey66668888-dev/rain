'use client';

import { toast } from '@/common/components/Toast';

import { getFBTokenReq } from '@/apis/origin/system';
import {
  API_CODE_FB_LOGIN_TIMEOUT_PLEASE_LOGIN_AGAIN,
  API_CODE_FB_SUCCESS,
} from '@/utils/constants/apiCodeFB';
import { FB_LANGUAGE_TYPE, Locale } from '@/utils/constants/local';
import { isSSR } from '@/utils/env';

import { navigateTo } from '@/common/hooks/useGlobalNavigate';

import { i18n } from '../i18n';
import type { RequestConf } from './request/config';
import { createRequest } from './request/index';
import { ResponseError, type ResponseData } from './request/model';
import { getGlobalStoreForApiRequest } from '../store/util';
import { apiConfigManager } from './request/apiConfigManager';
import type { RequestInstance } from './request/index';
// import { openLoginModal } from '../store/slices/authUISlice';

// FB 第三方 API 配置
const fbConfig: RequestConf = {
  sharedHeaders: () => {
    const state = getGlobalStoreForApiRequest().getState();
    return {
      Authorization: state.thirdApiConfig.fb.config?.token ?? '',
    };
  },
  sharedUrl: (method, url) => {
    const baseUrl = getGlobalStoreForApiRequest().getState().thirdApiConfig.fb.config?.appUrl;
    return `${baseUrl}${url}`;
  },
  sharedData: (method, url, data) => {
    if (data && typeof data === 'object' && !(data instanceof FormData)) {
      return JSON.stringify(
        Object.assign({}, data, {
          languageType: FB_LANGUAGE_TYPE[i18n.language as Locale],
        }),
      );
    }
    return data;
  },
  handleResponseSuccess: <TTransformResponse>(data: ResponseData<TTransformResponse>) => {
    return data.code === API_CODE_FB_SUCCESS ? data : null;
  },
  handleResponseFail: <TCode = number, TResponse = { code: number; info?: string } | Response>(
    error: ResponseError<TCode, TResponse>,
    isErrorToast: boolean,
  ) => {
    if (!isSSR() && getGlobalStoreForApiRequest().getState().thirdApiConfig.fb.isMaintenance) {
      // 场馆维护中，或者接口获取三方api失败了，回到首页
      navigateTo('/');
      return;
    }
    if (!isSSR() && isErrorToast) {
      switch (error.code) {
        case API_CODE_FB_LOGIN_TIMEOUT_PLEASE_LOGIN_AGAIN:
          // FB的部分接口只允许在登陆后访问，在请求包装方法中进行处理
          // toast({
          //   title: 'FB体育登录过期,FB体育登录已过期，尝试重新登陆中',
          //   type: 'warning',
          // });
          break;
        default:
          toast({
            description: error.message || '请求失败',
            type: 'error',
            duration: 1500,
          });
          break;
      }
    }
    console.log('@FB API error:', error.response);
  },
};

// 创建 FB 请求实例
const baseRequestFB = createRequest(fbConfig);

/**
 * 包装请求方法，添加获取三方配置和token刷新和重试逻辑
 */
function wrapRequestMethod(originalMethod: RequestInstance['get']): RequestInstance['get'] {
  const wrappedMethod = async <TTransformResponse, _TBody, TResponse = TTransformResponse>(
    url: string,
    options?: Omit<Parameters<RequestInstance['get']>[1], 'url'>,
  ): Promise<ResponseData<TResponse>> => {
    // 确保有配置（token和url）
    await apiConfigManager.ensureConfig('fb', getFBTokenReq);

    // 执行请求
    try {
      return (await originalMethod(url, options)) as ResponseData<TResponse>;
    } catch (error) {
      const responseError = error as ResponseError<
        number | string,
        { code: number | string; info?: string } | Response
      >;

      // 检查是否是token过期错误
      if (responseError.code === API_CODE_FB_LOGIN_TIMEOUT_PLEASE_LOGIN_AGAIN) {
        // if (!getGlobalStoreForApiRequest().getState().user.userInfo.isLogin) {
        //   navigateTo('/');
        //   setTimeout(() => {
        //     getGlobalStoreForApiRequest().dispatch(openLoginModal());
        //   }, 1000);
        //   // toast({
        //   //   description: '请先登陆后再访问',
        //   //   type: 'warning',
        //   //   duration: 1500,
        //   // });
        //   throw error;
        // }
        // 等待token刷新完成
        try {
          await apiConfigManager.waitForTokenRefresh('fb', getFBTokenReq);
          // token刷新成功，重试请求
          return (await originalMethod(url, options)) as ResponseData<TResponse>;
        } catch (_refreshError) {
          // token刷新失败，抛出原始错误
          throw error;
        }
      }

      // 如果不是token过期错误，直接抛出
      throw error;
    }
  };
  return wrappedMethod;
}

const requestFB: RequestInstance = {
  get: wrapRequestMethod(baseRequestFB.get.bind(baseRequestFB)),
  post: wrapRequestMethod(baseRequestFB.post.bind(baseRequestFB)),
  put: wrapRequestMethod(baseRequestFB.put.bind(baseRequestFB)),
  delete: wrapRequestMethod(baseRequestFB.delete.bind(baseRequestFB)),
};

export default requestFB;
