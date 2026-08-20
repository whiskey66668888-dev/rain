import React from 'react';
import clsx from 'clsx';

import { PayItemV2 } from '@/apis/origin/finance/depositV2';
import WalletChannelIcon from '@/sites/op7/components/WalletChannelIcon';

import { getIconType } from '../../utils';
import styles from './index.module.scss';

interface DepositCategoryProps {
  list: PayItemV2[];
  activeGroupId: number;
  onChange: (item: PayItemV2) => void;
}

const DepositCategory: React.FC<DepositCategoryProps> = ({ list, activeGroupId, onChange }) => {
  return (
    <div className={styles.categoryList}>
      {list.map((item) => {
        const selected = item.groupId === activeGroupId;
        return (
          <button
            type="button"
            key={item.groupId}
            className={clsx(styles.categoryItem, selected ? styles.active : '')}
            onClick={() => onChange(item)}
          >
            <span className={styles.categoryIcon}>
              <WalletChannelIcon
                type={getIconType(item.code)}
                selected={selected}
                size={16}
                backgroundSize={16}
                color="var(--Text-800)"
                selectedColor="var(--White-100)"
              />
            </span>
            <span className={styles.categoryName}>{item.name}</span>
            {item.hot === 1 ? <span className={styles.recommend}>推荐</span> : null}
          </button>
        );
      })}
    </div>
  );
};

export default DepositCategory;
