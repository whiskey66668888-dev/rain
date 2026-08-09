export const IM_ERROR_CODES = {
  PLEASE_DO_NOT_SPEAK_TOO_FREQUENTLY: 11801,
  PLEASE_DO_NOT_SEND_DUPLICATE_CONTENT: 11802,
  PLEASE_DO_NOT_POST_MULTIPLE_REVIEWS: 11803,
  USER_MUTED: 110001,
  VISITOR_MUTED: 110002,
  SDK_RESOURCE_NOT_READY: 10004,
  SDK_INTERNAL_ERROR: 10005,
} as const;

export type ImErrorCode = (typeof IM_ERROR_CODES)[keyof typeof IM_ERROR_CODES];

/** 业务拦截码：应对齐 Flutter Toast.info，展示固定中文文案 */
const BUSINESS_INTERCEPT_CODES = new Set<number>([
  IM_ERROR_CODES.PLEASE_DO_NOT_SPEAK_TOO_FREQUENTLY,
  IM_ERROR_CODES.PLEASE_DO_NOT_SEND_DUPLICATE_CONTENT,
  IM_ERROR_CODES.PLEASE_DO_NOT_POST_MULTIPLE_REVIEWS,
  IM_ERROR_CODES.USER_MUTED,
  IM_ERROR_CODES.VISITOR_MUTED,
]);

export const parseImErrorCode = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
};

export const isBusinessSendIntercept = (errorCode?: number): boolean =>
  errorCode != null && BUSINESS_INTERCEPT_CODES.has(errorCode);

/**
 * 发送失败提示文案（对齐 emc getSendTextErrorToast）。
 * - 11801/11802/11803：固定中文，不用服务端 errMsg（常为英文/技术文案）
 * - 110001/110002：优先服务端文案（平台策略会变）
 */
export const getSendTextErrorToast = (errorCode?: number, errorMsg?: string): string => {
  const trimmed = errorMsg?.trim() ?? '';
  switch (errorCode) {
    case IM_ERROR_CODES.PLEASE_DO_NOT_SPEAK_TOO_FREQUENTLY:
      return '请勿过于频繁发言';
    case IM_ERROR_CODES.PLEASE_DO_NOT_SEND_DUPLICATE_CONTENT:
      return '请勿发送重复内容';
    case IM_ERROR_CODES.PLEASE_DO_NOT_POST_MULTIPLE_REVIEWS:
      return '请勿重复多次晒单';
    case IM_ERROR_CODES.USER_MUTED:
      return trimmed || '您已被禁言，暂时无法发言';
    case IM_ERROR_CODES.VISITOR_MUTED:
      return trimmed || '游客暂不可发言';
    default:
      return '消息发送失败';
  }
};

/** 根据错误码计数构建晒单失败组合提示（对齐 emc buildSendBetCardErrorToast） */
export const buildSendBetCardErrorToast = (
  errorCodeCounts: Map<number | undefined, number>,
): string => {
  if (errorCodeCounts.size === 0) return '晒单发送失败';
  const parts: string[] = [];
  errorCodeCounts.forEach((count, code) => {
    const msg = getSendTextErrorToast(code);
    parts.push(count > 1 ? `${msg}(${count}条)` : msg);
  });
  return parts.join('；');
};
