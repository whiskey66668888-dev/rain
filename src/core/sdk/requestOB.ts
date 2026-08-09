'use client';

import { toast } from '@/common/components/Toast';

import { getOBTokenReq } from '@/apis/origin/system';
import { getGlobalStoreForApiRequest } from '@/core/store/util';
import { API_CODE_OB_SUCCESS, API_CODE_OB_USER_LOGIN_EXPIRE } from '@/utils/constants/apiCodeOB';
import { isSSR } from '@/utils/env';

import { navigateTo } from '@/common/hooks/useGlobalNavigate';

import { i18n } from '../i18n';
import { apiConfigManager } from './request/apiConfigManager';
import type { RequestConf } from './request/config';
import { createRequest } from './request/index';
import type { RequestInstance } from './request/index';
import { type ResponseData, type ResponseError } from './request/model';
import { encryption } from './request/util';

// OB 第三方 API 配置
const obConfig: RequestConf = {
  sharedHeaders: () => {
    const token = getGlobalStoreForApiRequest().getState().thirdApiConfig.ob.config?.token;
    return {
      requestId: token || '',
      lang: i18n.language,
    };
  },
  sharedUrl: (method, url) => {
    const baseUrl = getGlobalStoreForApiRequest().getState().thirdApiConfig.ob.config?.apiDomain;
    return `${baseUrl}${url}`;
  },
  sharedData: (method, url, data) => {
    if (data && typeof data === 'object' && !(data instanceof FormData)) {
      return JSON.stringify(data);
    }
    return data;
  },
  handleResponseSuccess: <TTransformResponse>(
    data: ResponseData<TTransformResponse>,
    _url?: string,
  ): ResponseData<TTransformResponse> | null => {
    // OB API 的 data.data 是加密的字符串，需要解密
    if (typeof data.data === 'string') {
      const unzippedData = encryption.unzip_data<TTransformResponse>(data.data);
      // 如果解密成功且返回的是对象，则更新 data.data
      if (typeof unzippedData !== 'string' && unzippedData && typeof unzippedData === 'object') {
        // 解密后的数据是 ResponseData 格式，提取其中的 data 字段
        if ('data' in unzippedData && 'code' in unzippedData) {
          // 类型守卫：确保是 ResponseData 格式
          const responseData: ResponseData<TTransformResponse> = unzippedData;
          const mutableData = data;
          mutableData.data = responseData.data;
        } else {
          // 如果解密后的数据直接是结果，则直接使用
          const mutableData = data;
          mutableData.data = unzippedData;
        }
      }
    }
    // 检查成功码
    return data.code === API_CODE_OB_SUCCESS ? data : null;
  },
  handleResponseFail: <TCode = string, TResponse = { code: string; info?: string } | Response>(
    error: ResponseError<TCode, TResponse>,
    isErrorToast: boolean,
  ) => {
    if (!isSSR() && getGlobalStoreForApiRequest().getState().thirdApiConfig.ob.isMaintenance) {
      // 场馆维护中，或者接口获取三方api失败了，回到首页
      navigateTo('/');
      return;
    }
    if (!isSSR() && isErrorToast) {
      switch (error.code) {
        case API_CODE_OB_USER_LOGIN_EXPIRE:
          toast({
            title: 'OB体育登录已过期，尝试重新登陆中',
            type: 'warning',
          });
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
    console.log('@OB API error:', error.response);
  },
};

// 创建 OB 请求实例
const baseRequestOB = createRequest(obConfig);

/**
 * 包装请求方法，添加token刷新和重试逻辑
 */
function wrapRequestMethod(
  _method: 'get' | 'post' | 'put' | 'delete',
  originalMethod: RequestInstance['get'],
): RequestInstance['get'] {
  const wrappedMethod = async <TTransformResponse, _TBody, TResponse = TTransformResponse>(
    url: string,
    options?: Omit<Parameters<RequestInstance['get']>[1], 'url'>,
  ): Promise<ResponseData<TResponse>> => {
    // 确保有配置（token和url）
    await apiConfigManager.ensureConfig('ob', getOBTokenReq);

    // 执行请求
    try {
      return (await originalMethod(url, options)) as ResponseData<TResponse>;
    } catch (error) {
      const responseError = error as ResponseError<
        number | string,
        { code: number | string; info?: string } | Response
      >;

      // 检查是否是token过期错误
      if (responseError.code === API_CODE_OB_USER_LOGIN_EXPIRE) {
        // 等待token刷新完成
        try {
          await apiConfigManager.waitForTokenRefresh('ob', getOBTokenReq);
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

const requestOB: RequestInstance = {
  get: wrapRequestMethod('get', baseRequestOB.get.bind(baseRequestOB)),
  post: wrapRequestMethod('post', baseRequestOB.post.bind(baseRequestOB)),
  put: wrapRequestMethod('put', baseRequestOB.put.bind(baseRequestOB)),
  delete: wrapRequestMethod('delete', baseRequestOB.delete.bind(baseRequestOB)),
};

export default requestOB;
