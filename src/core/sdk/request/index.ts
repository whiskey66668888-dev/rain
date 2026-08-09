// model
import { toast } from '@/common/components/Toast';

import { isSSR } from '@/utils/env';

import { RequestConf, RequestMethod } from './config';
import { RequestOptions, ResponseData, ResponseError } from './model';
import { encryption, getBaseUrl, getHeaders } from './util';

/**
 * 请求实例类型
 */
export type RequestInstance = {
  get: <TTransformResponse, TBody, TResponse = TTransformResponse>(
    url: string,
    options?: Omit<RequestOptions<TBody, TTransformResponse, TResponse>, 'url'>,
  ) => Promise<ResponseData<TResponse>>;
  post: <TTransformResponse, TBody, TResponse = TTransformResponse>(
    url: string,
    options?: Omit<RequestOptions<TBody, TTransformResponse, TResponse>, 'url'>,
  ) => Promise<ResponseData<TResponse>>;
  put: <TTransformResponse, TBody, TResponse = TTransformResponse>(
    url: string,
    options?: Omit<RequestOptions<TBody, TTransformResponse, TResponse>, 'url'>,
  ) => Promise<ResponseData<TResponse>>;
  delete: <TTransformResponse, TBody, TResponse = TTransformResponse>(
    url: string,
    options?: Omit<RequestOptions<TBody, TTransformResponse, TResponse>, 'url'>,
  ) => Promise<ResponseData<TResponse>>;
};

/**
 * 创建请求实例的工厂函数
 * @param config 请求配置
 * @returns 请求实例对象
 */
export function createRequest(config: RequestConf): RequestInstance {
  // 通用处理
  async function handleFetch<TTransformResponse, TBody, TResponse>({
    url,
    timeout,
    transformResponse,
    isErrorToast = true,
    tokenExpiresnotGoLogin = false,
    method,
    headers,
    body,
  }: RequestOptions<TBody, TTransformResponse, TResponse>): Promise<ResponseData<TResponse>> {
    // 请求超时处理
    const _timeout = timeout || config.timeout;
    const _controller = new AbortController();
    const _ajaxTimeoutId = setTimeout(() => {
      _controller.abort();
    }, _timeout);
    // 请求处理
    try {
      const isEncrypted = url.includes('/v3/');
      const headersConfig = new Headers(getHeaders(headers, config));
      if (body instanceof FormData) {
        headersConfig.delete('Content-Type');
      }
      if (isEncrypted) {
        headersConfig.delete('Content-Type');
        headersConfig.append('Content-Type', 'application/json');
      }

      const response: Response = await fetch(getBaseUrl(config.sharedUrl(method, url), config), {
        method,
        headers: headersConfig,
        body: config.sharedData(method, url, body as BodyInit | null | undefined),
      });

      if (!response.ok) {
        const error = new ResponseError<number, Response>(
          response.status,
          response.statusText,
          response,
          url,
        );
        config.handleResponseFail(error, isErrorToast);
        if (!isSSR() && isErrorToast) {
          toast({
            title: '网络异常',
            description: '网络异常，请稍后重试！',
            type: 'error',
          });
        }
        throw error;
      }
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json') || isEncrypted) {
        let data: string | ResponseData<TTransformResponse> = (await response.json()) as
          | string
          | ResponseData<TTransformResponse>;
        if (isEncrypted && typeof data === 'string') {
          // 如果数据被加密，首先解密
          const unzippedData = encryption.unzip_data<TTransformResponse>(data);
          if (typeof unzippedData !== 'string') {
            data = unzippedData;
            if (process.env.NODE_ENV !== 'production') {
              console.log('[request] 接口响应 解密后数据', url, data);
            }
          }
        }

        // 确保 data 是 ResponseData 类型
        if (typeof data === 'string') {
          throw new ResponseError(
            'PARSE_ERROR',
            'Failed to parse response data',
            {
              code: 'PARSE_ERROR',
              message: 'Failed to parse response data',
            },
            url,
          );
        }

        // 默认成功处理
        const responseData = config.handleResponseSuccess(data, url);
        if (responseData) {
          return transformResponse
            ? transformResponse(responseData)
            : (responseData as unknown as ResponseData<TResponse>);
        }
        // 默认错误处理
        const error = new ResponseError<number | string, ResponseData<TTransformResponse>>(
          data.code,
          data.message || data.info || 'Request failed',
          data,
          url,
        );
        config.handleResponseFail(error, isErrorToast, tokenExpiresnotGoLogin);
        throw error;
      }
      const error = new ResponseError<number, Response>(
        response.status,
        response.statusText,
        response,
        url,
      );
      config.handleResponseFail(error, isErrorToast, tokenExpiresnotGoLogin);
      throw error;
    } finally {
      clearTimeout(_ajaxTimeoutId);
    }
  }
  return {
    get: (url, options = {}) => {
      return handleFetch({
        url,
        ...options,
        method: RequestMethod.get,
      });
    },
    post: (url, options = {}) => {
      return handleFetch({
        url,
        ...options,
        method: RequestMethod.post,
      });
    },
    put: (url, options = {}) => {
      return handleFetch({
        url,
        ...options,
        method: RequestMethod.put,
      });
    },
    delete: (url, options = {}) => {
      return handleFetch({
        url,
        ...options,
        method: RequestMethod.delete,
      });
    },
  } satisfies RequestInstance;
}

export { RequestMethod, ResponseError, type ResponseData, type RequestOptions };
