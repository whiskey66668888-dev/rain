import { EVenue } from '@/apis/commonSports/constants';
import { EmcMsgExtension } from '../constants/emcMessage';

export const getExtensionFromVenueId = (venueId?: string | null): string => {
  const venue = venueId?.toLowerCase();
  switch (venue) {
    case EVenue.OB:
      return EmcMsgExtension.DB;
    case EVenue.FB:
      return EmcMsgExtension.FB;
    case 'bti':
    case 'btizx':
      return EmcMsgExtension.BTI;
    default:
      return EmcMsgExtension.DB;
  }
};

export const getGameType = (venueId?: string | null): 1 | 2 | 3 => {
  const venue = venueId?.toLowerCase();
  if (venue === EVenue.FB) return 2;
  if (venue === 'bti' || venue === 'btizx') return 3;
  return 1;
};

/**
 * 聊天室相关接口的 sport_type。
 * 对齐 emc chat_utils.getSportType：全站只有一个公共聊天室，
 * 配置/公告/历史等统一传 1（足球），篮球详情也复用同一套配置。
 */
export const getSportType = (_sportId?: number | null): 1 | 2 => {
  return 1;
};

export const getConversationId = (siteCode: string, groupId: string): string =>
  `${siteCode}_sg_${groupId}`;
