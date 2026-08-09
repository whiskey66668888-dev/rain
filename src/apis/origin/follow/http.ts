import request from '@/core/sdk/request';
import { ResponseData } from '@/core/sdk/request/model';

/**
 * 关注 v2 写接口（add/del/sync）统一以 JSON body 提交。
 *
 * `/api/game` 下多数接口是 Spring 表单参数：默认 sharedData 会把对象 POST body 转成
 * form-urlencoded、sharedHeaders 把 Content-Type 设为 application/x-www-form-urlencoded。
 * 但 v2 关注写接口后端按 JSON 解析（与 App 端 `Headers.jsonContentType` 一致），表单会导致
 * 后端拿不到参数报 9006。这里做两件事绕开默认表单编码：
 *  1. 传**预先 JSON.stringify 的字符串** body —— sharedData 对字符串原样透传，不会再表单编码；
 *  2. 覆盖 `Content-Type: application/json` —— getHeaders 中调用方 headers 优先级最高，胜过 sharedHeaders。
 * 公共头（visitType/visitSource/version/X-Site-Id）仍由 sharedHeaders 以请求头形式携带，无需放进 body。
 */
export const postFollowJson = <TResponse>(
  url: string,
  params: object,
): Promise<ResponseData<TResponse>> =>
  request.post<TResponse, string>(url, {
    isErrorToast: false,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
