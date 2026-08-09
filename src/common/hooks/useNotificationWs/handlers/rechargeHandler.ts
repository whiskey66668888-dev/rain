import { DURATION_MAP, EBusinessType } from '@/utils/constants/notificationWs';
import { PATHS } from '@/sites/op7/routes/paths';
import { TMessageHandler, isRechargeMessage } from '../types';

export const rechargeHandler: TMessageHandler = ({ msg, navigate }) => {
  if (!isRechargeMessage(msg)) return {};

  const duration = DURATION_MAP[msg.businessInfo.msgWeight];
  const isSuccessType = [EBusinessType.RECHARGE_SUBMIT, EBusinessType.RECHARGE_SUCCESS].includes(
    msg.businessInfo.businessType,
  );

  return {
    title: msg.businessInfo.desc,
    description: msg.businessData.businessMsg,
    type: isSuccessType ? 'success' : 'error',
    action: () => navigate(`${PATHS.mineTransactionRecord}?type=deposit`),
    actionLabel: '查看详情',
    duration,
  };
};
