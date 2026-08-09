import React from 'react';

import { useOpenDiscountActivity } from '@/common/hooks/useOpenDiscountActivity';
import { VirtualDepositActivities } from '../../../constants';

import styles from './index.module.scss';

const VirtualActivity: React.FC = () => {
  const { openDiscountDetail } = useOpenDiscountActivity();

  return (
    <div className={styles.virtualActivity}>
      <div className={styles.title}>
        <span>虚拟币活动</span>
      </div>

      <div className={styles.list}>
        {VirtualDepositActivities.map((item) => (
          <img
            key={item.id}
            className={styles.activityImage}
            src={item.image}
            alt={item.title}
            onClick={() => openDiscountDetail(item.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default VirtualActivity;
