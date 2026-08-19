/** 登录/注册弹窗同一 chunk 图，预热后首次打开可立刻播 Overlay 入场动画 */
export const loadLoginPage = () => import('./LoginPage');
export const loadRegisterPage = () => import('./RegisterPage');

export const prefetchAuthModals = (): Promise<void> => {
  return Promise.all([loadLoginPage(), loadRegisterPage()]).then(() => undefined);
};
