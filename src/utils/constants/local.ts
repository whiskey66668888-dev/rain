// 国际化相关这里统一维护导出，方便后续维护和扩展
export type Locale = 'zh' | 'en' | 'vi';
export const locales: Locale[] = ['zh', 'en', 'vi'];
export const defaultLocale: Locale = 'zh';
export enum LOCALE_FILE_MAP {
  zh = 'zh-CN',
  en = 'en-US',
  vi = 'vi-VN',
}

/** 提供给三方 FB 的国际化语言类型，see enum: language_type */
export enum FB_LANGUAGE_TYPE {
  /** 简体中文 */
  zh = 'CMN',
  /** 英语 */
  en = 'ENG',
  /** 越南语 */
  vi = 'VIE',
  /** 繁体中文 */
  zho = 'ZHO',
  /** 日语 */
  jpn = 'JPN',
  /** 韩语 */
  kor = 'KOR',
  /** 西班牙语 */
  spa = 'SPA',
  /** 泰语 */
  tha = 'THA',
  /** 马来语 */
  msa = 'MSA',
  /** 印尼语 */
  ind = 'IND',
  /** 印地语 */
  hin = 'HIN',
  /** 阿拉伯语 */
  sau = 'SAU',
  /** 德语 */
  deu = 'DEU',
  /** 法语 */
  fra = 'FRA',
  /** 巴西葡语 */
  bra = 'BRA',
  /** 俄语 */
  rus = 'RUS',
  /** 土耳其语 */
  tr = 'TR',
}

// 提供给主站的国际化映射
export enum ORIGIN_LANGUAGE_TYPE {
  zh = 'CN',
  en = 'EN',
  vi = 'VI',
}
