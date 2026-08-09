import React, { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';

// components
import Icon from '@/common/components/Icon';
import Input from '../../../components/Input';
import Popover from '@/common/components/Popover';
import Button from '@/common/components/Button';
import { ClearInputXSvg } from '@/sites/op7/components/SvgIcons';

// hooks
import { PayItem } from '@/apis/origin/finance/deposit';
import { useAppSelector } from '@/core/store/hooks';

// styles
import styles from './index.module.scss';

interface QuickAmountProps {
  payItem: PayItem;
  value: string;
  onChange: (val: string) => void;
  isVirtual: boolean;
  inModal?: boolean;
  disabled: boolean;
  loading: boolean;
  onSubmit: () => void;
  showUsdtAmount?: boolean;
  usdtAmount?: string;
}

/**
 * 快捷金额
 */
const QuickAmount: React.FC<QuickAmountProps> = ({
  payItem,
  value,
  onChange,
  isVirtual,
  inModal = false,
  disabled,
  loading,
  onSubmit,
  showUsdtAmount = false,
  usdtAmount = '',
}) => {
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const [showQuestion, setShowQuestion] = useState(false);
  const [isExpand, setExpand] = useState(false);

  const showList = useMemo(() => {
    return payItem.suggestAmountList || [];
  }, [payItem]);

  const showCount = isMobile || inModal ? 8 : 16;
  const visibleList = useMemo(() => {
    if (isExpand) return showList;
    return showList.slice(0, showCount);
  }, [isExpand, showCount, showList]);

  useEffect(() => {
    setExpand(false);
  }, [showList]);

  const isAmountError = useMemo(() => {
    if (!value) return false;

    const amount = Number(value);
    if (amount >= payItem.cashMin && amount <= payItem.cashMax) {
      return false;
    }
    return true;
  }, [value, payItem]);

  const renderTipContent = () => {
    return (
      <div className={styles.disclaimerPopoverInner}>
        (欧易汇率: 1 USDT ≈ {payItem.oyBuyRate} CNY)
      </div>
    );
  };

  return (
    <div className={clsx(styles.quickAmount, !inModal ? styles.autoPC : '')}>
      <div className={styles.title}>
        <span>充值金额</span>
        {isVirtual && (
          <span className={styles.usdtRate}>
            1 USDT ≈ {payItem.thirdRate} CNY{' '}
            <Popover
              className={styles.ratePopover}
              content={renderTipContent()}
              visible={showQuestion}
              trigger="click"
              placement="top"
            >
              <Icon
                className={styles.icon}
                onMouseEnter={() => setShowQuestion(true)}
                onMouseLeave={() => setShowQuestion(false)}
                src="/images/common/information.svg"
                size="12px"
                color="var(--ThemeColor-Main)"
              />
            </Popover>
          </span>
        )}
      </div>

      <div className={styles.quickAmountList}>
        {visibleList.map((obj) => {
          return (
            <div
              key={obj}
              className={clsx(styles.quickAmountItem, obj === value ? styles.active : '')}
              onClick={() => onChange(obj)}
            >
              <span className={styles.quickAmountCurrency}>¥</span>
              <span className={styles.quickAmountNum}>{obj}</span>
            </div>
          );
        })}
      </div>

      {showList.length > showCount && (
        <div className={styles.expendBox} onClick={() => setExpand(!isExpand)}>
          <span>{isExpand ? '收起' : '展开'}</span>
          <Icon
            className={clsx(styles.expendIcon, isExpand ? styles.active : '')}
            src="/images/common/arrows_up.svg"
            size="10px"
            color="var(--ThemeColor-Main)"
          />
        </div>
      )}

      <div className={styles.inputWrapper}>
        <Input
          prefix={<span>¥</span>}
          value={value}
          placeholder={
            payItem.cashMin && payItem.cashMax
              ? `单笔限额¥${payItem.cashMin}~¥${payItem.cashMax}`
              : ''
          }
          onChange={onChange}
          maxLength={10}
          suffix={
            value && !disabled && !loading ? (
              <button
                type="button"
                className={styles.clearInputBtn}
                onClick={() => onChange('')}
                aria-label="清除金额"
              >
                <ClearInputXSvg className="w-16px h-16px text-[var(--Text-700)]" />
              </button>
            ) : undefined
          }
        />
      </div>
      {isAmountError && (
        <div className={styles.error}>
          超过单笔限额 ¥{payItem.cashMin}~¥{payItem.cashMax}
        </div>
      )}

      <div className={styles.submitBox}>
        <Button
          type="primary"
          className={styles.submitButton}
          disabled={disabled}
          loading={loading}
          onClick={onSubmit}
        >
          <div className={styles.bnContent}>
            <div>立即充值</div>
            {showUsdtAmount && (
              <div className={styles.usdtText}>
                <span>(</span>
                <span className={styles.usdtAmountWithUnit}>
                  <span className={styles.usdtAmountNum}>{usdtAmount}</span>
                  <span className={styles.usdtUnitSuffix}>USDT)</span>
                </span>
              </div>
            )}
          </div>
        </Button>
      </div>
    </div>
  );
};

export default QuickAmount;
