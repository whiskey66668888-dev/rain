'use client';

import type { FC } from 'react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { checkIp2Req } from '@/apis/origin/login';
import {
  // ACCESS_REST_PATH,
  // API_CODE_IP_ACCESS_DENIED,
  getPurePathname,
  shouldSkipIpAccessCheck,
} from '@/common/constants/accessRest';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { isErrorResponseWithCode } from '@/core/sdk/request';

/** 路由短链跳转（如 /promotion → /promotion/discount）时合并为一次请求 */
const CHECK_IP2_DEBOUNCE_MS = 320;

/**
 * 全站 IP 访问校验（ GlobalEvent#getipAccess ）
 * - 路由变化时请求 /api/website/check/ip2
 * - 业务码 9005 时 replace 到 /accessRest
 */
const GlobalIpAccess: FC = () => {
  const location = useLocation();
  const navigate = useNavigateWithLanguage();

  useEffect(() => {
    const purePath = getPurePathname(location.pathname);
    if (shouldSkipIpAccessCheck(purePath)) return;

    const timerId = setTimeout(() => {
      checkIp2Req().catch((err: unknown) => {
        if (typeof err !== 'object' || err === null || !('response' in err)) {
          return;
        }

        const response = err.response;
        if (!isErrorResponseWithCode(response)) return;

        // if (String(response.code) === API_CODE_IP_ACCESS_DENIED) {
        //   navigate(ACCESS_REST_PATH, { replace: true });
        // }
      });
    }, CHECK_IP2_DEBOUNCE_MS);

    return () => window.clearTimeout(timerId);
  }, [location.pathname, navigate]);

  return null;
};

export default GlobalIpAccess;
