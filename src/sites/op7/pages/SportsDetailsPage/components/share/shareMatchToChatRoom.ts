import {
  EmcMsgDescription,
  sendCustomMessage,
  serializeMatchShareForFlutter,
  type MatchShareInfo,
} from '@/core/sdk/IMManager';
import { toast } from '@/common/components/Toast';
import { withLoading } from '@/sites/op7/components/FullScreenLoading/loadingStore';

import { getMountedChatRoom } from './chatShareBridge';
import { prepareChatShare } from './prepareChatShare';
import { toastShareSendFailure } from './shareFailureToast';

/**
 * 赛事「聊天室」分享（对齐 emc SportShareSheet._onShareChatRoom）：
 * 不跳转聊天室界面，直接发送后 toast。
 *
 * 聊天室已挂载时走它的发送链路（带本地回显，成功不 toast，
 * 与 emc handleMatchShareClick 注释掉的 Toast.success 一致）；
 * 未挂载则独立建连后直发。
 *
 * 建连 + 发送可能有明显耗时，全程展示全屏 loading；失败必 toast 原因。
 */
export const shareMatchToChatRoom = async (info: MatchShareInfo | null): Promise<boolean> => {
  // 参数校验在 loading 之前，避免 loading 一闪而过
  if (!info) {
    toast({ type: 'warning', description: '赛事信息未就绪，请稍后再试' });
    return false;
  }

  return withLoading(async () => {
    try {
      const mounted = getMountedChatRoom();
      // 已挂载的聊天室内部会自行 toast 失败原因
      if (mounted) return await mounted.sendMatchShare(info);

      const room = await prepareChatShare();
      if (!room) {
        toast({ type: 'error', description: '聊天室连接失败' });
        return false;
      }
      const result = await sendCustomMessage({
        groupId: room.groupId,
        description: EmcMsgDescription.MatchShare,
        extension: '',
        payload: serializeMatchShareForFlutter(info),
      });
      if (!result.message) {
        toastShareSendFailure(result, '分享失败，请稍后再试');
        return false;
      }
      toast({ type: 'success', description: '分享成功' });
      return true;
    } catch (error) {
      toast({
        type: 'error',
        description:
          error instanceof Error && error.message ? error.message : '分享失败，请稍后再试',
      });
      return false;
    }
  });
};

export default shareMatchToChatRoom;
