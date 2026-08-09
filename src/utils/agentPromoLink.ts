/** /g/{code}、/t/{code}（可带语言前缀）→ /?sysAgentName={code} */
const AGENT_PROMO_PATH_RE = /^\/(?:([a-z]{2}(?:-[a-z]{2})?)\/)?(g|t)\/([^/?#]+)\/?$/i;

/**
 * 解析推广短链路径，例如 /g/h2y-ff、/zh/t/abc
 */
export function parseAgentPromoPath(
  pathname: string,
): { localePrefix: string; code: string } | null {
  const match = pathname.match(AGENT_PROMO_PATH_RE);
  if (!match?.[3]) return null;
  const code = decodeURIComponent(match[3]).trim();
  if (!code) return null;
  return {
    localePrefix: match[1] ? `/${match[1]}` : '',
    code,
  };
}

/**
 * 生成重定向目标 URL（pathname + search），无法解析时返回 null
 */
export function buildAgentPromoRedirectUrl(pathname: string, search = ''): string | null {
  const parsed = parseAgentPromoPath(pathname);
  if (!parsed) return null;

  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  params.set('sysAgentName', parsed.code);
  const qs = params.toString();
  const base = parsed.localePrefix ? `${parsed.localePrefix}/` : '/';
  return `${base}${qs ? `?${qs}` : ''}`;
}

/** 浏览器端：命中推广短链则 replace 跳转 */
export function redirectAgentPromoPathIfNeeded(): boolean {
  if (typeof window === 'undefined') return false;
  const target = buildAgentPromoRedirectUrl(window.location.pathname, window.location.search);
  if (!target) return false;
  window.location.replace(target);
  return true;
}
