import React from 'react';
import { ProgressBar } from 'antd-mobile';

// styles
import styles from './index.module.scss';
import clsx from 'clsx';
import LazyImage from '@/common/components/LazyImage';
interface ProgressProps {
  num: number;
  index: number;
  progressBar: React.RefObject<HTMLDivElement>;
  isDarkMode?: boolean;
}
const getTipPositionStyle = (percent: number): React.CSSProperties => {
  const value = Math.min(Math.max(percent, 0), 100);
  if (value <= 0) {
    return { left: 0, transform: 'none' };
  }
  if (value >= 100) {
    return { left: '100%', transform: 'translateX(-100%)' };
  }
  return { left: `${value}%`, transform: 'translateX(-50%)' };
};

// 进度，第几个，refdom,宽度
const Progress = ({ num, index, progressBar, isDarkMode = false }: ProgressProps) => {
  return (
    <div
      className={clsx(
        index === 1 ? styles.progress_content_baoji : '',
        styles.progress_content_box,
      )}
      ref={progressBar}
      data-theme-mode={isDarkMode ? 'dark' : 'light'}
    >
      <ProgressBar
        percent={num}
        style={{
          '--fill-color': 'var(--ThemeColor-Main)',
          '--track-color': 'var(--Background-300)',
          '--track-width': '4px',
        }}
      />

      <div className={styles.tips} style={getTipPositionStyle(num)}>
        <div className={styles.tipBox}></div>
        <div className={styles.downTprogressico}>
          <LazyImage src={`/images/common/vip/progress_icon.png`} alt={'icon'} />
        </div>
      </div>
    </div>
  );
};

export default Progress;
