import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';

import {
  ChannelItemV2,
  PayItemV2,
  doDepositV2,
  getUsdtRateV2,
  useDepositGroupV2Query,
} from '@/apis/origin/finance/depositV2';
import Button from '@/common/components/Button';
import Modal from '@/common/components/Modal';
import Skeleton from '@/common/components/Skeleton';
import { toast } from '@/common/components/Toast';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { useAppSelector } from '@/core/store/hooks';
import RealNameModal from '@/sites/op7/pages/MinePage/ProfilePage/components/RealNameModal';
import { PATHS } from '@/sites/op7/routes/paths';
import { API_CODE_ORIGIN_SUCCESS } from '@/utils/constants/apiCodeOrigin';

import ActivityList from './components/activityList';
import AmountSection from './components/amountSection';
import ChannelSection from './components/channelSection';
import DepositCategory from './components/depositCategory';
import EmptyDeposit from './components/emptyDeposit';
import TutorialEntry from './components/tutorialEntry';
import TipList from './components/tipList';
import { formatMoney, getDefaultGroupId, isCnyGroup, isUsdtGroup } from './utils';

import styles from './index.module.scss';

interface DepositV2Props {
  code?: string;
  inModal?: boolean;
}

const formatLockRemain = (seconds: number): string => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, '0');
  const restSeconds = (safeSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${restSeconds}`;
};

const DepositV2: React.FC<DepositV2Props> = ({ code, inModal = false }) => {
  const navigate = useNavigateWithLanguage();
  const winRef = useRef<Window | null>(null);
  const lastSubmitAtRef = useRef(0);
  const isUsdtRateRefreshingRef = useRef(false);
  const [activeGroupId, setActiveGroupId] = useState(-1);
  const [channelIndex, setChannelIndex] = useState(0);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [realNameVisible, setRealNameVisible] = useState(false);
  const [usdtRate, setUsdtRate] = useState('7.3');
  const [isUsdtRateRefreshing, setIsUsdtRateRefreshing] = useState(false);
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = screenBreakpoint === 'md';
  const { realName } = useAppSelector((state) => state.user.memberInfo);

  const { data = [], isFetching, refetch } = useDepositGroupV2Query();
  const payList = data;

  useEffect(() => {
    if (payList.length === 0) return;
    setActiveGroupId((current) => {
      if (current !== -1 && payList.some((item) => item.groupId === current)) return current;
      return getDefaultGroupId(payList, code);
    });
  }, [code, payList]);

  const refreshUsdtRate = useCallback(async () => {
    if (isUsdtRateRefreshingRef.current) return;

    isUsdtRateRefreshingRef.current = true;
    setIsUsdtRateRefreshing(true);
    try {
      const res = await getUsdtRateV2();
      if (res.data.buyRate) setUsdtRate(res.data.buyRate);
    } catch {
      // Keep the current rate when refreshing fails.
    } finally {
      isUsdtRateRefreshingRef.current = false;
      setIsUsdtRateRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void refreshUsdtRate();
  }, [refreshUsdtRate]);

  const activeItem = useMemo(() => {
    return payList.find((item) => item.groupId === activeGroupId);
  }, [activeGroupId, payList]);

  const channelList = activeItem?.channelList ?? [];
  const channelItem = channelList[channelIndex] ?? channelList[0];

  useEffect(() => {
    setChannelIndex(0);
    setAmount('');
  }, [activeGroupId]);

  const footerText = useMemo(() => {
    if (!channelItem) return { label: '', isError: false };
    const min = formatMoney(channelItem.minAmount);
    const max = formatMoney(channelItem.maxAmount);
    if (!amount) return { label: `单笔限额 ${min}~${max}`, isError: false };
    const value = Number(amount);
    const isError = value < channelItem.minAmount || value > channelItem.maxAmount;
    return {
      label: isError ? `输入￥${min}~${max}有效金额` : `单笔限额 ${min}~${max}`,
      isError,
    };
  }, [amount, channelItem]);

  const disabled = useMemo(() => {
    if (!channelItem || !amount || submitting) return true;
    const value = Number(amount);
    return (
      !Number.isFinite(value) || value < channelItem.minAmount || value > channelItem.maxAmount
    );
  }, [amount, channelItem, submitting]);

  const usdtNum = useMemo(() => {
    if (!amount) return '';
    const rate = Number(usdtRate);
    if (!Number.isFinite(rate) || rate <= 0) return '';
    return (Number(amount) / rate).toFixed(2);
  }, [amount, usdtRate]);

  const openRealNameConfirm = useCallback(() => {
    const modal = Modal.open({
      title: '安全提示',
      content: (
        <div className={styles.realNameConfirmContent}>
          <p>为了您的账号安全，请您完成实名认证。</p>
        </div>
      ),
      footer: (
        <div className={styles.confirmFooter}>
          <Button type="second" className={styles.confirmButton} onClick={() => modal.close()}>
            取消
          </Button>
          <Button
            type="primary"
            className={styles.confirmButton}
            onClick={() => {
              modal.close();
              setRealNameVisible(true);
            }}
          >
            前往
          </Button>
        </div>
      ),
    });
  }, []);

  const onChangeCategory = useCallback(
    (item: PayItemV2) => {
      if (item.groupId === activeGroupId) return;
      if (isCnyGroup(item.code) && !realName) {
        openRealNameConfirm();
        return;
      }
      setActiveGroupId(item.groupId);
    },
    [activeGroupId, openRealNameConfirm, realName],
  );

  // const openPaymentConfirm = useCallback(
  //   (orderId?: string) => {
  //     const modal = Modal.open({
  //       title: '支付确认',
  //       content: (
  //         <div className={styles.confirmContent}>
  //           <p>请在完成支付后确认结果。</p>
  //         </div>
  //       ),
  //       footer: (
  //         <div className={styles.confirmFooter}>
  //           <Button
  //             type="second"
  //             className={styles.confirmButton}
  //             onClick={() => {
  //               modal.close();
  //             }}
  //           >
  //             更换其他支付
  //           </Button>
  //           <Button
  //             className={styles.confirmButton}
  //             onClick={() => {
  //               modal.close();
  //               navigate(
  //                 orderId
  //                   ? `${PATHS.mineTransactionRecord}?type=1&orderId=${orderId}`
  //                   : `${PATHS.mineTransactionRecord}?type=1`,
  //               );
  //             }}
  //           >
  //             我已完成支付
  //           </Button>
  //         </div>
  //       ),
  //       maskClickClose: false,
  //     });
  //   },
  //   [navigate],
  // );

  const submit = useCallback(async () => {
    if (!channelItem || disabled) return;
    const now = Date.now();
    if (now - lastSubmitAtRef.current < 5000) {
      toast({ type: 'info', title: '操作过于频繁!' });
      return;
    }
    lastSubmitAtRef.current = now;

    if (channelItem.isLock === 1) {
      toast({
        type: 'warning',
        title: '充值通道已锁定',
        description: channelItem.lockTime ? `请 ${channelItem.lockTime} 秒后再试` : undefined,
      });
      return;
    }

    if (channelItem.needRealName && !channelItem.hasRealName && !realName) {
      openRealNameConfirm();
      return;
    }

    setSubmitting(true);
    const useIframePayPage = isMobile && !inModal;
    try {
      if (!useIframePayPage) {
        winRef.current = window.open('about:blank', '_blank');
      }
      const res = await doDepositV2({
        groupId: channelItem.groupId,
        cash: amount,
        num: isUsdtGroup(activeItem?.code ?? '') ? usdtNum : '',
        rate: isUsdtGroup(activeItem?.code ?? '') ? usdtRate : '',
      });

      if (res.code === API_CODE_ORIGIN_SUCCESS) {
        setAmount('');
        const result = res.data;
        if (result.url) {
          if (useIframePayPage) {
            navigate(PATHS.mineDepositPay, { state: { url: result.url } });
          } else if (winRef.current) {
            winRef.current.location.href = result.url;
          }
          // window.setTimeout(() => openPaymentConfirm(result.orderId), 3000);
          return;
        }
        if (winRef.current) winRef.current.close();
        if (result.payqrcode || result.virtualAddress) {
          Modal.open({
            title: '充值信息',
            content: (
              <div className={styles.resultInfo}>
                {result.payqrcode ? <img src={result.payqrcode} alt="充值二维码" /> : null}
                {result.virtualAddress ? <p>{result.virtualAddress}</p> : null}
                {result.virtualNum ? <p>数量：{result.virtualNum}</p> : null}
              </div>
            ),
            confirmText: '我知道了',
            onConfirm: () => {},
          });
          return;
        }
        toast({ type: 'success', title: '充值订单已提交' });
        return;
      }
      if (winRef.current) winRef.current.close();
    } catch {
      if (winRef.current) winRef.current.close();
    } finally {
      setSubmitting(false);
    }
  }, [
    activeItem?.code,
    amount,
    channelItem,
    disabled,
    inModal,
    isMobile,
    navigate,
    openRealNameConfirm,
    // openPaymentConfirm,
    realName,
    usdtNum,
    usdtRate,
  ]);

  const refresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const onChangeChannel = useCallback(
    (index: number, item: ChannelItemV2) => {
      if (item.isLock === 1 && item.lockTime > 0) {
        Modal.open({
          title: '充值通道已锁定',
          content: (
            <div className={styles.confirmContent}>
              <p>
                {item.name}锁定中，请 {formatLockRemain(item.lockTime)} 后再试
              </p>
            </div>
          ),
          confirmText: '我知道了',
          onConfirm: () => {},
        });
        return;
      }

      if (item.needRealName && !item.hasRealName && !realName) {
        openRealNameConfirm();
        return;
      }

      setChannelIndex(index);
      setAmount('');
    },
    [openRealNameConfirm, realName],
  );

  if (isFetching && payList.length === 0) {
    return (
      <div
        className={clsx(
          styles.deposit,
          inModal ? styles.inModal : '',
          !inModal ? styles.autoPC : '',
        )}
      >
        <div className={styles.main}>
          <Skeleton type="depositMainList" />
        </div>
      </div>
    );
  }

  if (!activeItem || !channelItem) {
    return <EmptyDeposit onRefresh={refresh} />;
  }

  const isUsdt = isUsdtGroup(activeItem.code);
  const showTutorial = channelItem.channelTutorialOpen === 1 && !!channelItem.helpId;
  const tutorialNode = showTutorial ? <TutorialEntry channelItem={channelItem} /> : null;

  return (
    <>
      <div
        className={clsx(
          styles.deposit,
          inModal ? styles.inModal : '',
          !inModal ? styles.autoPC : '',
        )}
      >
        <div className={styles.main}>
          <DepositCategory
            list={payList}
            activeGroupId={activeGroupId}
            onChange={onChangeCategory}
          />

          <ChannelSection
            list={channelList}
            activeIndex={channelIndex}
            inModal={inModal}
            onChange={onChangeChannel}
          />

          {!isUsdt ? tutorialNode : null}

          {isUsdt ? (
            <ActivityList list={activeItem.activeList} tutorial={tutorialNode} carousel />
          ) : null}

          <AmountSection
            channelItem={channelItem}
            amount={amount}
            footerText={footerText}
            isUsdt={isUsdt}
            usdtRate={usdtRate}
            usdtNum={usdtNum}
            isUsdtRateRefreshing={isUsdtRateRefreshing}
            inModal={inModal}
            onAmountChange={setAmount}
            onRefreshUsdtRate={refreshUsdtRate}
          />

          {!isUsdt ? <ActivityList list={activeItem.activeList} /> : null}

          <TipList text={channelItem.info} />
        </div>

        <div className={styles.submitBar}>
          <Button
            className={styles.submitButton}
            disabled={disabled}
            loading={submitting}
            onClick={() => void submit()}
          >
            立即充值
          </Button>
        </div>
      </div>

      <RealNameModal visible={realNameVisible} onClose={() => setRealNameVisible(false)} />
    </>
  );
};

export default DepositV2;
