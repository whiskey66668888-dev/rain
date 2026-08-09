import React, { useMemo } from 'react';
// styles
import styles from './index.module.scss';
/**
 * 钱包 提示信息
 */
const FormTip: React.FC<{ tip: string }> = ({ tip }) => {
  const tipList = useMemo(() => {
    if (!tip) return [];
    return tip
      .split('\\n')
      .map((item) => item.replace(/^\s*\d+\s*[.:：、．)）]\s*/, '').trim())
      .filter(Boolean);
  }, [tip]);

  return (
    <div className={styles.formTip}>
      <div>充值说明</div>
      <ul>
        {tipList.map((obj) => (
          <li key={obj}>{obj}</li>
        ))}
      </ul>
    </div>
  );
};

export default FormTip;
