import { EBusinessType } from '@/utils/constants/notificationWs';
import { TMessageHandler } from '../types';
import { sportWinOrderHandler } from './sportWinOrderHandler';
import { rechargeHandler } from './rechargeHandler';
import { defaultHandler } from './defaultHandler';
import { sportCancelOrderHandler } from './sportCancelOrderHandler';

/**
 * 业务类型 → ToastOptions 构建函数注册表
 * 新增业务类型只需在此注册，不需要改核心调度逻辑
 */
const HANDLERS: Partial<Record<EBusinessType, TMessageHandler>> = {
  [EBusinessType.SPORT_WIN_ORDER_PUSH]: sportWinOrderHandler,
  [EBusinessType.SPORT_CANCEL_ORDER_PUSH]: sportCancelOrderHandler,
  [EBusinessType.RECHARGE_SUBMIT]: rechargeHandler,
  [EBusinessType.RECHARGE_SUCCESS]: rechargeHandler,
  [EBusinessType.RECHARGE_REFUSED]: rechargeHandler,
  [EBusinessType.RECHARGE_CANCELLED]: rechargeHandler,
};

export function getHandler(businessType: EBusinessType): TMessageHandler {
  return HANDLERS[businessType] ?? defaultHandler;
}
