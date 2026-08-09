/**
 * z-index 分层管理
 * - 仅在此文件修改数值，全局统一引用
 * - 每层间隔 100，中间可插 10～90（如 1010、1020）应对同层内细分
 */

export const zIndexMap = {
  globalOverlay: 100,
  globalToast: 9999,
  betPopup: 1000,
  betFloatingButton: 980,
  loginModal: 1000,
  registerModal: 1000,
  otherDeviceKickModal: 1005,
  customerServiceModal: 1010,
  ownCaptcha: 2000,
  globalLoading: 3000, // 全屏 loading：盖住弹窗/验证码，但要低于 toast 以便报错可见
  bottomMenu: 21,
  homeSearch: 23, // 要比header 高
  sportSettingModal: 101,
  header: 22,
  rightSidebar: 100,
  avatarUpdate: 23,
  walletModal: 30, // 钱包快捷弹框
  walletSubModal: 31, // 钱包其他弹框 必须比钱包快捷弹框大
  betHistoryPopover: 99, // 注单历史修改注单/提前结算 Popover
} as const;

/** 需暴露为 CSS 变量（--z-*）的层级，供 Uno preflights 与样式中 var(--z-*) 使用 */
export const zIndexCssVars = {
  '--z-global-toast': zIndexMap.globalToast,
  '--z-bottom-menu': zIndexMap.bottomMenu,
  '--z-header': zIndexMap.header,
  '--z-right-sidebar': zIndexMap.rightSidebar,
  '--z-bet-history-popover': zIndexMap.betHistoryPopover,
} as const;

/** 生成写入 :root 的声明块供 uno.config preflights 引用 */
export function getZIndexCssVarsRootDeclarations(): string {
  return Object.entries(zIndexCssVars)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');
}
