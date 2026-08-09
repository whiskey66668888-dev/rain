import { DURATION_MAP } from '@/utils/constants/notificationWs';
import { PATHS } from '@/sites/op7/routes/paths';
import { TMessageHandler, isSportWinOrderMessage } from '../types';
import bigMath from '@/utils/bet/bigMath';

export const sportWinOrderHandler: TMessageHandler = ({ msg, winOrderMsgs, navigate }) => {
  if (!isSportWinOrderMessage(msg)) return {};

  const duration = DURATION_MAP[msg.businessInfo.msgWeight];

  if (winOrderMsgs && winOrderMsgs.length > 1) {
    const total = winOrderMsgs.reduce((sum, m) => sum + m.businessData.totalAmount, 0);
    const totalString = bigMath.decimals(total, { padZero: true });
    return {
      title: `投注赢 ${totalString}元`,
      description: `${winOrderMsgs.length}笔投注结算为赢`,
      type: 'success',
      action: () => navigate(`${PATHS.allBettingRecord}`),
      actionLabel: '查看详情',
      duration,
    };
  }

  return {
    title: `投注赢 ${msg.businessData.totalAmount}元`,
    description: `${msg.businessData.homeTeamName} vs ${msg.businessData.awayTeamName}`,
    type: 'success',
    action: () => navigate(`${PATHS.allBettingRecord}`),
    actionLabel: '查看详情',
    duration,
  };
};
