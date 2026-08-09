import { EMPTY_CHAT_MUTE_INFO, type ChatMuteInfo } from '../types/mute';

/**
 * 由后端禁言三元组构造 ChatMuteInfo（对齐 emc ChatMuteInfo.fromImTokenInfo）
 * - status：0=正常，1=禁言
 * - until：秒级时间戳；0=未禁言，-1=永久，>0=到期时间
 * - reason：可空
 */
export const createMuteInfoFromToken = (params: {
  status: number;
  until: number;
  reason?: string;
  nowSec?: number;
}): ChatMuteInfo => {
  const reason = params.reason?.trim() || undefined;
  if (params.status !== 1) return EMPTY_CHAT_MUTE_INFO;

  if (params.until === -1) {
    return { isMuted: true, muteType: 'permanent', reason };
  }

  if (params.until > 0) {
    const nowSec = params.nowSec ?? Math.floor(Date.now() / 1000);
    if (params.until > nowSec) {
      return {
        isMuted: true,
        muteType: 'timed',
        muteEndTime: params.until * 1000,
        reason,
      };
    }
  }

  return EMPTY_CHAT_MUTE_INFO;
};

/**
 * 兼容 account/info 旧字段 mute_type / mute_end_time（毫秒）
 * mute_type: 0=无 1=定时 2=永久
 */
export const createMuteInfoFromAccount = (
  raw: {
    mute_type?: number;
    mute_end_time?: number;
    mute_status?: number;
    mute_until?: number;
    mute_reason?: string;
    muteStatus?: number;
    muteUntil?: number;
    muteReason?: string;
  } | null,
): ChatMuteInfo => {
  if (!raw) return EMPTY_CHAT_MUTE_INFO;

  // 优先新契约 mute_status / mute_until
  const status = raw.mute_status ?? raw.muteStatus;
  if (status != null) {
    return createMuteInfoFromToken({
      status: Number(status),
      until: Number(raw.mute_until ?? raw.muteUntil ?? 0),
      reason: raw.mute_reason ?? raw.muteReason,
    });
  }

  const muteType = Number(raw.mute_type ?? 0);
  if (muteType === 2) {
    return { isMuted: true, muteType: 'permanent' };
  }
  if (muteType === 1) {
    const endMs = Number(raw.mute_end_time ?? 0);
    if (endMs > Date.now()) {
      return { isMuted: true, muteType: 'timed', muteEndTime: endMs };
    }
  }
  return EMPTY_CHAT_MUTE_INFO;
};

/** 定时禁言剩余分钟（向上取整，最少 1） */
export const getMuteRemainMinutes = (info: ChatMuteInfo, now = Date.now()): number => {
  if (info.muteType !== 'timed' || !info.muteEndTime) return 0;
  const secs = Math.floor((info.muteEndTime - now) / 1000);
  if (secs <= 0) return 0;
  return Math.ceil(secs / 60);
};
