import { ResponseData, ResponseError } from './model';

export interface RequestConf {
  host?: string;
  timeout?: number;
  sharedHeaders: () => Record<string, string>;
  sharedUrl: (method: string | undefined, url: string) => string;
  sharedData: (
    method: string | undefined,
    url: string,
    data: BodyInit | null | undefined,
  ) => BodyInit | null | undefined;
  /**
   * 兼容接口数据结构字段定义
   * 现实场景中不同的后端团队定义接口数据结构有自己的命名习惯
   */
  handleResponseSuccess: <TTransformResponse>(
    data: ResponseData<TTransformResponse>,
    url?: string,
  ) => ResponseData<TTransformResponse> | null;
  handleResponseFail: <
    TCode extends number | string = number | string,
    TResponse = { code: number | string; message: string; info?: string } | Response,
  >(
    error: ResponseError<TCode, TResponse>,
    isErrorToast: boolean,
    tokenExpiresnotGoLogin?: boolean,
  ) => void;
}

export enum RequestMethod {
  get = 'get',
  post = 'post',
  put = 'put',
  delete = 'delete',
}

// 默认配置
export const basicConfig: RequestConf = {
  host: __SITE_CONFIG__.api.baseUrl,
  timeout: 10000,
  sharedHeaders: () => ({}),
  sharedUrl: (method, url) => {
    // 如果 URL 已经是绝对路径，则直接返回
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const base = basicConfig.host || '';
    // 规范化斜杠，确保正确拼接
    const baseNormalized = base.endsWith('/') ? base.slice(0, -1) : base;
    const urlNormalized = url.startsWith('/') ? url.slice(1) : url;
    return `${baseNormalized}/${urlNormalized}`;
  },
  sharedData: (method, url, data) => data,
  handleResponseSuccess: (data) => data,
  handleResponseFail: (_error, _isErrorToast) => null,
};
