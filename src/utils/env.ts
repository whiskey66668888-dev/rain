// 判断是否是服务端
export const isSSR = (): boolean => typeof window === 'undefined';
const ua = isSSR() ? '' : navigator.userAgent;

// ios
export const isIos = (): boolean => /iphone/gi.test(ua);

// android
export const isAndroid = (): boolean => /(?:Android)/.test(ua);
