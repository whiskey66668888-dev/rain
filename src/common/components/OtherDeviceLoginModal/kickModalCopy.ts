/**
 * 业务码 → 弹窗标题
 */
export const KICK_MODAL_TITLE_BY_CODE: Readonly<Record<string, string>> = {
  '9019': '其他设备登录',
  '90001': '其他设备登录',
  '90000': '账号异常',
  '9000': '登录已过期',
  '90002': '账号已被冻结',
};

/** 无 info 时的默认说明 */
export const KICK_MODAL_DEFAULT_DESC_BY_CODE: Readonly<Record<string, string>> = {
  '9019': '您的账号已在其他设备登录，当前设备已退出登录。',
  '90001': '您的账号已在其他设备登录，请重新登录!',
  '90000': '您的账号异常，请联系客服!',
  '9000': '您的登录会话已超时，请重新登录以确保账户安全。',
  '90002': '出于安全原因，您已被强制下线',
};

export function resolveKickModalTitle(code: string, override?: string | null): string {
  const o = override?.trim();
  if (o) return o;
  return KICK_MODAL_TITLE_BY_CODE[String(code)] ?? '其他设备登录';
}

export function resolveKickModalDefaultDesc(code: string): string | undefined {
  return KICK_MODAL_DEFAULT_DESC_BY_CODE[String(code)];
}
