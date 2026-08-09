/** 安全转为展示用字符串，避免对 object 使用 String() 触发 eslint no-base-to-string */
export function toDisplayString(v: unknown, fallback = ''): string {
  if (v === null || v === undefined) return fallback;
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'bigint') return String(v);
  return fallback;
}
