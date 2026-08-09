import React from 'react';
// components
import Icon from '@/common/components/Icon';
import LazyImage from '@/common/components/LazyImage';
// constants
import { VirutalGuides } from '../../../constants';
// hooks
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
// styles
import styles from './index.module.scss';

/**
 * 充值 虚拟币教程
 */
const VirtualTutorial: React.FC = () => {
  const navigate = useNavigateWithLanguage();
  return (
    <div className={styles.virtualTutorial}>
      <div className={styles.title}>
        <span>虚拟币教程</span>
      </div>

      <div className={styles.list}>
        <div className={styles.box}>
          {VirutalGuides.map((obj, index) => (
            <div className={styles.item} key={index} onClick={() => navigate(obj.link)}>
              <div className={styles.left}>
                <LazyImage src={obj.icon} />
                <div className={styles.line}></div>
                <div className={styles.textBox}>
                  <div className={styles.text}>{obj.title}</div>
                  <div className={styles.tip}>{obj.tips}</div>
                </div>
              </div>

              <Icon src="/images/common/single_arrow.svg" size={12} color="var(--Text-700)" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VirtualTutorial;
