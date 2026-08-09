import React from 'react';

import VideoPlayer from '../VideoPlayer';
import AnimationView from '../AnimationView';

import { VideoLine } from '../../type';
import type { MediaMode } from '../../hooks/useMedia';

import styles from './VideoPlayerModal.module.scss';

interface VideoPlayerModalProps {
  /** 视频线路列表 */
  videoLines: VideoLine[];
  /** 动画 URL 列表 */
  animationUrls?: string[];
  /** 初始显示模式：'video' | 'animation' | '' */
  mediaMode: MediaMode;
}

/**
 * 视频播放器模态框组件
 */
const VideoPlayerMobile: React.FC<VideoPlayerModalProps> = ({
  mediaMode,
  videoLines,
  animationUrls = [],
}) => {
  // 当前动画 URL（取第一个）
  const currentAnimationUrl = animationUrls.length > 0 ? animationUrls[0] : '';
  const hasVideo = videoLines.length > 0;
  const hasAnimation = currentAnimationUrl !== '';

  /* 视频/动画播放器区域 */
  return (
    <div className={styles.videoContainer}>
      {/* 根据 currentMode 渲染对应的媒体类型 */}
      {mediaMode === 'video' && hasVideo && (
        <VideoPlayer
          lines={videoLines}
          initialLineIndex={0}
          autoPlay={true}
          onSwitchLine={(index, line) => {
            // 可以在这里处理线路切换逻辑
            console.log('切换到线路:', index, line);
          }}
        />
      )}

      {mediaMode === 'animation' && hasAnimation && currentAnimationUrl && (
        <AnimationView url={currentAnimationUrl} isVideo={false} />
      )}
    </div>
  );
};

export default VideoPlayerMobile;
