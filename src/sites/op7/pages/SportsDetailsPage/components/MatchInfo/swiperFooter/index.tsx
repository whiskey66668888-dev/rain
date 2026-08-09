// import React, { useState } from 'react';

// components
// import Icon from '@/common/components/Icon';
// import Popover from '@/common/components/Popover';

import SportScore from '../sportScore';
import MediaControl from '../MediaControl';

import type { MediaMode } from '../../../hooks/useMedia';
import { MatchBaseInfo } from '@/apis/commonSports/types';

// styles
import styles from './index.module.scss';
import { isFootballMatch } from '../FootballWebScoreboard';

interface SportCardProps {
  matchInfo: MatchBaseInfo;
  showScore: boolean;
  /** Web 足球大比分板已含统计行时不再重复展示 */
  hidePcScore?: boolean;
  isAutoPlay: boolean;
  toogleAutoPlay: (val: boolean) => void;
  mediaMode: MediaMode;
  hasVideo: boolean;
  hasAnimation: boolean;
  onMediaPlay: (val: MediaMode) => void;
  isMobile: boolean;
}

/**
 * 轮播底部
 */
const SwiperFooter: React.FC<SportCardProps> = ({
  matchInfo,
  // isAutoPlay,
  // toogleAutoPlay,
  mediaMode,
  hasVideo,
  hasAnimation,
  onMediaPlay,
  isMobile,
}) => {
  // const [showQuestion, setShowQuestion] = useState(false);

  // const renderTipContent = () => {
  //   return (
  //     <div className={styles.disclaimerPopoverInner}>
  //       <p className={styles.disclaimerTitle}>免责声明</p>
  //       <p className={styles.disclaimerText}>
  //         OP7体育将为会员提供赛事数据、直播作为参考。所有投注将以投注时在投注单中显示的正确比分准。
  //       </p>
  //       <p className={styles.disclaimerText}>
  //         OP7体育将尽最大努力确保所显示内容的及时性、正确性，如有偏差，OP7体育将拥有最终解释权。
  //       </p>
  //     </div>
  //   );
  // };

  return (
    <div className={styles.swiperFooter}>
      {/* {showScore && !hidePcScore && (
        <div className={styles.pcMatchScore}>
          <SportScore matchInfo={matchInfo} rootClassName={styles.webScoreRow} />
        </div>
      )} */}

      <div className={styles.h5MediaControl}>
        <MediaControl
          hasAnimation={hasAnimation}
          hasVideo={hasVideo}
          mediaMode={mediaMode}
          onMediaPlay={onMediaPlay}
        />
      </div>
      <div className={styles.h5MediaControlContent}>
        <div className={styles.scoreScrollArea}>
          {(isMobile || !isFootballMatch(matchInfo)) && (
            <div className={styles.sportScore}>
              <SportScore matchInfo={matchInfo} rootClassName={styles.sportScoreRow} />{' '}
            </div>
          )}
        </div>
        <div className={styles.rightButton}>
          {/* <Icon
            src="/images/common/sportsDetails/swiperAuto.svg"
            size={14}
            color={isAutoPlay ? 'var(--ThemeColor-Main)' : 'var(--White-100)'}
            onClick={() => {
              toogleAutoPlay(!isAutoPlay);
            }}
          /> */}
          {/* <Popover
            content={renderTipContent()}
            visible={showQuestion}
            onVisibleChange={setShowQuestion}
            trigger="click"
            placement="top"
          >
            <Icon src="/images/common/information.svg" size={16} color="var(--White-100)" />
          </Popover> */}
        </div>
      </div>
    </div>
  );
};

export default SwiperFooter;
