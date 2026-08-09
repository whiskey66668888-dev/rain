import React, { useMemo, useState } from 'react';
// components
import Input from '../../../components/Input';
import Icon from '@/common/components/Icon';
import CurrencyPicker from '../currencyPicker';
import {
  WithdrawItem,
  WithdrawType,
  WithdrawWhiteListResponse,
} from '@/apis/origin/finance/withdrawal';
import { useAppSelector } from '@/core/store/hooks';

import { formatValue, safeDivide } from '../../../utils';

// styles
import styles from './index.module.scss';
import clsx from 'clsx';
import { CurrencyType } from '../../../constants';

interface AmountFormProps {
  item: WithdrawItem;
  value: string;
  rate: number;
  whiteList?: WithdrawWhiteListResponse;
  currencyType: CurrencyType;
  onChange: (val: string) => void;
  onChangeCurrencyType: (type: CurrencyType) => void;
}
/**
 * 钱包 取款
 */
const AmountForm: React.FC<AmountFormProps> = ({
  item,
  rate,
  value,
  whiteList,
  currencyType,
  onChange,
  onChangeCurrencyType,
}) => {
  const { money } = useAppSelector((state) => state.user.memberInfo);
  const [isExpand, setExpand] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);

  const isVirtual = useMemo(() => item.code === WithdrawType.virtual, [item]);

  // 是否使用usdt输入
  const isUSDT = useMemo(() => currencyType === CurrencyType.usdt, [currencyType]);

  const maxValue = useMemo(() => {
    const maxCash = item.maxCash ? Number(item.maxCash) : 0;
    if (isUSDT) return safeDivide(maxCash, rate);
    return maxCash;
  }, [item, isUSDT, rate]);

  const minValue = useMemo(() => {
    const minCash = item.minCash ? Number(item.minCash) : 0;
    if (isUSDT) return safeDivide(minCash, rate);
    return minCash;
  }, [item, isUSDT, rate]);

  // 今日提现次数
  const canOutLimitTimes = useMemo(() => {
    const {
      canOutNums = 0, // 普通剩余次数
      outNumsMax = 0, // 每日普通提款最大次数
      isInWhiteList = false, // 是否在白名单
      remainNum = 0, // 白名单剩余次数
      whiteLimitNum = 0, // 白名单总次数
    } = whiteList || {};

    const currentCanOutNums = isInWhiteList ? remainNum : canOutNums;
    const currentOutNumsMax = isInWhiteList ? whiteLimitNum : outNumsMax;
    if (currentCanOutNums === -1) return '无限制';

    return `${currentCanOutNums}/${currentOutNumsMax}次`;
  }, [whiteList]);

  // 今日提现额度
  const canOutLimitMoney = useMemo(() => {
    const {
      canOutMoney = 0, // 普通额度
      isInWhiteList = false, // 是否在白名单
      remainAmount = 0, // 白名单剩余额度
    } = whiteList || {};

    const currentCanOutMoney = isInWhiteList ? remainAmount : canOutMoney;
    if (currentCanOutMoney === -1) return '无限制';
    if (isUSDT) {
      return `${formatValue(safeDivide(currentCanOutMoney, rate))}USDT`;
    }

    return `${formatValue(currentCanOutMoney)}元`;
  }, [whiteList, isUSDT, rate]);

  // 单位
  const moneyUnitStr = useMemo(() => (isUSDT ? 'USDT' : '元'), [isUSDT]);

  // input 前缀
  const renderPrefix = useMemo(() => {
    if (isVirtual) {
      return (
        <span className={styles.inputPrefix} onClick={() => setPickerVisible(true)}>
          <span>{isUSDT ? '$' : '¥'}</span>
          <Icon src="/images/common/finance/ic_triangle.svg" size={12} color="var(--Text-700)" />
        </span>
      );
    }
    return <span>¥</span>;
  }, [isVirtual, isUSDT]);

  const renderSuffix = () => {
    return (
      <span className={styles.max} onClick={onMaxHandle}>
        最大
      </span>
    );
  };

  const onMaxHandle = () => {
    const curMoney = Number(money);
    if (!curMoney) return;

    if (isUSDT) {
      onChange(safeDivide(curMoney, rate).toString());
    } else {
      // 保留整数
      onChange(Math.floor(curMoney).toString());
    }
  };

  const onChangeValue = (inputValue: string) => {
    if (isVirtual) {
      if (/^\d*(\.\d{0,2})?$/.test(inputValue)) {
        onChange(inputValue);
      }
    } else {
      // 只允许输入整数
      if (/^\d*$/.test(inputValue)) {
        onChange(inputValue);
      }
    }
  };

  return (
    <div className={styles.amountForm}>
      <div className={styles.title}>
        <span>提现金额</span>
      </div>
      <div className={styles.inputWrapper}>
        <Input
          prefix={renderPrefix}
          suffix={renderSuffix()}
          placeholder={`请输入 ${formatValue(minValue)} ~ ${formatValue(maxValue)}`}
          value={value}
          onChange={onChangeValue}
        />
        <div>
          <div className={clsx(styles.quotaBox, !isExpand ? styles.hide : '')}>
            <div className={styles.quotaItem}>
              <span>今日可提现次数</span>
              <span>{canOutLimitTimes}</span>
            </div>
            <div className={styles.quotaItem}>
              <span>今日可提现额度</span>
              <span>{canOutLimitMoney}</span>
            </div>
            <div className={styles.quotaItem}>
              <span>单笔最高金额</span>
              <span>{`${formatValue(maxValue)}${moneyUnitStr}`}</span>
            </div>
          </div>

          <div className={styles.expendBox} onClick={() => setExpand(!isExpand)}>
            <span>限额说明</span>
            <Icon
              className={clsx(styles.icon, isExpand ? styles.active : '')}
              src="/images/common/arrow_down.svg"
              size="14px"
              color="var(--Text-700)"
            />
          </div>
        </div>
      </div>
      <CurrencyPicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        selectValue={currencyType}
        onChange={onChangeCurrencyType}
      />
    </div>
  );
};

export default AmountForm;
