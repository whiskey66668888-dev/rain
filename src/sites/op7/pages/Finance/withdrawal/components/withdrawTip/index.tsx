import React, { useMemo } from 'react';
// styles
import styles from './index.module.scss';
/**
 * 钱包 取款
 */
const WithdrawTip: React.FC<{ tip: string }> = ({ tip }) => {
  const tipList = useMemo(() => {
    if (!tip) return [];
    return tip.split('\\n');
  }, [tip]);

  return (
    <div className={styles.withdrawTip}>
      {tipList.map((obj) => (
        <p key={obj}>{obj}</p>
      ))}
    </div>
  );
};

export default WithdrawTip;
