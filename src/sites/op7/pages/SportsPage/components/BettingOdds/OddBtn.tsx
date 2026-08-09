// 赔率按钮
import React, { useEffect, useState } from 'react';
import { Icon } from '@/common/components/Icon';
import clsx from 'clsx';
import styles from './OddBtn.module.scss';
import { TBaseBetItem } from '@/apis/commonSports/types';

export interface OddBtnProps {
  betItem?: TBaseBetItem;
  isLocked: boolean;
  threeLine?: boolean; // 是否三行展示盘口
  threeLineColumn?: boolean; // 三行盘口是否纵向展示
  active?: boolean; // 是否选中状态
  className?: string;
  onClick?: (betItem: TBaseBetItem) => void;
  isProMode?: boolean; // 是否专业模式
}

export const OddBtn: React.FC<OddBtnProps> = ({
  betItem,
  isLocked,
  threeLine,
  threeLineColumn,
  active,
  className,
  isProMode = true,
  onClick,
}) => {
  const [oldOdds, setOldOdds] = useState(betItem?.baseOdds);
  useEffect(() => {
    setTimeout(() => {
      setOldOdds(betItem?.baseOdds);
    }, 3000);
  }, [betItem?.baseOdds]);
  if (!betItem) {
    return (
      <button
        className={clsx(
          styles.oddBtn,
          '_tf[14]',
          'cursor-not-allowed',
          { [styles.active as string]: active },
          className,
        )}
      >
        <Icon src="/images/common/lock.svg" size={'16px'} color="var(--Text-700)" />
      </button>
    );
  }
  const title = betItem?.betItemShortName ?? '—';
  const allowClick = !isLocked && betItem.baseOdds;
  return (
    <button
      className={clsx(
        styles.oddBtn,
        '_tf[14]',
        { [styles.threeLine as string]: threeLine && !isLocked && !!betItem.baseOdds },
        { [styles.threeLineColumn as string]: threeLine && threeLineColumn },
        { [styles.proMode as string]: threeLine && isProMode },
        { [styles.active as string]: active },
        allowClick ? 'cursor-pointer' : 'cursor-not-allowed',
        className,
      )}
      onClick={allowClick ? () => onClick?.(betItem) : undefined}
    >
      {isLocked ? (
        <Icon src="/images/common/lock.svg" size={'16px'} color="var(--Text-700)" />
      ) : (
        <>
          <span className={styles.oddTitle}>
            {title === '' ? betItem?.betItemShortName : title}
          </span>
          <span
            className={clsx(styles.oddsValue, {
              [styles.oddup as string]: oldOdds && betItem.baseOdds && betItem.baseOdds > oldOdds,
              [styles.odddown as string]: oldOdds && betItem.baseOdds && betItem.baseOdds < oldOdds,
            })}
          >
            {betItem?.baseOdds ? betItem?.baseOdds.toFixed(2) : '—'}
          </span>
        </>
      )}
    </button>
  );
};
