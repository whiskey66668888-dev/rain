import { getSendTextErrorToast, isBusinessSendIntercept } from '@/core/sdk/IMManager';
import { toast } from '@/common/components/Toast';

/**
 * 分享 / 晒单发送失败提示。
 *
 * - 业务拦截码（禁言、频繁发言、重复晒单）：固定中文 + info，对齐 Flutter 的处理
 * - 其余是真失败：优先用服务端 errorMsg。getSendTextErrorToast 的 default 分支
 *   只会吐「消息发送失败」，会把 'IM 未初始化'、网络异常这类真实原因吞掉
 */
export const toastShareSendFailure = (
  result: { errorCode?: number; errorMsg?: string },
  fallbackText: string,
): void => {
  if (isBusinessSendIntercept(result.errorCode)) {
    toast({ type: 'info', description: getSendTextErrorToast(result.errorCode, result.errorMsg) });
    return;
  }
  toast({ type: 'error', description: result.errorMsg?.trim() || fallbackText });
};

export default toastShareSendFailure;
