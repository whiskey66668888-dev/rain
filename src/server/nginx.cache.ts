/**
 * 缓存项接口
 */
interface CacheItem {
  html: string;
  expireAt: number; // 过期时间戳（毫秒）
}

/**
 * HTML 缓存存储
 * key: 路由路径
 * value: 缓存项（包含 HTML 和过期时间）
 */
const htmlCache = new Map<string, CacheItem>();

/**
 * 缓存过期时间：10 分钟（毫秒）
 */
const CACHE_EXPIRE_TIME = 10 * 60 * 1000;

/**
 * 获取缓存的 HTML
 * @param routePath 路由路径
 * @returns 缓存的 HTML，如果不存在或已过期则返回 null
 */
export function getCachedHtml(routePath: string): string | null {
  const cacheItem = htmlCache.get(routePath);

  if (!cacheItem) {
    return null;
  }

  // 检查是否过期
  if (Date.now() > cacheItem.expireAt) {
    // 已过期，删除缓存
    htmlCache.delete(routePath);
    return null;
  }

  return cacheItem.html;
}

/**
 * 设置 HTML 缓存
 * @param routePath 路由路径
 * @param html HTML 内容
 */
export function setCachedHtml(routePath: string, html: string): void {
  const expireAt = Date.now() + CACHE_EXPIRE_TIME;
  htmlCache.set(routePath, {
    html,
    expireAt,
  });
}

/**
 * 清除指定路由的缓存
 * @param routePath 路由路径，如果不传则清除所有缓存
 */
export function clearCache(routePath?: string): void {
  if (routePath) {
    htmlCache.delete(routePath);
  } else {
    htmlCache.clear();
  }
}

/**
 * 清理过期的缓存（可以定期调用）
 */
export function cleanExpiredCache(): void {
  const now = Date.now();
  for (const [routePath, cacheItem] of htmlCache.entries()) {
    if (now > cacheItem.expireAt) {
      htmlCache.delete(routePath);
    }
  }
}

/**
 * 生产环境本地模拟nginx缓存html文件
 * @param routePath 路由路径
 * @param html HTML 内容（如果提供则设置缓存，否则获取缓存）
 * @returns 缓存的 HTML 或传入的 HTML
 */
export function nginxCacheHtml(routePath: string, html?: string): string | null {
  // 如果提供了 HTML，则设置缓存
  if (html !== undefined) {
    setCachedHtml(routePath, html);
    return html;
  }

  // 否则获取缓存
  return getCachedHtml(routePath);
}
