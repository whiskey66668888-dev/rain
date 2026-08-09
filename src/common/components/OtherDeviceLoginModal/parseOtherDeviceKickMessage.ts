/**
 * 解析主站踢下线文案，例如：
 * 您的账号于2025-9-16 14:24分在其他设备登录。如非本人操作，请立即修改密码。
 */
export interface ParsedOtherDeviceKickMessage {
  line1: {
    prefixBeforeTime: string;
    timeStr: string;
    betweenFenAndPeriod: string;
  } | null;
  line2:
    | { kind: 'link'; beforeLink: string; afterLink: string }
    | { kind: 'plain'; text: string }
    | null;
  /** 无法按固定格式解析时的整段文案 */
  plain?: string;
}

export function parseOtherDeviceKickMessage(info?: string | null): ParsedOtherDeviceKickMessage {
  const raw = info?.trim();
  if (!raw) {
    return { line1: null, line2: null };
  }

  const re = /^(.*)账号于(.+?)分(.*?)。(.*)$/;
  const m = raw.match(re);
  if (!m) {
    return { line1: null, line2: null, plain: raw };
  }

  const prefixBeforeTime = m[1] ?? '';
  const timeStr = m[2] ?? '';
  const betweenFenAndPeriod = m[3] ?? '';
  const rest = (m[4] ?? '').trim();

  const linkToken = '修改密码';
  const linkIdx = rest.indexOf(linkToken);
  let line2: ParsedOtherDeviceKickMessage['line2'] = null;
  if (linkIdx >= 0) {
    line2 = {
      kind: 'link',
      beforeLink: rest.slice(0, linkIdx),
      afterLink: rest.slice(linkIdx + linkToken.length),
    };
  } else if (rest) {
    line2 = { kind: 'plain', text: rest };
  }

  return {
    line1: {
      prefixBeforeTime,
      timeStr,
      betweenFenAndPeriod,
    },
    line2,
  };
}
