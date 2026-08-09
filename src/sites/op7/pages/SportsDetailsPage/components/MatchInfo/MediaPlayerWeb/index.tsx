import React, { useState, useEffect, useMemo } from 'react';

// components
import Icon from '@/common/components/Icon';
import VideoPlayer from '../../VideoPlayer';
import AnimationView from '../../AnimationView';

export interface VideoLine {
  url: string;
  refererUrl?: string;
}

import styles from './index.module.scss';
import clsx from 'clsx';

type MediaMode = 'video' | 'animation';

interface VideoPlayerModalProps {
  /** 视频线路列表 */
  videoLines: VideoLine[];
  /** 动画 URL 列表 */
  animationUrls?: string[];
}

/**
 * 视频播放器模态框组件
 */
const VideoPlayerWeb: React.FC<VideoPlayerModalProps> = ({ videoLines, animationUrls }) => {
  // 内部状态管理当前模式，允许在视频和动画之间切换
  const [currentMode, setCurrentMode] = useState<MediaMode>('video');
  // 当前动画 URL（取第一个）
  const animationUrl = useMemo(() => {
    if (animationUrls) {
      return animationUrls.length > 0 ? animationUrls[0] : '';
    }
    return '';
  }, [animationUrls]);

  const hasAnimation = useMemo(() => animationUrl !== '', [animationUrl]);
  const hasVideo = useMemo(() => videoLines.length > 0, [videoLines]);

  // 当 initialMode 变化时更新当前模式
  useEffect(() => {
    if (hasVideo) {
      setCurrentMode('video');
      return;
    }
    if (hasAnimation) {
      setCurrentMode('animation');
      return;
    }
  }, [hasAnimation, hasVideo]);

  if (!hasVideo && !hasAnimation) return null;

  return (
    <div className={styles.mediaView}>
      <div className={styles.videoContainer}>
        {currentMode === 'video' && hasVideo && (
          <VideoPlayer
            lines={videoLines}
            initialLineIndex={0}
            autoPlay={true}
            // onSwitchLine={(index, line) => {
            //   // 可以在这里处理线路切换逻辑
            //   console.log('切换到线路:', index, line);
            // }}
          />
        )}

        {currentMode === 'animation' && animationUrl && (
          <AnimationView url={animationUrl} isVideo={false} />
        )}
      </div>

      <div className={styles.control}>
        <div
          className={clsx(styles.item, !hasVideo ? styles.disabled : '')}
          onClick={() => {
            if (hasVideo) {
              setCurrentMode('video');
            }
          }}
        >
          <Icon
            src="/images/common/sportsDetails/video_icon.svg"
            size={12}
            color={currentMode === 'video' ? 'var(--ThemeColor-Main)' : 'var(--White-100)'}
          />
          <span>视频</span>
        </div>
        <div className={styles.line}></div>
        <div
          className={clsx(styles.item, !hasAnimation ? styles.disabled : '')}
          onClick={() => {
            if (hasAnimation) {
              setCurrentMode('animation');
            }
          }}
        >
          <Icon
            src="/images/common/sportsDetails/video_animation.svg"
            size={12}
            color={currentMode === 'animation' ? 'var(--ThemeColor-Main)' : 'var(--White-100)'}
          />
          <span>视频</span>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerWeb;
