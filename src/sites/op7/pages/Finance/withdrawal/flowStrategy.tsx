import Button from '@/common/components/Button';
import Modal from '@/common/components/Modal';

export type FlowStrategyStyles = {
  systemMessage: string;
  highlightText: string;
  modalButtonRow: string;
  flowCheckContent: string;
  flowCheckMessage: string;
  flowCheckTipTitle: string;
  flowCheckTipList: string;
};

export interface WithdrawFlowCheckResponse {
  code: string;
  remainCash: number;
  message: string;
}

interface FlowCheckInterceptParams {
  result: WithdrawFlowCheckResponse;
  styles: FlowStrategyStyles;
}

const RECENT_FLOW_CHECK_REQUESTS: number[] = [];

const FLOW_CHECK_TEXT = {
  tooFrequent: '操作频繁，请稍后再试',
  loginExpired: '登录超时',
  checkFailed: '校验失败，请稍后再试',
  busy: '由于您近期有新的变动，系统正在重新计算，请在1-2分钟后重试。',
};

export const canRequestWithdrawFlowCheck = () => {
  const now = Date.now();

  while (RECENT_FLOW_CHECK_REQUESTS.length > 0) {
    const earliestRequestAt = RECENT_FLOW_CHECK_REQUESTS[0];
    if (earliestRequestAt === undefined || now - earliestRequestAt < 10 * 1000) {
      break;
    }
    RECENT_FLOW_CHECK_REQUESTS.shift();
  }

  const lastRequestAt = RECENT_FLOW_CHECK_REQUESTS[RECENT_FLOW_CHECK_REQUESTS.length - 1];
  if (lastRequestAt && now - lastRequestAt < 3 * 1000) {
    return false;
  }

  return RECENT_FLOW_CHECK_REQUESTS.length < 3;
};

export const recordWithdrawFlowCheckRequest = () => {
  RECENT_FLOW_CHECK_REQUESTS.push(Date.now());
};

export const getWithdrawFlowCheckErrorMessage = (result: WithdrawFlowCheckResponse) => {
  if (result.code === '6102') return result.message || FLOW_CHECK_TEXT.tooFrequent;
  if (result.code === '9000') return result.message || FLOW_CHECK_TEXT.loginExpired;
  return result.message || FLOW_CHECK_TEXT.checkFailed;
};

export const openFlowCheckBusyModal = (styles: FlowStrategyStyles) => {
  const modal = Modal.open({
    title: '有效流水不足',
    showCloseButton: false,
    content: <div className={styles.systemMessage}>{FLOW_CHECK_TEXT.busy}</div>,
    // confirmText: '我知道了',
    footer: (
      <div className={styles.modalButtonRow}>
        <Button
          type="primary"
          style={{ flex: 1 }}
          onClick={() => {
            modal.close();
          }}
        >
          我知道了
        </Button>
      </div>
    ),
  });
};

export const openFlowCheckInsufficientModal = ({
  remainCash,
  styles,
}: {
  remainCash: number;
  styles: FlowStrategyStyles;
}) => {
  const formattedRemainCash = remainCash.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const modal = Modal.open({
    title: '有效流水不足',
    showCloseButton: false,
    content: (
      <div className={styles.flowCheckContent}>
        <div className={styles.flowCheckMessage}>
          您暂未满足提现条件，还需完成{' '}
          <span className={styles.highlightText}>¥{formattedRemainCash}</span> 有效投注
        </div>
        <div className={styles.flowCheckTipTitle}>提示：不同场馆投注数据存在结算延迟</div>
        <div className={styles.flowCheckTipList}>• 体育/电竞约15-20分钟</div>
        <div className={styles.flowCheckTipList}>• 真人/彩票/电子/棋牌约5-10分钟</div>
      </div>
    ),
    footer: (
      <div className={styles.modalButtonRow}>
        <Button
          type="primary"
          style={{ flex: 1 }}
          onClick={() => {
            modal.close();
          }}
        >
          我知道了
        </Button>
      </div>
    ),
  });
};

export const interceptWithdrawFlowCheck = ({ result, styles }: FlowCheckInterceptParams) => {
  if (result.code === '0000') return false;

  if (result.code === '6101') {
    openFlowCheckInsufficientModal({
      remainCash: result.remainCash,
      styles,
    });
    return true;
  }

  if (result.code === '6103') {
    openFlowCheckBusyModal(styles);
    return true;
  }

  return true;
};
