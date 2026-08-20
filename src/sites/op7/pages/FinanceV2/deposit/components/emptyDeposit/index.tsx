import React from 'react';

import Button from '@/common/components/Button';

import styles from './index.module.scss';

interface EmptyDepositProps {
  onRefresh: () => void;
}

const EmptyDeposit: React.FC<EmptyDepositProps> = ({ onRefresh }) => {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyCard}>
        <p>暂无充值通道</p>
        <Button size="middle" onClick={onRefresh}>
          刷新
        </Button>
      </div>
    </div>
  );
};

export default EmptyDeposit;
