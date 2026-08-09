import { useCallback, useEffect, useState } from 'react';
import {
  browserName,
  isAndroid,
  isIOS,
  isMacOs,
  isWindows,
  mobileModel,
  osVersion,
} from 'react-device-detect';

import { getVisitIpReq } from '@/apis/origin/getVisitIp';

const LOGIN_PORT_OP7 = 'o.p.7';

function getTimezoneOffsetLabel(): string {
  const offsetMinutes = new Date().getTimezoneOffset();
  const offsetHours = -offsetMinutes / 60;
  const sign = offsetHours >= 0 ? '+' : '-';
  return `UTC${sign}${Math.abs(offsetHours)}`;
}

function formatDeviceTime(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}年${m}月${day}日 ${h}:${min}:${s}(${getTimezoneOffsetLabel()})`;
}

export interface CustomerServiceDeviceInfoState {
  phoneModel: string;
  phoneOs: string;
  loginIp: string;
  loginPort: string;
  osName: string;
  browser: string;
  currentTime: string;
}

const defaultState: CustomerServiceDeviceInfoState = {
  phoneModel: '—',
  phoneOs: '—',
  loginIp: '—',
  loginPort: LOGIN_PORT_OP7,
  osName: '—',
  browser: '—',
  currentTime: '—',
};

export function useCustomerServiceDeviceInfo(enabled: boolean): CustomerServiceDeviceInfoState {
  const [state, setState] = useState<CustomerServiceDeviceInfoState>(defaultState);

  const refreshStatic = useCallback(() => {
    const model =
      mobileModel?.trim() ||
      (typeof navigator !== 'undefined' ? navigator.platform || 'PC / Web' : '—');
    const ver = osVersion?.trim() || '—';
    const osFamily = isIOS
      ? 'iOS'
      : isAndroid
        ? 'Android'
        : isWindows
          ? 'Windows'
          : isMacOs
            ? 'macOS'
            : 'Web';
    setState((prev) => ({
      ...prev,
      phoneModel: model,
      phoneOs: ver,
      osName: ver !== '—' ? `${osFamily} ${ver}` : osFamily,
      browser: browserName?.trim() || '—',
      loginPort: LOGIN_PORT_OP7,
      currentTime: formatDeviceTime(),
    }));
  }, []);

  useEffect(() => {
    if (!enabled) return;
    refreshStatic();
    getVisitIpReq()
      .then((ip) => {
        setState((prev) => ({ ...prev, loginIp: ip?.trim() || '—' }));
      })
      .catch(() => {
        setState((prev) => ({ ...prev, loginIp: '—' }));
      });
  }, [enabled, refreshStatic]);

  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => {
      setState((prev) => ({ ...prev, currentTime: formatDeviceTime() }));
    }, 1000);
    return () => window.clearInterval(id);
  }, [enabled]);

  return state;
}
