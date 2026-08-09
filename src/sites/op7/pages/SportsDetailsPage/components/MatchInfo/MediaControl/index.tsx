import React from 'react';
import clsx from 'clsx';

// components
import Icon from '@/common/components/Icon';
import type { MediaMode } from '../../../hooks/useMedia';

import styles from './index.module.scss';

interface MediaControllerProps {
  mediaMode: MediaMode;
  hasVideo: boolean;
  hasAnimation: boolean;
  onMediaPlay: (val: MediaMode) => void;
}

/**
 * 多媒体播放器控制组件
 */
const MediaController: React.FC<MediaControllerProps> = ({
  mediaMode,
  hasVideo,
  hasAnimation,
  onMediaPlay,
}) => {
  return (
    <div className={styles.mediaControl}>
      <div
        className={clsx(
          styles.item,
          !hasVideo ? styles.disabled : '',
          mediaMode === 'video' ? styles.active : '',
        )}
        onClick={() => {
          if (hasVideo) {
            onMediaPlay('video');
          }
        }}
      >
        <Icon
          src="/images/common/sportsDetails/video_icon.svg"
          size={12}
          color={!hasVideo ? 'var(--White-60)' : 'var(--ThemeColor-Main)'}
        />
        <span className="_tf[12]">视频</span>
      </div>
      <div className={styles.line}></div>
      <div
        className={clsx(
          styles.item,
          !hasAnimation ? styles.disabled : '',
          mediaMode === 'animation' ? styles.active : '',
        )}
        onClick={() => {
          if (hasAnimation) {
            onMediaPlay('animation');
          }
        }}
      >
        <Icon
          src="/images/common/sportsDetails/video_animation.svg"
          size={12}
          color={!hasAnimation ? 'var(--White-60)' : 'var(--ThemeColor-Main)'}
        />
        <span className="_tf[12]">动画</span>
      </div>
    </div>
  );
};

export default MediaController;
