import Button from '@/common/components/Button';
import Modal from '@/common/components/Modal';

import { WithdrawItem, WithdrawType } from '@/apis/origin/finance/withdrawal';

import { CurrencyType } from '../constants';
import { calcHandlingFee, formatValue, safeDivide, toFixed } from '../utils';

// 供策略弹窗复用的样式类名映射，避免在策略文件里直接依赖页面实现细节。
export type FeeStrategyStyles = {
  systemMessage: string;
  highlightText: string;
  feeConfirmContent: string;
  modalButtonRow: string;
};

interface SubmitAmountsParams {
  amount: string;
  currencyType: CurrencyType;
  rate: number;
}

interface WhiteListRecommendParams {
  isVirtual: boolean;
  amount: string;
  withdrawList: WithdrawItem[];
}

interface RestrictionModalParams {
  code?: string;
  cashAmount?: number;
  styles: FeeStrategyStyles;
}

interface FeeConfirmModalParams {
  amountValue: number;
  freeAmount: number;
  rateValue: number;
  showVirtualButton: boolean;
  onConfirm: () => void;
  onSwitchVirtual: () => void;
  styles: FeeStrategyStyles;
}

// 统一提现提交时的金额换算，避免页面和策略分支各自重复拼装参数。
export const getSubmitAmounts = ({ amount, currencyType, rate }: SubmitAmountsParams) => {
  const cash =
    currencyType === CurrencyType.cny ? amount : toFixed(Number(amount) * rate).toString();
  const usdtCash =
    currencyType === CurrencyType.cny ? safeDivide(Number(amount), rate).toString() : amount;

  return {
    cash,
    usdtCash,
  };
};

// 判断当前是否应提示“切换 USDT 提现”，这里只做纯条件判断，不直接弹窗。
export const shouldOpenWhiteListRecommend = ({
  isVirtual,
  amount,
  withdrawList,
}: WhiteListRecommendParams) => {
  if (isVirtual) return false;
  if (!withdrawList.some((obj) => obj.code === WithdrawType.virtual)) return false;

  const numericValue = Number(amount) || 0;
  return numericValue > 0;
};

// 统一“系统消息”弹窗，供提现提交异常等场景复用。
export const openSystemMessageModal = ({
  message,
  styles,
}: {
  message: string;
  styles: FeeStrategyStyles;
}) => {
  Modal.open({
    title: '系统消息',
    content: <div className={styles.systemMessage}>{message}</div>,
    confirmText: '我知道了',
  });
};

// 统一处理 6002/6003/6004 这类限制型状态码，命中后直接弹窗并返回 true。
export const openWithdrawRestrictionModal = ({
  code,
  cashAmount = 0,
  styles,
}: RestrictionModalParams) => {
  if (code === '6002') {
    Modal.open({
      title: '温馨提示',
      content: <div className={styles.systemMessage}>虚拟币提现不可用，请使用其他提现</div>,
      confirmText: '确认',
    });
    return true;
  }

  if (code === '6003') {
    Modal.open({
      title: '温馨提示',
      content: (
        <div className={styles.systemMessage}>
          请先完成 <span className={styles.highlightText}>{formatValue(cashAmount)}</span>{' '}
          额度的其他提现方式
        </div>
      ),
      confirmText: '确认',
    });
    return true;
  }

  if (code === '6004') {
    Modal.open({
      title: '温馨提示',
      content: <div className={styles.systemMessage}>请先完成一次实名制银行卡取款</div>,
      confirmText: '确认',
    });
    return true;
  }

  return false;
};

// 统一手续费确认弹窗，避免页面里重复拼装文案、金额和按钮逻辑。
export const openFeeConfirmModal = ({
  amountValue,
  freeAmount,
  rateValue,
  showVirtualButton,
  onConfirm,
  onSwitchVirtual,
  styles,
}: FeeConfirmModalParams) => {
  const fee = calcHandlingFee({
    amount: amountValue,
    feeRate: rateValue,
    feeCash: freeAmount,
  });

  const modal = Modal.open({
    title: '温馨提示',
    content: (
      <div className={styles.feeConfirmContent}>
        <p>• 存虚拟币取数字币或法币收取手续费；</p>
        <p>
          • 超出免费额度的部分，收取 <span className={styles.highlightText}>{rateValue}%</span>{' '}
          的手续费；当前免费额度
          <span className={styles.highlightText}>{formatValue(freeAmount)}</span>；
        </p>
        <p>
          • 本次提现<span className={styles.highlightText}>{formatValue(amountValue)}</span>
          ，需要收取手续费
          <span className={styles.highlightText}>{formatValue(fee)}</span>元，手续费 = （
          <span className={styles.highlightText}>{formatValue(amountValue)}</span>-
          <span className={styles.highlightText}>{formatValue(freeAmount)}</span>）x
          <span className={styles.highlightText}>{rateValue}%</span>=
          <span className={styles.highlightText}>{formatValue(fee)}</span>。
        </p>
      </div>
    ),
    footer: (
      <div className={styles.modalButtonRow}>
        <Button
          type="second"
          onClick={() => {
            modal.close();
            if (showVirtualButton) {
              onSwitchVirtual();
            }
          }}
          style={{ flex: 1 }}
        >
          {showVirtualButton ? '虚拟币提现' : '取消'}
        </Button>
        <Button
          type="primary"
          style={{ flex: 1 }}
          onClick={() => {
            modal.close();
            onConfirm();
          }}
        >
          确认
        </Button>
      </div>
    ),
  });
};
