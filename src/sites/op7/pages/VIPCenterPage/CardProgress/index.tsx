import React from 'react';
import { Popover, ProgressBar } from 'antd-mobile';
// components

// styles
import styles from './index.module.scss';
import clsx from 'clsx';
import LazyImage from '@/common/components/LazyImage';
interface ProgressProps {
  num: number;
  index: number;
  progressBar: React.RefObject<HTMLDivElement>;
  width?: number;
  fillColor?: string;
  currentLevel?: number;
}
// 进度，第几个，refdom,宽度
const Progress = ({
  num,
  index,
  progressBar,
  fillColor = '#F3C98B',
  currentLevel = 0,
}: ProgressProps) => {
  // const testNum = 99.99
  return (
    <div
      className={clsx(
        index === 1 ? styles.progress_content_baoji : '',
        styles.progress_content_box,
      )}
      ref={progressBar}
      data-current-level={typeof currentLevel === 'number' ? currentLevel : undefined}
    >
      <ProgressBar
        percent={num}
        style={{
          '--fill-color': fillColor,
          '--track-color': '#000000',
        }}
      />

      <div
        className={styles.tips}
        style={{
          left: 'calc(' + num + '% - 21px)',
        }}
      >
        <div
          className={clsx(
            styles.tipBox,
            typeof currentLevel === 'number' && currentLevel < 8 ? styles.tipBox_2 : null,
          )}
        >
          <div>{num.toFixed(2)}%</div>
        </div>
        <div className={styles.downTprogressico}></div>
      </div>
      <div
        className={styles.tips}
        style={{
          left: 'calc(' + 75 + '% - 4px)',
        }}
      >
        {currentLevel > 4 && (
          <Popover
            content={<div className={styles.tipsContent}>75%可得助力金</div>}
            trigger="click"
            placement="top"
            className={styles.tipsContentBox}
          >
            <div className={styles.gift}>
              <LazyImage src={`/images/common/vip/vip_gitf_tip.png`} alt={'icon'} />
            </div>
          </Popover>
        )}
      </div>
    </div>
  );
};

export default Progress;
