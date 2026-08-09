import {
  getChatRoomInfo as getChatRoomInfoService,
  getMsgContent as getMsgContentService,
  getNotLoginMsgContent as getNotLoginMsgContentService,
  getOnlineUsers as getOnlineUsersService,
  type MsgContentItem,
} from '@/core/sdk/IMManager';
import type { ChatRoomInfo } from './types';

export const getPublicChatRoom = async (): Promise<ChatRoomInfo | null> => getChatRoomInfoService();

export const getOnlineUsers = async (groupId: string, type: 1 | 2): Promise<number> =>
  getOnlineUsersService(groupId, type);

export const getMsgContent = async (params: {
  sportType: 1 | 2;
  msgType: 1 | 2;
  gameType: 1 | 2 | 3;
}): Promise<MsgContentItem[]> => getMsgContentService(params);

export const getNotLoginMsgContent = async (sportType: 1 | 2): Promise<MsgContentItem[]> =>
  getNotLoginMsgContentService(sportType);
