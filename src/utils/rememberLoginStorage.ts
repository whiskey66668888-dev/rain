import { isSSR } from '@/utils/env';

/** 清除本地记住的登录密码，保留账号与「记住密码」开关偏好 */
export function clearRememberedLoginPassword(): void {
  if (isSSR()) return;
  localStorage.removeItem('userPwd');
}
