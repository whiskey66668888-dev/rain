type LogoutResetFn = () => Promise<void>;

let logoutReset: LogoutResetFn | null = null;
let pendingLogoutReset = false;

/**
 * OpenIMClient 模块加载后注册。resetOpenImSession 不能静态/动态 import SDK：
 * 那条链在 request.ts / Header，会把 vendor-openim 打进入口依赖（含 modulepreload）。
 */
export const registerOpenImLogoutReset = (fn: LogoutResetFn): void => {
  logoutReset = fn;
  if (!pendingLogoutReset) return;
  pendingLogoutReset = false;
  void fn();
};

/** 若 SDK 尚未加载则只记一笔 pending，模块到来时再 logout；已加载则立即复位。 */
export const runRegisteredOpenImLogoutReset = async (): Promise<void> => {
  if (logoutReset) {
    await logoutReset();
    return;
  }
  pendingLogoutReset = true;
};
