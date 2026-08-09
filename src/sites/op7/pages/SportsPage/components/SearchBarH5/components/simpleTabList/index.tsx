/**
 * 简洁版 玩法显示
 */
import React, { useMemo } from 'react';
// constants
import { FBCompetitionMap } from '@/apis/fbSports/common/constants';
// hooks
import { useAppSelector } from '@/core/store/hooks';
// styles
import styles from './index.module.scss';
import useSportsMainListControl from '@/common/hooks/useSportsMainListControl';
import clsx from 'clsx';

interface SimpleTabListProps {
  /** betting: 与赛事详情 BettingTabs 同款胶囊样式 */
  variant?: 'default' | 'betting' | 'bettingPopup';
  className?: string;
  /** betting 胶囊 tab 紧凑高度（如右侧栏：24px） */
  bettingCompact?: boolean;
}

const SimpleTabList: React.FC<SimpleTabListProps> = ({
  variant = 'default',
  className,
  bettingCompact = false,
}) => {
  const sportId = useAppSelector((state) => state.sport.mainList.settings.sportId);
  const simpleActiveItem = useAppSelector(
    (state) => state.sport.mainList.settings.simpleActiveItem,
  );
  const { changeSimpleActiveItem } = useSportsMainListControl();
  const simpleList = useMemo(() => {
    const list =
      Object.values(FBCompetitionMap).find((item) => item.id === sportId)?.simpleList ?? [];
    return list;
  }, [sportId]);
  if (simpleList.length == 0) return null;
  return (
    <div
      className={clsx(
        styles.simpleList,
        (variant === 'betting' || variant === 'bettingPopup') && styles.betting,
        variant === 'bettingPopup' && styles.bettingPopup,
        bettingCompact &&
          (variant === 'betting' || variant === 'bettingPopup') &&
          styles.bettingCompact,
        className,
      )}
    >
      {simpleList.map((item) => (
        <span
          key={item.name}
          className={clsx(
            styles.simpleItem,
            {
              [styles.active as string]: simpleActiveItem?.name === item.name,
            },
            '_tf[14]',
          )}
          onClick={() => changeSimpleActiveItem(item)}
        >
          <span className={styles.simpleItemLabel}>{item.name}</span>
        </span>
      ))}
    </div>
  );
};

export default React.memo(SimpleTabList);
