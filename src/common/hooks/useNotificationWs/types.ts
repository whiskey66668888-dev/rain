import { EBusinessType, EMsgWeight } from '@/utils/constants/notificationWs';
import { ToastOptions } from '@/common/components/Toast';
import { NavigateWithLanguage } from '../useNavigateWithLanguage';
import { EBetHistoryQueryType } from '@/apis/commonSports/constants';

export interface TRechargeData {
  cashInOrderId: string;
  businessMsg: string;
}

export interface TWinOrderData {
  awayTeamName: string;
  currencyName: string;
  homeTeamName: string;
  orderId: string;
  totalAmount: number;
  webGameId: number;
  winOrLoseStatusString: string;
}

type TBaseMessageFields = {
  forwardUrl: null;
  fromMemberId: null;
  id: string;
  sendTime: string;
  senderIp: string;
  sign: null;
  toMemberId: string;
};

/** 充值相关消息，businessData 是结构化对象 */
export type TRechargeMessage = TBaseMessageFields & {
  businessData: TRechargeData;
  businessInfo: {
    businessType:
      | EBusinessType.RECHARGE_SUBMIT
      | EBusinessType.RECHARGE_SUCCESS
      | EBusinessType.RECHARGE_REFUSED
      | EBusinessType.RECHARGE_CANCELLED
      | EBusinessType.AGENT_RECHARGE_SUCCESS
      | EBusinessType.ARTIFICIAL_RECHARGE_SUBMIT;
    desc: string;
    msgWeight: EMsgWeight;
  };
};

/** 体育注单赢结果推送消息，businessData 是结构化对象 */
export type TSportWinOrderMessage = TBaseMessageFields & {
  businessData: TWinOrderData;
  businessInfo: {
    businessType: EBusinessType.SPORT_WIN_ORDER_PUSH;
    desc: string;
    msgWeight: EMsgWeight;
  };
};

export type TSportCancelOrderMessage = TBaseMessageFields & {
  businessData: TWinOrderData;
  businessInfo: {
    businessType: EBusinessType.SPORT_CANCEL_ORDER_PUSH;
    desc: string;
    msgWeight: EMsgWeight;
  };
};
/** 普通通知消息，businessData 是字符串或 null */
export type TCommonMessage = TBaseMessageFields & {
  businessData: string | null;
  businessInfo: {
    businessType: Exclude<
      EBusinessType,
      | EBusinessType.SPORT_WIN_ORDER_PUSH
      | EBusinessType.RECHARGE_SUBMIT
      | EBusinessType.RECHARGE_SUCCESS
      | EBusinessType.RECHARGE_REFUSED
      | EBusinessType.RECHARGE_CANCELLED
      | EBusinessType.AGENT_RECHARGE_SUCCESS
      | EBusinessType.ARTIFICIAL_RECHARGE_SUBMIT
    >;
    desc: string;
    msgWeight: EMsgWeight;
  };
};

export type TNotificationMessage =
  | TSportWinOrderMessage
  | TCommonMessage
  | TRechargeMessage
  | TSportCancelOrderMessage;

export function isSportWinOrderMessage(m: TNotificationMessage): m is TSportWinOrderMessage {
  return m.businessInfo.businessType === EBusinessType.SPORT_WIN_ORDER_PUSH;
}

export function isSportCancelOrderMessage(m: TNotificationMessage): m is TSportCancelOrderMessage {
  return m.businessInfo.businessType === EBusinessType.SPORT_CANCEL_ORDER_PUSH;
}

export function isRechargeMessage(m: TNotificationMessage): m is TRechargeMessage {
  return [
    EBusinessType.RECHARGE_SUBMIT,
    EBusinessType.RECHARGE_SUCCESS,
    EBusinessType.RECHARGE_REFUSED,
    EBusinessType.RECHARGE_CANCELLED,
    EBusinessType.AGENT_RECHARGE_SUCCESS,
    EBusinessType.ARTIFICIAL_RECHARGE_SUBMIT,
  ].includes(m.businessInfo.businessType);
}

export type TPickResult = {
  msg: TNotificationMessage | null;
  winOrderMsgs: TSportWinOrderMessage[] | null;
};

/** 每种业务类型对应的 handler，构建并返回 ToastOptions，不负责调用 toast() */
export type TMessageHandler = (params: {
  msg: TNotificationMessage;
  winOrderMsgs: TSportWinOrderMessage[] | null;
  navigate: NavigateWithLanguage;
  isMobile?: boolean;
  openBetHistoryWindow?: (queryType?: EBetHistoryQueryType) => void;
}) => ToastOptions;
