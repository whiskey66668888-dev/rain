import { ThemeMode } from './constants/system';
import {
  buildEmcActivityLink,
  parseEmcDiscountActivityId,
  type FormatEmcRichTextOptions,
} from '@/common/utils/emcLink';

export {
  isVipExclusiveActivityId,
  buildEmcActivityLink,
  parseEmcDiscountActivityId,
} from '@/common/utils/emcLink';
export type {
  BuildEmcActivityLinkOptions,
  EmcActivityLink,
  FormatEmcRichTextOptions,
} from '@/common/utils/emcLink';

export { cn } from './cn';

/**
 * 将对象转换为 URL 编码的查询字符串
 * @param obj 要转换的对象
 * @returns URL 编码的查询字符串（不包含前导 '?'）
 * @example
 * ```ts
 * stringify({ a: 1, b: 'hello', c: true })
 * // => 'a=1&b=hello&c=true'
 *
 * stringify({ a: null, b: undefined, c: '' })
 * // => 'a=&b=&c='
 * ```
 */
export function querystringStringify(
  obj: Record<string, string | number | boolean | null | undefined>,
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(obj)) {
    // 处理 null、undefined 和空字符串
    if (value === null || value === undefined || value === '') {
      params.append(key, '');
    } else {
      // 将值转换为字符串
      params.append(key, String(value));
    }
  }

  return params.toString();
}

/**
 * 解析查询字符串为对象
 * @param str 查询字符串（可以包含或不包含前导 '?'）
 * @returns 解析后的对象
 * @example
 * ```ts
 * parse('a=1&b=hello&c=true')
 * // => { a: '1', b: 'hello', c: 'true' }
 *
 * parse('?a=1&b=hello')
 * // => { a: '1', b: 'hello' }
 * ```
 */
export function parse(str: string): Record<string, string> {
  // 移除前导 '?'
  const cleanStr = str.startsWith('?') ? str.slice(1) : str;
  const params = new URLSearchParams(cleanStr);
  const result: Record<string, string> = {};

  for (const [key, value] of params.entries()) {
    result[key] = value;
  }

  return result;
}

/**
 * 深度合并对象
 * @param target 目标对象
 * @param source 源对象
 */
export function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      const sourceValue = source[key as keyof T];
      const targetValue = target[key as keyof T];

      if (isObject(sourceValue) && isObject(targetValue) && !Array.isArray(sourceValue)) {
        // 递归合并嵌套对象
        (output as Record<string, unknown>)[key] = deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>,
        );
      } else if (sourceValue !== undefined) {
        // 如果源对象有值，使用源对象的值
        (output as Record<string, unknown>)[key] = sourceValue as T[keyof T];
      }
    });
  }

  return output;
}

export function isObject(item: unknown): item is Record<string, unknown> {
  return item !== null && typeof item === 'object' && !Array.isArray(item);
}

/**
 * 检查字符串是否为 base64 编码
 * @param str 要检查的字符串
 * @returns 是否为 base64 编码
 */
export function isBase64(str: string | undefined | null): boolean {
  if (!str || typeof str !== 'string') {
    return false;
  }
  // 检查是否是 data URI 格式的 base64
  if (str.startsWith('data:')) {
    return true;
  }
  // base64 字符串通常只包含 A-Z, a-z, 0-9, +, /, = 字符
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  return base64Regex.test(str) && str.length > 0 && str.length % 4 === 0;
}

/**
 * 检测设备是否支持 hover（悬停）操作
 *
 * 通过媒体查询 `(hover: hover)` 和 `(pointer: fine)` 来判断设备是否支持 hover。
 * 移动设备通常不支持 hover，而桌面设备（鼠标/触摸板）支持。
 *
 * 这是一个纯函数，不依赖 React，可以在任何环境中调用。
 *
 * @returns {boolean} 设备是否支持 hover
 *
 * @example
 * ```ts
 * import { checkCanHover } from '@/utils';
 *
 * const canHover = checkCanHover();
 * if (canHover) {
 *   // 显示 hover 效果
 * }
 * ```
 */
export function checkCanHover(): boolean {
  // SSR 环境下返回 false
  if (typeof window === 'undefined') {
    return false;
  }

  // 检测媒体查询：设备是否支持 hover 和精确指针（鼠标/触摸板）
  // (hover: hover) - 设备支持 hover
  // (pointer: fine) - 设备有精确指针（如鼠标），而不是粗糙指针（如触摸）
  const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  return mediaQuery.matches;
}

/**
 * 延迟指定毫秒数后 resolve 的 Promise，用于 async/await
 * @param ms 毫秒数
 * @returns Promise<void>
 * @example
 * await sleep(1000); // 等待 1 秒
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 复制文本到剪贴板
 *
 * 优先使用现代 Clipboard API，失败时自动降级到 execCommand
 * 这是一个纯工具函数，不依赖 React
 *
 * @param text 要复制的文本
 * @returns 是否复制成功
 *
 * @example
 * ```ts
 * const ok = await copyToClipboard('123456');
 * ```
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // SSR 环境直接失败
  if (typeof window === 'undefined') return false;

  // 优先使用现代 API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 继续走 fallback
    }
  }

  // fallback：execCommand（兼容老环境 / 非 https）
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.opacity = '0';

    document.body.appendChild(textarea);
    textarea.select();

    const success = document.execCommand('copy');
    document.body.removeChild(textarea);

    return success;
  } catch {
    return false;
  }
}

// layout滚动区域滚动到顶部
export const scrollToTopLayoutMainContent = (behavior: ScrollBehavior = 'auto') => {
  const mainContent = document.getElementById('layout-main-content');
  if (mainContent) {
    mainContent.scrollTo({ top: 0, behavior });
  }
};

const SPORTS_PAGE_MAIN_AREA_ID = 'sports-page-main-area';
const SCROLL_OFFSET_TOP = 40; // 预留header高度

/**
 * 若当前滚动已超过 #sports-page-main-area 的顶部，则滚动到该元素顶部（略带上偏移）；否则不滚动
 */
export const scrollToSportsPageMainAreaIfNeeded = () => {
  const mainContent = document.getElementById('layout-main-content');
  const target = document.getElementById(SPORTS_PAGE_MAIN_AREA_ID);
  if (!mainContent || !target) return;
  const mainRect = mainContent.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  if (targetRect.top < mainRect.top) {
    mainContent.scrollTop += targetRect.top - mainRect.top - SCROLL_OFFSET_TOP;
  }
};

/**
 * 从 HTML 字符串中去除标签
 * @param str HTML 字符串
 * @returns 去除标签后的文本内容
 */
export const stripTagsFromHtmlString = (str: string) => {
  // 使用 DOMParser 将 HTML 字符串转换为 DOM 对象
  const parser = new DOMParser();
  const doc = parser.parseFromString(str, 'text/html');

  // 获取文本内容
  return doc.body.innerText;
};

/**
 * 将文本中的 URL 转换为可点击的链接
 * @param text 原始文本
 * @returns 处理后的 HTML 字符串
 */
export const convertUrlsToLinks = (text: string) => {
  if (!text) return '';

  // 匹配 http:// 或 https:// 开头的 URL
  const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/gi;

  return text.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: var(--ThemeColor-Main); text-decoration: underline; word-break: break-all;">${url}</a>`;
  });
};

const decodeHtmlEntities = (text: string) => {
  if (typeof document === 'undefined') return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

const decodeHtmlEntitiesDeep = (text: string, maxDepth = 3) => {
  let current = text;
  for (let i = 0; i < maxDepth; i += 1) {
    const next = decodeHtmlEntities(current);
    if (next === current) break;
    current = next;
  }
  return current;
};

const normalizeEscapedHtml = (text: string) => {
  return text
    .replace(/\\r\\n|\\n|\\r/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\');
};

const sanitizeRichNode = (node: Element) => {
  const blockedTags = new Set(['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta']);
  const tagName = node.tagName.toLowerCase();
  if (blockedTags.has(tagName)) {
    node.remove();
    return;
  }

  [...node.attributes].forEach((attr) => {
    const attrName = attr.name.toLowerCase();
    const attrValue = attr.value.trim();
    if (attrName.startsWith('on')) {
      node.removeAttribute(attr.name);
      return;
    }
    if (
      (attrName === 'href' || attrName === 'src') &&
      /^javascript:/i.test(attrValue.replace(/\s+/g, ''))
    ) {
      node.removeAttribute(attr.name);
    }
  });

  if (tagName === 'a') {
    if (node.getAttribute('data-emc-link') === 'true') {
      node.removeAttribute('target');
      node.removeAttribute('rel');
      return;
    }
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
};

export type FormatMessageRichTextOptions = FormatEmcRichTextOptions;

/**
 * 处理消息中心富文本:
 * 1. 兼容后端返回的转义 HTML
 * 2. 将 /h5/discountDetails/:id 活动链接转为当前站点可点击链接（仅 DOM 阶段处理）
 * 3. 将纯文本链接转为可点击链接
 * 4. 保留换行
 */
export const formatMessageRichText = (text: string, options?: FormatMessageRichTextOptions) => {
  if (!text) return '';

  const decodedText = decodeHtmlEntitiesDeep(text);
  const normalizedText = normalizeEscapedHtml(decodedText);
  const withLineBreak = normalizedText.replace(/\r?\n/g, '<br/>');

  if (typeof DOMParser === 'undefined') {
    return convertUrlsToLinks(withLineBreak);
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(withLineBreak, 'text/html');
  const allElements = [...doc.body.querySelectorAll('*')];
  allElements.forEach((el) => sanitizeRichNode(el));

  // 统一在 DOM 阶段改写已有活动详情 <a>，避免字符串层 HTML 注入导致重复包裹
  if (options) {
    doc.body.querySelectorAll('a[href]').forEach((anchor) => {
      if (anchor.getAttribute('data-emc-link') === 'true') return;

      const href = anchor.getAttribute('href') || '';
      const activityId = parseEmcDiscountActivityId(href);
      if (!activityId) return;

      const link = buildEmcActivityLink({
        activityId,
        isMobile: options.isMobile,
        origin: options.origin,
      });
      anchor.setAttribute('href', link.href);
      anchor.setAttribute('data-emc-link', 'true');
      anchor.setAttribute('data-activity-id', activityId);
      anchor.removeAttribute('target');
      anchor.removeAttribute('rel');
      if (!anchor.textContent?.trim() || parseEmcDiscountActivityId(anchor.textContent)) {
        anchor.textContent = link.href;
      }
    });
  }

  const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/gi;
  const textNodes: Text[] = [];
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);

  let node = walker.nextNode();
  while (node) {
    textNodes.push(node as Text);
    node = walker.nextNode();
  }

  textNodes.forEach((textNode) => {
    const raw = textNode.nodeValue || '';
    if (!raw.trim()) return;
    if (textNode.parentElement?.closest('a')) return;

    const frag = doc.createDocumentFragment();
    let cursor = 0;
    let matched = false;

    raw.replace(urlRegex, (url, _group, offset: number) => {
      matched = true;

      if (offset > cursor) {
        frag.appendChild(doc.createTextNode(raw.slice(cursor, offset)));
      }

      const emcActivityId = parseEmcDiscountActivityId(url);
      const anchor = doc.createElement('a');

      if (emcActivityId && options) {
        const { href } = buildEmcActivityLink({
          activityId: emcActivityId,
          isMobile: options.isMobile,
          origin: options.origin,
        });
        anchor.href = href;
        anchor.setAttribute('data-emc-link', 'true');
        anchor.setAttribute('data-activity-id', emcActivityId);
        anchor.textContent = href;
      } else {
        anchor.href = url;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.textContent = url;
      }

      anchor.style.color = 'var(--ThemeColor-Main)';
      anchor.style.textDecoration = 'underline';
      anchor.style.wordBreak = 'break-all';
      frag.appendChild(anchor);

      cursor = offset + url.length;
      return url;
    });

    if (!matched) return;

    if (cursor < raw.length) {
      frag.appendChild(doc.createTextNode(raw.slice(cursor)));
    }

    textNode.parentNode?.replaceChild(frag, textNode);
  });

  return doc.body.innerHTML;
};

/**
 * 获取系统主题
 * @returns 系统主题
 */
export function getSystemTheme(): Exclude<ThemeMode, 'system'> {
  if (typeof window === 'undefined') {
    return 'light';
  }
  const hour = new Date().getHours();
  // 06:00-17:59 为白天；18:00-05:59 为黑夜
  return hour >= 6 && hour < 18 ? 'light' : 'dark';
}
