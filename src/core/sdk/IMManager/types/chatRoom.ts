export interface ChatRoomInfo {
  groupId: string;
  historicalMsgNum: number;
}

export interface ChatNotice {
  content: string;
}

export interface HotWordItem {
  content: string;
  sort?: number;
}

export interface MsgContentItem {
  content: string;
  seq?: number;
  send_time?: number;
  user_id?: string | number;
  nickname?: string;
  member_level?: string | number;
  [key: string]: unknown;
}

export interface ChatConfigInfo {
  discoverSwitch: number;
  chatSwitch: number;
  allMuted: number;
  sendMsgVipLevel: number;
  sendMsgBetAmount: number;
  bigBetAmount: number;
  bigWinAmount: number;
  bigCondition: number;
  specialVipLevel: number;
  showBetAmount: number;
  ruleTitle: string;
  ruleContent: string;
  textLength: number;
  groupChatInterval: number;
  groupChatMsgRepeatCount: number;
  groupChatMsgRepeatTime: number;
  groupChatMsgRepeatShowOrderCount: number;
}
