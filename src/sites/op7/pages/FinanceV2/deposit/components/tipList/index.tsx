import React from 'react';
// styles
import styles from './index.module.scss';
/**
 * 钱包 提示信息
 */
const TipList: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  return (
    <div className={styles.formTip}>
      <div>充值说明</div>
      <div dangerouslySetInnerHTML={{ __html: text }}></div>
    </div>
  );
};

export default TipList;
