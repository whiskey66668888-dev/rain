export type MomentsIframeMessage = {
  eventName: string;
  payload?: unknown;
};

/** 解析朋友圈 iframe postMessage（兼容 JSON 字符串 / 纯字符串 / 对象） */
export const parseMomentsIframeMessage = (raw: unknown): MomentsIframeMessage | null => {
  let data = raw;

  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (!trimmed) return null;
    try {
      data = JSON.parse(trimmed) as unknown;
    } catch {
      // 非 JSON 的纯字符串按事件名处理，如 'reGetUnreadCount' / 'momentMounted'
      return { eventName: trimmed };
    }
  }

  if (!data || typeof data !== 'object') return null;

  const record = data as Record<string, unknown>;
  const eventName = record.eventName ?? record.type ?? record.event;
  if (typeof eventName !== 'string' || !eventName) return null;

  const payload = record.payload ?? record.data ?? record.count ?? record.unreadCount;

  return { eventName, payload };
};
