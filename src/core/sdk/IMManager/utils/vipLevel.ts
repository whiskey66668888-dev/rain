/**
 * 从群成员 ex JSON 解析 VIP 等级（对齐 emc _extractVipLevelFromMemberInfo）
 * ex 示例：`{"member_level":3}`
 */
export const extractVipLevelFromEx = (ex?: string | null): number => {
  if (!ex) return 0;
  try {
    const parsed = JSON.parse(ex) as { member_level?: number | string };
    const level = parsed.member_level;
    if (typeof level === 'number' && Number.isFinite(level)) {
      return Math.max(0, Math.min(10, level));
    }
    if (typeof level === 'string') {
      const n = Number.parseInt(level, 10);
      return Number.isFinite(n) ? Math.max(0, Math.min(10, n)) : 0;
    }
  } catch {
    // ignore
  }
  return 0;
};

/** VIP 徽章图路径（0–10，资源来自 emc new_vip_level*.png） */
export const getVipBadgeSrc = (level: number): string => {
  const safe = Math.max(0, Math.min(10, Math.floor(level) || 0));
  return `/images/common/chat/new_vip_level${safe}.png`;
};
