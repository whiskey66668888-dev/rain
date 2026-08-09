export interface ChatMuteInfo {
  isMuted: boolean;
  muteType: 'none' | 'timed' | 'permanent';
  muteEndTime?: number;
  reason?: string;
}

export const EMPTY_CHAT_MUTE_INFO: ChatMuteInfo = {
  isMuted: false,
  muteType: 'none',
};
