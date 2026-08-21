import { safeGetSessionString } from '@/utils/storage/webStorage';

/**
 * 站点 APP 下载链接：拼接 session 中的代理参数，与 MainLayout URL 写入的 sysAgentName 一致。
 */
export function buildDownloadAppUrl(rawDownUrl?: string | null): string {
  const baseUrl = typeof rawDownUrl === 'string' ? rawDownUrl.trim() : '';
  if (!baseUrl) return '';
  if (typeof window === 'undefined') return baseUrl;
  const sessionSysAgentName = safeGetSessionString('sysAgentName');
  const params = sessionSysAgentName
    ? `?sysAgentName=${encodeURIComponent(sessionSysAgentName)}`
    : '';
  return `${baseUrl}${params}`;
}

/** 新开标签打开下载页（noopener 由各浏览器新开页默认策略兜底） */
export function openDownloadAppUrl(url: string): void {
  if (!url) return;
  window.open(url, '_blank');
}
