import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import clsx from 'clsx';
// components
import Button from '@/common/components/Button';
import CardAddress from './components/cardAddress';
import Tutorial from '../components/tutorial';
import AmountForm from './components/amountForm';
import WithdrawCostTip from './components/withdrawCostTip';
import WithdrawTip from './components/withdrawTip';
// import LazyImage from '@/common/components/LazyImage';
import PasswordModal from './components/passwordModal';
import Skeleton from '@/common/components/Skeleton';
import RiskBankModal from './components/riskBankModal';
import { toast } from '@/common/components/Toast';
import Modal from '@/common/components/Modal';
import PickerModal from '@/sites/op7/components/PickerModal';
import { PickerColumnItem, PickerValue } from 'antd-mobile/es/components/picker-view';
import RealNameModal from '../../MinePage/ProfilePage/components/RealNameModal';
import AccountManagementModal from '@/sites/op7/components/AccountManagementModal';
import WalletChannelIcon, {
  type WalletChannelIconType,
} from '@/sites/op7/components/WalletChannelIcon';
import { BankAccountType } from '@/utils/constants/money';
import { BindAccountType } from '@/utils/constants/account';
import { withdrawAllReq } from '@/apis/origin/wallet/withdrawAll';
import { useGetMemberInfo } from '@/common/hooks/useMemberInfo';

// hooks
import {
  useWithdrawalChannelQuery,
  useWhiteListQuery,
  useWithdrawRateQuery,
  WithdrawItem,
  AccountItem,
  WithdrawType,
  doWithdrawal,
  getWithdrawFee,
  checkWithdrawFee,
  checkWhiteList,
  checkWithdrawFlow,
} from '@/apis/origin/finance/withdrawal';
import { useAppSelector } from '@/core/store/hooks';
import { useRiskBank } from './hooks/useRiskBank';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';
import useAccountBind from '@/sites/op7/hooks/useAccountBind';
import { ResponseError } from '@/core/sdk/request/model';

import { safeDivide, formatValue, calcHandlingFee, getWithdrawFeeType } from '../utils';
import {
  getSubmitAmounts,
  openFeeConfirmModal,
  openSystemMessageModal,
  openWithdrawRestrictionModal,
  shouldOpenWhiteListRecommend,
  type FeeStrategyStyles,
} from './feeStrategy';
import {
  canRequestWithdrawFlowCheck,
  getWithdrawFlowCheckErrorMessage,
  interceptWithdrawFlowCheck,
  recordWithdrawFlowCheckRequest,
  type FlowStrategyStyles,
} from './flowStrategy';
// constants
import { CurrencyType } from '../constants';

// styles
import styles from './index.module.scss';
import { ETransRecordType } from '@/apis/commonSports/constants';
/**
 * 钱包 取款
 */
const Withdrawal: React.FC<{ inModal?: boolean; onCloseModal?: () => void }> = ({
  inModal = false,
  onCloseModal,
}) => {
  const navigate = useNavigateWithLanguage();
  const [withdrawalTypeIdx, setWithdrawalTypeIdx] = useState(0);
  const [accountIdx, setAccountIdx] = useState(0);
  const [amount, setAmount] = useState('');
  const [currencyType, setCurrencyType] = useState(CurrencyType.cny);
  const [pwdVisible, setPwdVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feeCode, setFeeCode] = useState('0000');
  const [feeCash, setFeeCash] = useState(0);
  const [feeRate, setFeeRate] = useState(0);
  const [handlingFee, setHandlingFee] = useState(0);
  const [safeBankPickerVisible, setSafeBankPickerVisible] = useState(false);
  const [realNameVisible, setRealNameVisible] = useState(false);
  const [accountShowType, setAccontShowType] = useState<BankAccountType | null>(null);
  const autoRecycleTriggeredRef = useRef(false);
  const feeStrategyStyles = styles as unknown as FeeStrategyStyles;
  const flowStrategyStyles = styles as unknown as FlowStrategyStyles;
  // 绑定账户类型
  const { open, BindAccountModals } = useAccountBind();

  const getWithdrawIconType = (code: WithdrawType): WalletChannelIconType => {
    switch (code) {
      case WithdrawType.bank:
        return 'bank';
      case WithdrawType.virtual:
        return 'virtual';
      case WithdrawType.digital:
        return 'digital';
      case WithdrawType.zfb:
        return 'zfb';
    }
  };

  // 用户信息
  const {
    realName,
    money: balance,
    autoCashMode,
  } = useAppSelector((state) => state.user.memberInfo);
  const { getMemberInfo } = useGetMemberInfo();
  const { data, isFetching, refetch: updateWithdrawalChannel } = useWithdrawalChannelQuery();
  const { data: whiteList, refetch: updateWhiteList } = useWhiteListQuery();
  const {
    data: withdrawRate,
    refetch: updateRate,
    isFetching: rateLoading,
  } = useWithdrawRateQuery();

  // 风险银行hooks
  const {
    isRiskBank,
    riskVisible,
    showRiskModal,
    hideRiskModal,
    riskContent1,
    riskContent2,
    riskTipTime,
    getSafeBankList,
  } = useRiskBank();

  const withdrawList = useMemo(() => {
    return data?.withdrawList ?? [];
  }, [data]);

  const canWithdrawVirtual = useMemo(() => {
    return data?.canWithdrawVirtual ?? false;
  }, [data]);

  // 汇率
  const rate = useMemo(() => {
    return withdrawRate?.sellRate ?? 1;
  }, [withdrawRate]);

  // 是否使用usdt输入
  const isUSDT = useMemo(() => currencyType === CurrencyType.usdt, [currencyType]);

  // 当前支付渠道
  const curWithdrawalItem: WithdrawItem = useMemo(() => {
    return withdrawList[withdrawalTypeIdx] ?? ({} as WithdrawItem);
  }, [withdrawalTypeIdx, withdrawList]);
  const withdrawFeeType = useMemo(
    () => getWithdrawFeeType(curWithdrawalItem.code),
    [curWithdrawalItem.code],
  );

  const isVirtual = useMemo(
    () => curWithdrawalItem.code === WithdrawType.virtual,
    [curWithdrawalItem],
  );

  const accountItem = useMemo(() => {
    const accountList = curWithdrawalItem?.accountList ?? [];
    if (accountList.length == 0) return {} as AccountItem;

    return accountList[accountIdx] ?? ({} as AccountItem);
  }, [curWithdrawalItem, accountIdx]);

  const maxValue = useMemo(() => {
    const maxCash = curWithdrawalItem.maxCash ? Number(curWithdrawalItem.maxCash) : 0;
    if (isUSDT) return safeDivide(maxCash, rate);
    return maxCash;
  }, [curWithdrawalItem, isUSDT, rate]);

  const minValue = useMemo(() => {
    const minCash = curWithdrawalItem.minCash ? Number(curWithdrawalItem.minCash) : 0;
    if (isUSDT) return safeDivide(minCash, rate);
    return minCash;
  }, [curWithdrawalItem, isUSDT, rate]);

  // 安全银行列表
  const safeAccountList = useMemo(() => {
    return getSafeBankList(curWithdrawalItem.accountList ?? []);
  }, [curWithdrawalItem, getSafeBankList]);

  // 安全银行Picker数据
  const safeBankOption = useMemo(() => {
    return [safeAccountList.map((obj) => ({ label: obj.name, value: obj.id }))];
  }, [safeAccountList]);

  // 渠道变更重置币种
  useEffect(() => {
    setCurrencyType(CurrencyType.cny);
  }, [withdrawalTypeIdx]);

  useEffect(() => {
    let cancelled = false;

    const loadWithdrawFee = async () => {
      // 虚拟币页面 Day 1 不展示手续费，因此不预拉 fee/get。
      if (!curWithdrawalItem.code || curWithdrawalItem.code === WithdrawType.virtual) {
        if (!cancelled) {
          setFeeCode('0000');
          setFeeCash(0);
          setFeeRate(0);
          setHandlingFee(0);
        }
        return;
      }

      const result = await getWithdrawFee(getWithdrawFeeType(curWithdrawalItem.code));
      if (cancelled) return;

      setFeeCode(result.code);
      setFeeCash(result.cash);
      setFeeRate(result.rate);
    };

    loadWithdrawFee();

    return () => {
      cancelled = true;
    };
  }, [curWithdrawalItem.code]);

  useEffect(() => {
    const numericValue = Number(amount) || 0;
    // 虚拟币页面不展示手续费，只保留汇率与预计到账换算。
    if (!numericValue || curWithdrawalItem.code === WithdrawType.virtual) {
      setHandlingFee(0);
      return;
    }

    // USDT 输入模式下，手续费仍然按人民币等值金额计算。
    const amountInCny = isUSDT ? numericValue * rate : numericValue;
    setHandlingFee(
      calcHandlingFee({
        amount: amountInCny,
        feeRate,
        feeCash,
        feeCode,
      }),
    );
  }, [amount, isUSDT, rate, feeRate, feeCash, feeCode, curWithdrawalItem.code]);

  const onChangeWithdrawalTypeIdx = async (index: number) => {
    const nextItem = withdrawList[index];
    if (!nextItem) return;

    if (nextItem.code === WithdrawType.virtual) {
      const checkRes = await checkWithdrawFee(2);
      if (checkRes.code === '9999') {
        toast({ type: 'warning', description: '操作失败，请重试' });
        return;
      }
      if (handleWithdrawRestriction(checkRes.code, checkRes.cash)) {
        return;
      }
    }

    setWithdrawalTypeIdx(index);
    setAccountIdx(0);
  };

  const onChangeCurrency = (type: CurrencyType) => {
    setCurrencyType(type);
    setAmount('');
  };

  // 更新汇率
  const onUpdateRate = () => {
    updateRate();
  };

  const handleWithdrawRestriction = (code?: string, cashAmount: number = 0) => {
    return openWithdrawRestrictionModal({
      code,
      cashAmount,
      styles: feeStrategyStyles,
    });
  };

  const switchToVirtualWithdrawal = async () => {
    const index = withdrawList.findIndex((obj) => obj.code === WithdrawType.virtual);
    if (index < 0) return;

    const checkRes = await checkWithdrawFee(2);
    if (checkRes.code === '9999') {
      toast({ type: 'warning', description: '操作失败，请重试' });
      return;
    }
    if (handleWithdrawRestriction(checkRes.code, checkRes.cash)) {
      return;
    }

    setWithdrawalTypeIdx(index);
    setAccountIdx(0);
  };

  const maybeOpenWhiteListModal = async () => {
    if (
      !shouldOpenWhiteListRecommend({
        isVirtual,
        amount,
        withdrawList,
      })
    ) {
      return false;
    }

    try {
      const res = await checkWhiteList(
        getSubmitAmounts({
          amount,
          currencyType,
          rate,
        }).cash,
      );
      if (res?.data?.suggestToUsdt) {
        openWhiteListModal();
        return true;
      }
    } catch {
      return false;
    }

    return false;
  };

  const isWithdrawLimitError = (message: string) => {
    return message.startsWith('今日提款次数已达上限') || message.startsWith('今日提款金额已达上限');
  };

  const processWithdrawal = async ({ skipRiskBank = false }: { skipRiskBank?: boolean } = {}) => {
    if (vaildErrorMsg) {
      if (isWithdrawLimitError(vaildErrorMsg) && (await maybeOpenWhiteListModal())) {
        return;
      }

      toast({
        description: vaildErrorMsg,
        type: 'warning',
      });
      return;
    }

    if (isVirtual && !canWithdrawVirtual) {
      openWithdrawVirtualModal();
      return;
    }

    if (!skipRiskBank && isRiskBank(accountItem)) {
      showRiskModal(accountItem.id);
      return;
    }

    if (await maybeOpenWhiteListModal()) {
      return;
    }

    if (!canRequestWithdrawFlowCheck()) {
      toast({ type: 'warning', description: '操作频繁，请稍后再试' });
      return;
    }

    const flowCheckRes = await checkWithdrawFlow();
    recordWithdrawFlowCheckRequest();
    const flowCode = String(flowCheckRes.code);

    if (interceptWithdrawFlowCheck({ result: flowCheckRes, styles: flowStrategyStyles })) {
      const shouldToastFlowError = flowCode !== '6101' && flowCode !== '6103';
      if (shouldToastFlowError) {
        toast({
          type: 'warning',
          description: getWithdrawFlowCheckErrorMessage(flowCheckRes),
        });
      }
      return;
    }

    const feeCheckRes = await checkWithdrawFee(withdrawFeeType);
    if (feeCheckRes.code === '9999') {
      toast({ type: 'warning', description: '操作失败，请重试' });
      return;
    }
    if (handleWithdrawRestriction(feeCheckRes.code, feeCheckRes.cash)) {
      return;
    }

    if (feeCheckRes.code === '6000' || feeCheckRes.code === '6001') {
      const feeConfig = await getWithdrawFee(withdrawFeeType);
      const { cash } = getSubmitAmounts({
        amount,
        currencyType,
        rate,
      });

      openFeeConfirmModal({
        amountValue: Number(cash) || 0,
        freeAmount: feeConfig.cash > 0 ? feeConfig.cash : feeCheckRes.cash,
        rateValue: feeConfig.rate > 0 ? feeConfig.rate : feeCheckRes.rate,
        showVirtualButton:
          feeCheckRes.code === '6000' &&
          !isVirtual &&
          withdrawList.some((obj) => obj.code === WithdrawType.virtual),
        onConfirm: () => {
          setPwdVisible(true);
        },
        onSwitchVirtual: () => {
          void switchToVirtualWithdrawal();
        },
        styles: feeStrategyStyles,
      });
      return;
    }

    setPwdVisible(true);
  };

  // 渲染safebank picker item
  const renderPickerLabel = (item: PickerColumnItem) => {
    const account = safeAccountList.find((obj) => obj.id == item.value);
    return (
      <div className={styles.pickerRowItem}>
        <img src={account?.cardLogo} />
        <span>{account?.name}</span>
      </div>
    );
  };

  // 打开实名认证弹框
  const openRealNameModal = () => {
    Modal.open({
      title: (
        <div className={styles.realNameSafetyTitle}>
          <img src="/images/common/login/safe-tip.svg" alt="" />
          <span>安全提示</span>
        </div>
      ),
      content: <p className={styles.realNameSafetyText}>为了您的账号安全，请您完成实名认证。</p>,
      className: styles.realNameSafetyModal,
      contentClassName: styles.realNameSafetyContent,
      confirmText: '前往',
      onConfirm: () => {
        // 前往实名认证
        setRealNameVisible(true);
      },
    });
  };

  // 添加银行卡
  const toAddBankPage = () => {
    if (!realName) {
      // 真实姓名 弹框
      openRealNameModal();
      return;
    }
    // 跳转到添加银行卡
    open({
      bindAccountType: BindAccountType.bank,
      onSuccess: () => {
        refresh();
      },
    });
  };

  // 按钮是否可点击
  const disabled = useMemo(() => {
    return !amount || !accountItem?.id;
  }, [amount, accountItem]);

  // 校验（使用转换后的最小/最大值）
  const vaildErrorMsg = useMemo(() => {
    // 空值检查
    if (!amount || amount.trim() === '') {
      return '请输入提现金额';
    }

    const numericValue = Number(amount) ?? 0;
    // 检查是否为 0 或负数
    if (numericValue <= 0) {
      return '请输入有效的提现金额';
    }

    // 检查最小值或最大值
    if (numericValue < minValue || numericValue > maxValue) {
      const unitText = isUSDT ? 'USDT' : '元';
      const symbol = isUSDT ? '$' : '¥';
      return `单笔取款范围为${symbol}${formatValue(minValue)}到${formatValue(maxValue)}${unitText}`;
    }

    // 余额校验：USDT 模式下需要把 value 换算成人民币再比较
    const compareValue = isUSDT ? numericValue * rate : numericValue;
    const userBalance = Number(balance) ?? 0;
    if (compareValue > userBalance) {
      return '取款金额不能大于您的总金额';
    }

    const {
      canOutNums = 0, // 普通剩余次数
      outNumsMax = 0, // 每日普通提款最大次数
      isInWhiteList = false, // 是否在白名单
      remainNum = 0, // 白名单剩余次数
      whiteLimitNum = 0, // 白名单总次数
      remainAmount = 0,
      canOutMoney = 0,
    } = whiteList || {};

    const currentCanOutNums = isInWhiteList ? remainNum : canOutNums;
    const currentOutNumsMax = isInWhiteList ? whiteLimitNum : outNumsMax;
    const currentCanOutMoney = isInWhiteList ? remainAmount : canOutMoney;

    // 👇 提款次数限制提示
    if (currentCanOutNums !== -1 && currentCanOutNums <= 0) {
      return `今日提款次数已达上限 (${currentOutNumsMax}/${currentOutNumsMax})`;
    }

    const convertedCanOutMoney = isUSDT ? safeDivide(currentCanOutMoney, rate) : currentCanOutMoney;

    if (currentCanOutMoney != -1 && convertedCanOutMoney < numericValue) {
      return `今日提款金额已达上限 (${numericValue}${isUSDT ? 'U' : ''}/${convertedCanOutMoney}${isUSDT ? 'U' : ''})`;
    }

    return '';
  }, [amount, minValue, maxValue, isUSDT, rate, balance, whiteList]);

  // 点击按钮立即提现
  const handleWithdrawal = () => {
    void processWithdrawal();
  };

  // 风险银行弹框 确认 1 选择其他银行 2 继续出款
  const handleRiskBank = (actionType: number) => {
    hideRiskModal();
    if (actionType == 1) {
      // 打开 风险银行卡 选择弹框
      if (safeAccountList.length) {
        // 展示安全银行选择
        setSafeBankPickerVisible(true);
      } else {
        // 去添加银行卡
        toAddBankPage();
      }
    } else {
      void processWithdrawal({ skipRiskBank: true });
    }
  };

  const onPickerConfirm = (value: PickerValue[]) => {
    const id = value[0];
    const accountList = curWithdrawalItem.accountList ?? [];
    const index = accountList.findIndex((obj) => obj.id === id);
    setAccountIdx(index);
  };

  const openWhiteListModal = () => {
    const modal = Modal.open({
      title: '人民币提款已达上限',
      content: (
        <div className={styles.whiteListContent}>
          <div>您的人民币提款额度/次数已用尽</div>
          <div>
            当前仍可使用<span>USDT提款</span>方式完成提现
          </div>
          <div className={styles.lastContent}>是否切换为USDT提款？</div>
        </div>
      ),
      footer: (
        <div style={{ display: 'flex', gap: 12, width: '100%', justifyContent: 'center' }}>
          <Button type="second" onClick={() => modal.close()} style={{ flex: 1 }}>
            取消
          </Button>
          <Button
            type="primary"
            style={{ flex: 1 }}
            onClick={() => {
              modal.close();
              void switchToVirtualWithdrawal();
            }}
          >
            切换USDT提款
          </Button>
        </div>
      ),
    });
  };

  const openWithdrawVirtualModal = () => {
    Modal.open({
      title: (
        <div className={styles.tipsTitle}>
          <img src="/images/common/toast/warn_y.svg" />
          提现提醒
        </div>
      ),
      content: (
        <div className={styles.virtual_tips}>
          银行卡充值不可使用虚拟币提现!
          <br />
          <span className={styles.red_fonts}>请使用银行卡提现!</span>
        </div>
      ),
      confirmText: '我知道了',
    });
  };

  // 提交
  const onSubmit = async (payPwd: string) => {
    setLoading(true);
    try {
      const { cash, usdtCash } = getSubmitAmounts({
        amount,
        currencyType,
        rate,
      });
      await doWithdrawal({
        withdrawType: curWithdrawalItem.code,
        memberBankId: accountItem.id,
        cash: cash,
        cashPassword: payPwd,
        virtualInfo: accountItem.info,
        virtualTypeId: accountItem.virtualTypeId,
        rate: String(rate),
        num: usdtCash,
        withdrawCurrency: currencyType.toString(),
      });

      toast({ type: 'success', description: '提款申请成功，请等待客服审核' });
      setAmount('');
      try {
        // 提现成功后强制刷新中心钱包余额，避免返回提现页时仍显示旧金额。
        await getMemberInfo({ isLoading: false });
        refresh();
      } catch (error) {
        console.error(error);
      }
      // 跳转到交易记录列表
      navigate(PATHS.mineTransactionRecord + `?type=${ETransRecordType.Withdraw}`);

      if (onCloseModal) {
        onCloseModal();
      }
    } catch (e) {
      if (e instanceof ResponseError) {
        const code = String(e.code);
        if (code === '1109') {
          toast({ type: 'warning', description: e.message });
        } else if (code === '1223') {
          openSystemMessageModal({ message: e.message, styles: feeStrategyStyles });
        } else {
          toast({ type: 'warning', description: e.message || '操作失败，请重试' });
        }
      } else {
        toast({ type: 'warning', description: '操作失败，请重试' });
      }
    } finally {
      setLoading(false);
    }
  };

  // 关闭账户管理页面
  const handleCloseAccountPage = () => {
    setAccontShowType(null);
    // 刷新数据
    refresh();
  };

  // 数据刷新
  const refresh = useCallback(() => {
    updateWithdrawalChannel();
    updateWhiteList();
    updateRate();
  }, [updateRate, updateWhiteList, updateWithdrawalChannel]);

  useEffect(() => {
    if (!autoCashMode || autoRecycleTriggeredRef.current) return;

    let cancelled = false;
    autoRecycleTriggeredRef.current = true;

    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          // 开启自动转账时，进入提现页自动执行一次一键回收。
          await withdrawAllReq();
          if (cancelled) return;

          // 回收后同步中心钱包余额，并刷新提现渠道、白名单和汇率数据。
          await getMemberInfo({ isLoading: false });
          if (cancelled) return;
          refresh();
        } catch (error) {
          console.error(error);
        }
      })();
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [autoCashMode, getMemberInfo, refresh]);

  const openBindAccountModal = (type: BindAccountType) => {
    open({
      bindAccountType: type,
      onSuccess: () => {
        refresh();
      },
    });
  };

  // 去帮助教程
  const toTutorial = () => {
    // 虚拟币
    if (curWithdrawalItem.code === WithdrawType.virtual) {
      navigate(PATHS.virtualCoins);
    } else {
      navigate(PATHS.helpCenter);
    }
  };

  if (withdrawList.length === 0 && isFetching) {
    return (
      <div className={clsx(styles.withdrawal)}>
        <Skeleton type="depositMainList" />
      </div>
    );
  }

  return (
    <>
      <div
        className={clsx(
          styles.withdrawal,
          !inModal ? styles.autoPC : '',
          !inModal && styles.walletFullPage,
        )}
      >
        <div
          className={styles.withdrawTypeList}
          style={{ '--withdraw-type-count': withdrawList.length } as React.CSSProperties}
        >
          {withdrawList.map((obj, index) => {
            const active = withdrawalTypeIdx === index;

            return (
              <div
                className={clsx(styles.withdrawTypeItem, active ? styles.active : '')}
                key={obj.code}
                onClick={() => {
                  void onChangeWithdrawalTypeIdx(index);
                }}
              >
                <WalletChannelIcon
                  type={getWithdrawIconType(obj.code)}
                  selected={active}
                  className={styles.withdrawTypeIcon}
                />
                <span>{obj.name}</span>
              </div>
            );
          })}
        </div>

        <div className={styles.main}>
          <CardAddress
            item={curWithdrawalItem}
            selectIdx={accountIdx}
            accountItem={accountItem}
            onChange={setAccountIdx}
            openRealNameModal={openRealNameModal}
            showAccountType={setAccontShowType}
            openBindAccountModal={openBindAccountModal}
          />

          {curWithdrawalItem.code && (
            <Tutorial
              iconType={getWithdrawIconType(curWithdrawalItem.code)}
              iconColor="var(--ThemeColor-Main)"
              name={`${curWithdrawalItem.name}教程`}
              onClick={toTutorial}
            />
          )}

          <AmountForm
            value={amount}
            onChange={setAmount}
            item={curWithdrawalItem}
            rate={rate}
            whiteList={whiteList}
            currencyType={currencyType}
            onChangeCurrencyType={onChangeCurrency}
          />

          <WithdrawCostTip
            amount={amount}
            rate={rate}
            currencyType={currencyType}
            isVirtual={curWithdrawalItem.code === WithdrawType.virtual}
            handlingFee={curWithdrawalItem.code === WithdrawType.virtual ? 0 : handlingFee}
            feeRate={curWithdrawalItem.code === WithdrawType.virtual ? 0 : feeRate}
            feeCash={curWithdrawalItem.code === WithdrawType.virtual ? 0 : feeCash}
            feeCode={curWithdrawalItem.code === WithdrawType.virtual ? '0000' : feeCode}
            rateLoading={rateLoading}
            updateRate={onUpdateRate}
          />

          <WithdrawTip tip={curWithdrawalItem.explain} />
        </div>
      </div>

      <div className={clsx(styles.bnBox, !inModal ? styles.auto : '')}>
        <Button
          type="primary"
          className={styles.button}
          disabled={disabled}
          loading={loading}
          onClick={handleWithdrawal}
        >
          立即提现
        </Button>
      </div>

      {/* 风险银行卡弹框 */}
      <RiskBankModal
        visible={riskVisible}
        accountItem={accountItem}
        riskContent1={riskContent1}
        riskContent2={riskContent2}
        safeAccountList={safeAccountList}
        countDown={riskTipTime}
        onClose={hideRiskModal}
        onComplete={handleRiskBank}
      />

      {/* 风险银行 打开安全银行选择弹框 */}
      <PickerModal
        columns={safeBankOption}
        visible={safeBankPickerVisible}
        onClose={() => setSafeBankPickerVisible(false)}
        onConfirm={onPickerConfirm}
        title="选择银行卡"
        cancelText="取消"
        confirmText="确认"
        renderLabel={renderPickerLabel}
      />

      {/* 支付密码弹框 */}
      <PasswordModal
        visible={pwdVisible}
        onClose={() => setPwdVisible(false)}
        onComplete={onSubmit}
        isUSDT={isUSDT}
        money={amount}
      />

      <RealNameModal
        visible={realNameVisible}
        onClose={() => {
          setRealNameVisible(false);
        }}
      />

      <AccountManagementModal showType={accountShowType} handleClose={handleCloseAccountPage} />

      {BindAccountModals}
    </>
  );
};

export default Withdrawal;
