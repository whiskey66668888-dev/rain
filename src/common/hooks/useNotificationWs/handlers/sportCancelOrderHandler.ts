import { DURATION_MAP } from '@/utils/constants/notificationWs';
import { TMessageHandler, isSportCancelOrderMessage } from '../types';
import { PATHS } from '@/sites/op7/routes/paths';
import { EBetHistoryQueryType } from '@/apis/commonSports/constants';

export const sportCancelOrderHandler: TMessageHandler = ({
  msg,
  navigate,
  isMobile,
  openBetHistoryWindow,
}) => {
  if (!isSportCancelOrderMessage(msg)) return {};

  const duration = DURATION_MAP[msg.businessInfo.msgWeight];

  return {
    title: '投注取消',
    description: `${msg.businessData.homeTeamName} vs ${msg.businessData.awayTeamName}`,
    type: 'error',
    action: () => {
      if (isMobile) {
        navigate(`${PATHS.betHistoryH5}?queryType=${EBetHistoryQueryType.SETTLED}`);
      } else {
        openBetHistoryWindow?.(EBetHistoryQueryType.SETTLED);
      }
    },
    actionLabel: '查看详情',
    duration,
  };
};
