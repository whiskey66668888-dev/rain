import React, { useMemo } from 'react';
// components
import Icon from '@/common/components/Icon';
// import Popover from '@/common/components/Popover';

import { formatValue, safeDivide } from '../../../utils';
import { CurrencyType } from '../../../constants';

// styles
import styles from './index.module.scss';
import clsx from 'clsx';

interface WithdrawCostTipProps {
  amount: string;
  rate: number;
  currencyType: CurrencyType;
  isVirtual: boolean;
  handlingFee: number;
  feeRate: number;
  feeCash: number;
  feeCode: string;
  rateLoading: boolean;
  updateRate: () => void;
}
/**
 * 钱包 取款
 */
const WithdrawCostTip: React.FC<WithdrawCostTipProps> = ({
  amount,
  rate,
  currencyType,
  isVirtual,
  handlingFee,
  // feeRate,
  // feeCash,
  // feeCode,
  rateLoading,
  updateRate,
}) => {
  // 是否使用usdt输入
  const isUSDT = useMemo(() => currencyType === CurrencyType.usdt, [currencyType]);
  // const [showFeeTip, setShowFeeTip] = useState(false);

  // 提现金额
  const withdrawAmount = useMemo(() => {
    if (isUSDT) {
      return formatValue(amount) + 'USDT';
    }
    return formatValue(amount) + '元';
  }, [amount, isUSDT]);

  // 预计到账
  const creditedAmount = useMemo(() => {
    if (isVirtual) {
      if (isUSDT) {
        const cnyVal = formatValue(Number(amount) * rate);
        return `${formatValue(amount)}USDT ≈ ${cnyVal}CNY`;
      }

      const usdtVal = formatValue(safeDivide(Number(amount), rate));
      return `${formatValue(amount)}CNY ≈ ${usdtVal}USDT`;
    }

    return formatValue(Math.max(Number(amount) - handlingFee, 0)) + '元';
  }, [rate, amount, isUSDT, isVirtual, handlingFee]);

  // const feeLabel = useMemo(() => (feeCode === '6003' ? '还需要的金额' : '当前免费额度'), [feeCode]);

  // const renderFeeTipContent = () => {
  //   if (feeRate <= 0) {
  //     return <div className={styles.feePopoverInner}>平台优质会员，提现无手续费。</div>;
  //   }

  //   return (
  //     <div className={styles.feePopoverInner}>
  //       <div className={styles.feePopoverTitle}>什么情况收取手续费</div>
  //       <p>存虚拟币取虚拟币不收手续费；存虚拟币取数字币和法币收取手续费；</p>
  //       <div className={styles.feePopoverTitle}>如何收取手续费</div>
  //       <p>超出免费额度的部分，收取 {feeRate}% 的手续费；</p>
  //       <p>
  //         {feeLabel}
  //         {formatValue(feeCash)}；
  //       </p>
  //     </div>
  //   );
  // };

  return (
    <div className={styles.withdrawCostTip}>
      <div className={styles.row}>
        <span className={styles.title}>
          <span>提现金额</span>
        </span>
        <span className={styles.value}>{withdrawAmount}</span>
      </div>
      {!isVirtual && (
        <div className={styles.row}>
          {/* <span className={styles.title}>
            <span>手续费</span>
            <Popover
              className={clsx(
                styles.feePopover,
                feeRate > 0 ? styles.feePopoverLarge : styles.feePopoverSmall,
              )}
              content={renderFeeTipContent()}
              visible={showFeeTip}
              onVisibleChange={setShowFeeTip}
              trigger="click"
              placement="top-start"
            >
              <Icon
                className={styles.icon}
                onMouseEnter={() => setShowFeeTip(true)}
                onMouseLeave={() => setShowFeeTip(false)}
                src="/images/common/information.svg"
                size="14px"
                color="var(--Text-700)"
              />
            </Popover>
          </span>
          <span className={styles.value}>{formatValue(handlingFee)}元</span> */}
        </div>
      )}
      {isVirtual && (
        <div className={styles.row}>
          <span className={styles.title}>
            <span>参考汇率</span>
          </span>
          <span className={styles.right}>
            {rate}
            <Icon
              className={clsx(styles.icRate, rateLoading ? styles.rotating : '')}
              onClick={() => updateRate()}
              src="/images/common/finance/ic_refresh.svg"
              color="var(--Text-700)"
              size={14}
            />
          </span>
        </div>
      )}

      <div className={styles.row}>
        <span className={styles.title}>
          <span>预计到账</span>
        </span>
        <span className={styles.value}>{creditedAmount}</span>
      </div>
    </div>
  );
};

export default WithdrawCostTip;
