import type { TBetHistoryOrderItem } from '@/apis/commonSports/types';
import { EVenue } from '@/apis/commonSports/constants';
import { EMC_MSG_DESCRIPTION_LABEL, getExtensionFromVenueId } from '@/core/sdk/IMManager';
import { toast } from '@/common/components/Toast';
import { withLoading } from '@/sites/op7/components/FullScreenLoading/loadingStore';

import {
  mapBetHistoryOrderToShareCard,
  serializeBetShareForFlutter,
} from '../discover/DiscoverContent/ChatContent/utils/shareOrderMapper';
import { getMountedChatRoom } from './chatShareBridge';
import { prepareChatShare } from './prepareChatShare';
import { toastShareSendFailure } from './shareFailureToast';

/**
 * 注单「聊天室」晒单：脱离聊天页独立发送（对齐 emc BetOrderShareSheet._onShareChatRoom
 * 的兜底链路：ensureImReady → 取公共聊天室 → sendBetCardMessage）。
 * 注单页/侧边注单没有挂载聊天室，故不能走 useChatRoom.sendBetShare。
 *
 * 建连 + 发送可能有明显耗时，全程展示全屏 loading；失败必 toast 原因。
 */
export const shareBetToChatRoom = async (
  order: TBetHistoryOrderItem,
  venueId: string = EVenue.FB,
): Promise<boolean> => {
  const card = mapBetHistoryOrderToShareCard(order, venueId);

  return withLoading(async () => {
    try {
      // 聊天室已挂载：走它的发送链路，能本地回显（成功 toast 与失败原因均由其内部弹出）
      const mounted = getMountedChatRoom();
      if (mounted) return await mounted.sendBetShare(card);

      const room = await prepareChatShare();
      if (!room) {
        toast({ type: 'error', description: '聊天室连接失败' });
        return false;
      }
      const { sendCustomMessage } = await import(
        '@/core/sdk/IMManager/client/conversationService'
      );
      const result = await sendCustomMessage({
        groupId: room.groupId,
        description: EMC_MSG_DESCRIPTION_LABEL.Emc1,
        extension: getExtensionFromVenueId(venueId),
        payload: serializeBetShareForFlutter(card),
      });
      if (!result.message) {
        toastShareSendFailure(result, '晒单发送失败，请稍后再试');
        return false;
      }
      toast({ type: 'success', description: '晒单成功' });
      return true;
    } catch (error) {
      toast({
        type: 'error',
        description:
          error instanceof Error && error.message ? error.message : '晒单失败，请稍后再试',
      });
      return false;
    }
  });
};

export default shareBetToChatRoom;
