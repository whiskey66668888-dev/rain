/** 昵称规则：仅中文、字母、数字；最多 15 个汉字或 30 个英文字符（1 汉字 = 2 宽度单位） */

export const NICKNAME_MAX_WIDTH = 30;

const RE_CJK = /[\u4e00-\u9fa5]/;
const RE_ASCII_ALNUM = /[a-zA-Z0-9]/;

export function nicknameDisplayWidth(s: string): number {
  let w = 0;
  for (const ch of s) {
    if (RE_CJK.test(ch)) w += 2;
    else if (RE_ASCII_ALNUM.test(ch)) w += 1;
  }
  return w;
}

export function sanitizeNicknameInput(raw: string): string {
  let out = '';
  let w = 0;
  for (const ch of raw) {
    const isCjk = RE_CJK.test(ch);
    const isAlnum = RE_ASCII_ALNUM.test(ch);
    if (!isCjk && !isAlnum) continue;
    const cw = isCjk ? 2 : 1;
    if (w + cw > NICKNAME_MAX_WIDTH) break;
    out += ch;
    w += cw;
  }
  return out;
}

export function isNicknameValid(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  if (!/^[\u4e00-\u9fa5a-zA-Z0-9]+$/.test(t)) return false;
  const w = nicknameDisplayWidth(t);
  return w >= 1 && w <= NICKNAME_MAX_WIDTH;
}

export const NICKNAME_EMPTY_MSG = '请输入昵称';

export const NICKNAME_FORMAT_ERROR_MSG =
  '格式错误，支持中文、字母、数字组合，最多15个汉字或30个英文字符';

export function getNicknameBlurError(nickname: string): string | null {
  if (isNicknameValid(nickname)) return null;
  const t = nickname.trim();
  if (!t) return NICKNAME_EMPTY_MSG;
  return NICKNAME_FORMAT_ERROR_MSG;
}
