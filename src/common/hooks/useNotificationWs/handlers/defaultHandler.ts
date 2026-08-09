import { DURATION_MAP, EBusinessType } from '@/utils/constants/notificationWs';
import { PATHS } from '@/sites/op7/routes/paths';
import { TMessageHandler } from '../types';
import { ToastOptions } from '@/common/components/Toast';

export const defaultHandler: TMessageHandler = ({ msg, navigate }) => {
  if (typeof msg.businessData !== 'string') return {};
  const duration = DURATION_MAP[msg.businessInfo.msgWeight];

  const options: ToastOptions = {
    title: msg.businessInfo.desc,
    description: msg.businessData,
    duration,
  };

  switch (msg.businessInfo.businessType) {
    case EBusinessType.UPDATE_TO_RISK_MEMBER:
    case EBusinessType.VENUE_MAINTENANCE_PREVIEW:
      options.type = 'warning';
      break;

    case EBusinessType.FREEZE_ACCOUNT:
    case EBusinessType.WITHDRAWAL_REFUSED:
    case EBusinessType.WITHDRAWAL_CANCELLED:
    case EBusinessType.BONUS_DISTRIBUTE_REFUSED:
    case EBusinessType.MEMBER_TRANSFER_REFUSED:
      options.type = 'error';
      break;

    default:
      options.type = 'success';
      break;
  }

  switch (msg.businessInfo.businessType) {
    case EBusinessType.VIP_LEVEL_CHANGE:
    case EBusinessType.VIP_UPDATE_SUCCESS:
      options.action = () => navigate(PATHS.vipCenter);
      options.actionLabel = '查看详情';
      break;

    case EBusinessType.WITHDRAWAL_REFUSED:
    case EBusinessType.WITHDRAWAL_SUCCESS:
    case EBusinessType.WITHDRAWAL_CANCELLED:
    case EBusinessType.WITHDRAWAL_SUBMIT:
      options.action = () => navigate(`${PATHS.mineTransactionRecord}?type=withdraw`);
      options.actionLabel = '查看详情';
      break;

    case EBusinessType.BONUS_DISTRIBUTE_REFUSED:
    case EBusinessType.BONUS_DISTRIBUTE_SUCCESS:
      options.action = () => navigate(`${PATHS.mineTransactionRecord}?type=bonus`);
      options.actionLabel = '查看详情';
      break;

    case EBusinessType.MEMBER_TRANSFER_REFUSED:
    case EBusinessType.MEMBER_TRANSFER_SUCCESS:
      options.action = () => navigate(`${PATHS.mineTransactionRecord}?type=transfer`);
      options.actionLabel = '查看详情';
      break;

    default:
      break;
  }

  return options;
};
