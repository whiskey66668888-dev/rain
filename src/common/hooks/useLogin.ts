import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { getServiceInfoReq, SERVICE_INFO_QUERY_KEY } from '@/apis/origin/customerService';
import { logoutReq, loginReq, loginWithTokenReq, type LoginParams } from '@/apis/origin/login';
import { loginLogReq } from '@/apis/origin/login';
import { ResponseError } from '@/core/sdk/request/model';
import { uuid, encryption } from '@/core/sdk/request/util';
import { useAppDispatch } from '@/core/store/hooks';
import { clearThirdPartyApiConfig } from '@/core/store/slices/thirdApiConfigSlice';
import {
  setUserInfo,
  clearUserInfo,
  setLoginInfo,
  clearLoginInfo,
} from '@/core/store/slices/userSlice';
import { resetOpenImSession } from '@/core/sdk/IMManager/utils/resetOpenImSession';
import { API_CODE_ORIGIN_FIRST_LOGIN_NEED_SET_PASSWORD } from '@/utils/constants/apiCodeOrigin';
import { consumeAuthRedirectPath } from '@/common/router/authRedirect';
import { getMouseAction } from '@/utils/mouseAction';

import { useNavigateWithLanguage } from './useNavigateWithLanguage';
import { toast } from '../components/Toast';
import { syncSocialUnreadCount } from '@/apis/origin/social/getSocialUnreadCount';
import { clearSecurityCenterQueries, clearSocialConfigQueries } from '@/core/query/utils';
import { PATHS } from '@/sites/op7/routes/paths';
import { useFingerprint } from '@/sites/op7/hooks/useFingerprint';

const USERNAME_REGEX = /^(?:[A-Za-z]{5,16}|\d{5,16}|[A-Za-z\d]{5,16})$/;

const validateLoginForm = (loginName: string, password: string): boolean => {
  if (!USERNAME_REGEX.test(loginName)) {
    toast({
      title: '请输入5-16位数字或字母的用户名',
      type: 'warning',
    });
    return false;
  }
  if (password.trim() === '') {
    toast({
      title: '请输入密码',
      type: 'warning',
    });
    return false;
  }
  return true;
};

const getStoredParams = (): LoginParams | null => {
  const stored = sessionStorage.getItem('params');
  return stored ? (JSON.parse(stored) as LoginParams) : null;
};

export const useLogin = (): {
  login: (data: LoginParams) => Promise<{ success: boolean; code?: string | number }>;
  isLoading: boolean;
  logout: () => Promise<void>;
} => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { visitorId } = useFingerprint();
  const navigate = useNavigateWithLanguage();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const login = useCallback(
    async (
      params: LoginParams,
      autorun = false,
    ): Promise<{ success: boolean; code?: string | number }> => {
      const { loginName, password, keepLogin } = params;
      if (!autorun && !validateLoginForm(loginName, password)) {
        return { success: false };
      }
      setIsLoading(true);
      let loginParams: LoginParams = {
        loginName,
        password,
        uuid: uuid(),
        visitorId,
        keepLogin,
      };
      const storedParams = getStoredParams();
      const token = storedParams?.token;
      if (token && storedParams && Object.keys(storedParams).length > 0) {
        loginParams = { ...loginParams, ...storedParams, token, visitorId };
      }

      try {
        const api = token && storedParams ? loginWithTokenReq : loginReq;
        const res = await api(loginParams);
        setIsLoading(false);
        // 换号登录：清掉上一账号的 OpenIM 会话与 getImMessage 缓存
        await resetOpenImSession(queryClient);
        dispatch(setUserInfo({ loginName, keepLogin: keepLogin === '1' }));
        if (res.data?.loginName) {
          dispatch(setLoginInfo(res.data));
        }
        clearSecurityCenterQueries(queryClient);
        dispatch(clearThirdPartyApiConfig());
        const mouseAction = getMouseAction();
        loginLogReq({
          ...params,
          visitorId,
          ...(mouseAction ? { mouseAction } : {}),
        });
        sessionStorage.removeItem('params');
        // 登录成功后刷新客服配置（belongingScene=1 与全站默认一致）
        void getServiceInfoReq(1)
          .then((serviceRes) => {
            queryClient.setQueryData([...SERVICE_INFO_QUERY_KEY, 1], serviceRes.data ?? {});
          })
          .catch(() => {
            // 客服配置失败不影响登录主流程
          });

        // 保存记住密码功能 (localStorage)
        // 1. 无论是否记住密码，都保存用户的"开关状态偏好"
        localStorage.setItem('isKeepLogin', keepLogin === '1' ? '1' : '0');

        if (keepLogin === '1') {
          // 2. 如果勾选了记住密码，保存账号和加密后的密码
          localStorage.setItem('userName', loginName);
          try {
            const encryptedPwd = encryption.zip_data({ password });
            if (encryptedPwd) {
              localStorage.setItem('userPwd', encryptedPwd);
            }
          } catch (error) {
            console.error('密码加密失败', error);
            localStorage.removeItem('userPwd');
          }
        } else {
          // 3. 用户未勾选记住密码，清除账号密码数据，但保留 isKeepLogin=0 的状态
          localStorage.removeItem('userName');
          localStorage.removeItem('userPwd');
        }

        const authRedirectPath = consumeAuthRedirectPath();
        navigate(authRedirectPath ?? '/');
        return { success: true };
      } catch (error) {
        setIsLoading(false);
        clearSecurityCenterQueries(queryClient);
        dispatch(clearUserInfo());
        const code = (error as ResponseError<string | number>).code;
        if (code === API_CODE_ORIGIN_FIRST_LOGIN_NEED_SET_PASSWORD) {
          console.log('TODO:首次登录，需要设置密码');
        }
        console.log('login error:', error);
        return { success: false, code };
      }
    },
    [dispatch, navigate, queryClient, visitorId],
  );

  const logout = useCallback(async (): Promise<void> => {
    await logoutReq();
    await resetOpenImSession(queryClient);
    clearSecurityCenterQueries(queryClient);
    clearSocialConfigQueries(queryClient);
    syncSocialUnreadCount(dispatch, 0);
    dispatch(clearUserInfo());
    dispatch(clearLoginInfo());
    dispatch(clearThirdPartyApiConfig());
    navigate(PATHS.home);
  }, [navigate, dispatch, queryClient]);

  return { login, isLoading, logout };
};
