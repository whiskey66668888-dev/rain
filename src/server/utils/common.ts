import type { Context } from 'koa';

import { locales, Locale } from '../../core/i18n';

/**
 * 从请求中检测语言（标准化为 zh/en/vi）
 */
export function detectLocaleFromRequest(ctx: Context): Locale {
  // // 从 cookie 获取 RICO_TODO: 后期可以优化到nginx判断后重定向返回正确的cache html
  // const cookieLocale = ctx.cookies.get('i18nextLng');
  // if (cookieLocale) {
  //   return cookieLocale.replace(/-.*$/, '').toLowerCase() as Locale;
  // }

  // 从 url 获取
  const urlLocale = ctx.URL.pathname.split('/')[1];
  // 判断是否匹配支持的语言
  if (urlLocale && locales.includes(urlLocale as Locale)) {
    return urlLocale as Locale;
  }

  // 默认返回中文
  return 'zh';
}
