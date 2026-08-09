import React, { useRef } from 'react';
import styles from './index.module.scss';
import Icon from '@/common/components/Icon';
import { ModalBackButton } from '@/sites/op7/components/themeIcon';

interface ChampionHeaderProps {
  leagueName: string;
  matchDate: string;
  isHideAll: boolean;
  onBack: () => void;
  onRecord: () => void;
  onExpandAll: () => void;
}

/**
 * 冠军详情页头部组件
 */
const ChampionHeader: React.FC<ChampionHeaderProps> = ({
  leagueName,
  matchDate,
  onBack,
  onExpandAll,
  isHideAll,
}) => {
  const headerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={headerRef} className={styles.header}>
      <div className={styles.mainTitle}>
        <ModalBackButton onClick={onBack} />

        <div className={styles.center}>
          <span className={`${styles.leagueName} _tf[17]`}>{leagueName}</span>
        </div>

        {/* <div className={styles.button} onClick={onRecord}>
          <Icon src="/images/common/record.svg" size="12px" color="var(--Text-Main-10)" />
        </div> */}
      </div>
      <div className={styles.subTitle}>
        <span className="_tf[16]">冠军投注</span>
        <div className={styles.right}>
          <span className="_tf[14]">{`截止 ${matchDate}`}</span>
          <Icon
            className={`${styles.expandAll} ${isHideAll ? styles.hide : ''}`}
            src="/images/common/ic_expand_up_all.svg"
            onClick={onExpandAll}
            size={14}
            color="var(--White-100)"
          />
        </div>
      </div>
    </div>
  );
};

export default ChampionHeader;
