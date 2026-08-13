import {
  browserName,
  isAndroid,
  isIOS,
  isMacOs,
  isWindows,
  mobileModel,
  osVersion,
} from 'react-device-detect';

export interface CustomerServiceDeviceInfo {
  phoneModel: string;
  phoneOs: string;
  osName: string;
  browser: string;
}

export function getCustomerServiceDeviceInfo(): CustomerServiceDeviceInfo {
  const phoneModel =
    mobileModel?.trim() ||
    (typeof navigator !== 'undefined' ? navigator.platform || 'PC / Web' : '—');
  const phoneOs = osVersion?.trim() || '—';
  const osFamily = isIOS
    ? 'iOS'
    : isAndroid
      ? 'Android'
      : isWindows
        ? 'Windows'
        : isMacOs
          ? 'macOS'
          : 'Web';

  return {
    phoneModel,
    phoneOs,
    osName: phoneOs !== '—' ? `${osFamily} ${phoneOs}` : osFamily,
    browser: browserName?.trim() || '—',
  };
}
