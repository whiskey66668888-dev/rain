export class ResponseError<
  TCode = number | string,
  TResponse = { code: number | string; message: string; info?: string } | Response,
> extends Error {
  code: TCode;
  override message: string;
  response: TResponse;
  url: string;
  constructor(code: TCode, message: string, response: TResponse, url: string) {
    super();
    this.code = code;
    this.message = message;
    this.response = response;
    this.url = url;
  }
}

export type RequestOptions<TBody, TTransformResponse, TResponse> = {
  url: string;
  body?: TBody;
  timeout?: number;
  transformResponse?: (data: ResponseData<TTransformResponse>) => ResponseData<TResponse>;
  isErrorToast?: boolean;
  tokenExpiresnotGoLogin?: boolean;
} & Omit<RequestInit, 'body'>;

export interface ResponseData<TData> {
  code: number | string;
  data: TData;
  message: string;
  info?: string;
  success?: boolean;
}
