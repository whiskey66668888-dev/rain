const ua = navigator.userAgent;

// ios
export const isIos = (): boolean => /iphone/gi.test(ua);

// android
export const isAndroid = (): boolean => /(?:Android)/.test(ua);
