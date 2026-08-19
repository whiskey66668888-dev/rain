// 赔率按钮
import React, { useEffect, useState } from 'react';
import { Icon } from '@/common/components/Icon';
import clsx from 'clsx';
import styles from './OddBtn.module.scss';
import { TBaseBetItem } from '@/apis/commonSports/types';
import { useAppSelector } from '@/core/store/hooks';
import { selectCurrentOddsType } from '@/core/store/selectors/sportSelectors';
import { getDisplayOdds } from '@/utils/bet';

export interface OddBtnProps {
  betItem?: TBaseBetItem;
  isLocked: boolean;
  threeLine?: boolean; // 是否三行展示盘口
  threeLineColumn?: boolean; // 三行盘口是否纵向展示
  active?: boolean; // 是否选中状态
  className?: string;
  onClick?: (betItem: TBaseBetItem) => void;
  isProMode?: boolean; // 是否专业模式
  /** OB 详情补盘加载中：空位显示小 loading（不影响 FB） */
  isLoading?: boolean;
}

export const OddBtn: React.FC<OddBtnProps> = React.memo(function OddBtn({
  betItem,
  isLocked,
  threeLine,
  threeLineColumn,
  active,
  className,
  isProMode = true,
  isLoading,
  onClick,
}) {
  const currentOddsType = useAppSelector(selectCurrentOddsType);
  const [oldOdds, setOldOdds] = useState(betItem?.baseOdds);
  useEffect(() => {
    setTimeout(() => {
      setOldOdds(betItem?.baseOdds);
    }, 3000);
  }, [betItem?.baseOdds]);

  if (isLoading) {
    return (
      <button
        className={clsx(
          styles.oddBtn,
          '_tf[14]',
          'cursor-not-allowed',
          { [styles.active as string]: active },
          className,
        )}
        type="button"
        aria-busy
      >
        <span className={styles.loadingSpinner} />
      </button>
    );
  }

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
  // 展示值按当前盘口换算；是否有赔率、涨跌比较仍统一用欧洲盘的 baseOdds
  const displayOdds = getDisplayOdds(betItem.baseOdds, betItem.isSupportHK, currentOddsType);
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
            {betItem?.baseOdds ? displayOdds : '—'}
          </span>
        </>
      )}
    </button>
  );
});
