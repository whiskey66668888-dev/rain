import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';

import { useAppSelector } from '@/core/store/hooks';
import {
  getSportVideoMutedPreference,
  setSportVideoMutedPreference,
} from '@/sites/op7/utils/sportVideoSoundSession';
import styles from './VideoPlayer.module.scss';

export interface VideoLine {
  url: string;
  refererUrl?: string;
}

interface VideoPlayerProps {
  /** 视频线路列表 */
  lines: VideoLine[];
  /** 初始线路索引 */
  initialLineIndex?: number;
  /** 是否自动播放 */
  autoPlay?: boolean;
  /** 切换线路回调 */
  onSwitchLine?: (index: number, line: VideoLine) => void;
  /** 关闭回调 */
  onClose?: () => void;
  /** 为 true 时根节点与 video 叠加圆角（侧栏等对 <video> 父级裁剪常无效） */
  rounded?: boolean;
}

type HTMLVideoElementWithFullscreen = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void;
  webkitExitFullscreen?: () => void;
  webkitDisplayingFullscreen?: boolean;
};

type DocumentWithWebkitFullscreen = Document & {
  webkitExitFullscreen?: () => void;
  webkitFullscreenElement?: Element | null;
};

/** 业务要求：视频播放不触发横竖屏旋转，保持系统当前方向。 */
const lockLandscape = async () => Promise.resolve();
const unlockOrientation = () => undefined;

/**
 * 将数字转换为中文数字（1 -> "一", 2 -> "二" ...）
 */
const toZhNum = (n: number): string => {
  const zh: string[] = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  if (n <= 10) {
    if (n === 10) return '十';
    return zh[n] || n.toString();
  }
  if (n < 20) return `十${zh[n - 10] || (n - 10).toString()}`;
  if (n < 100) {
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    return `${tens === 1 ? '十' : `${zh[tens] || tens.toString()}十`}${ones === 0 ? '' : zh[ones] || ones.toString()}`;
  }
  return n.toString();
};

/**
 * 视频播放器组件
 */
const VideoPlayer: React.FC<VideoPlayerProps> = ({
  lines,
  initialLineIndex = 0,
  autoPlay = true,
  onSwitchLine,
  rounded = false,
}) => {
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const isAndroidMobile = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    return /android/i.test(navigator.userAgent);
  }, []);
  const playerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElementWithFullscreen>(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(initialLineIndex);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  /** H5 保持原逻辑（默认非静音）；PC 使用跨页面会话 */
  const [isMuted, setIsMuted] = useState(() => (isMobile ? false : getSportVideoMutedPreference()));
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showQualitySelector, setShowQualitySelector] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hideControlsTimerRef = useRef<number | null>(null);
  const qualitySelectorTimerRef = useRef<number | null>(null);

  const currentLine = lines[currentLineIndex] || lines[0];

  // 重置隐藏控制栏的定时器
  const restartHideTimer = useCallback(() => {
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    setShowControls(true);
    hideControlsTimerRef.current = window.setTimeout(() => {
      setShowControls(false);
      setShowQualitySelector(false);
    }, 3000);
  }, []);

  // 切换播放/暂停
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {
        // 播放失败时忽略错误
      });
      setIsPlaying(true);
    }
    restartHideTimer();
  }, [isPlaying, restartHideTimer]);

  // 切换静音
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    if (!isMobile) {
      setSportVideoMutedPreference(newMuted);
    }
    setIsMuted(newMuted);
    restartHideTimer();
  }, [isMobile, isMuted, restartHideTimer]);

  // 刷新/追直播
  const catchUpToLive = useCallback(() => {
    if (!videoRef.current || !currentLine || !currentLine.url) return;
    setIsLoading(true);
    try {
      // 尝试解析 URL，如果是相对路径则直接添加时间戳参数
      let finalUrl = currentLine.url;
      try {
        const url = new URL(currentLine.url);
        url.searchParams.set('_t', Date.now().toString());
        finalUrl = url.toString();
      } catch {
        // 如果不是有效的绝对 URL，直接添加时间戳参数
        const separator = currentLine.url.includes('?') ? '&' : '?';
        finalUrl = `${currentLine.url}${separator}_t=${Date.now()}`;
      }
      videoRef.current.src = finalUrl;
      videoRef.current.load();
      videoRef.current.play().catch(() => {
        // 播放失败时忽略错误
      });
    } catch (error) {
      console.error('刷新视频失败:', error);
      setIsLoading(false);
    }
    restartHideTimer();
  }, [currentLine, restartHideTimer]);

  // 切换线路
  const switchLine = useCallback(
    (index: number) => {
      if (index < 0 || index >= lines.length || index === currentLineIndex) {
        setShowQualitySelector(false);
        return;
      }
      if (!videoRef.current) return;

      const line = lines[index];
      if (!line || !line.url) {
        console.error('线路数据无效:', line);
        setShowQualitySelector(false);
        return;
      }

      try {
        setIsLoading(true);
        setCurrentLineIndex(index);
        videoRef.current.src = line.url;
        videoRef.current.load();
        if (isPlaying) {
          videoRef.current.play().catch(() => {
            // 播放失败时忽略错误
          });
        }
        onSwitchLine?.(index, line);
      } catch (error) {
        console.error('切换线路失败:', error);
        setIsLoading(false);
      }
      setShowQualitySelector(false);
      restartHideTimer();
    },
    [lines, currentLineIndex, isPlaying, onSwitchLine, restartHideTimer],
  );

  // 打开质量选择器
  const openQualitySelector = useCallback(() => {
    setShowQualitySelector(true);
    restartHideTimer();
    // 3秒后自动关闭
    if (qualitySelectorTimerRef.current) {
      clearTimeout(qualitySelectorTimerRef.current);
    }
    qualitySelectorTimerRef.current = window.setTimeout(() => {
      setShowQualitySelector(false);
    }, 3000);
  }, [restartHideTimer]);

  // 关闭质量选择器
  const closeQualitySelector = useCallback(() => {
    if (qualitySelectorTimerRef.current) {
      clearTimeout(qualitySelectorTimerRef.current);
    }
    setShowQualitySelector(false);
  }, []);

  // 切换全屏
  const toggleFullscreen = useCallback(() => {
    const video = videoRef.current;
    const player = playerRef.current;
    if (!video) return;

    const doc = document as DocumentWithWebkitFullscreen;
    if (!isFullscreen) {
      // 移动端优先让容器进标准全屏，避免 video 原生全屏导致自动横转
      if (isMobile && player?.requestFullscreen) {
        void player.requestFullscreen().then(() => {
          void lockLandscape();
        });
      } else if (isMobile && !isAndroidMobile && video.webkitEnterFullscreen) {
        // iOS Safari: 容器全屏可能不可用，回退到视频原生全屏
        video.webkitEnterFullscreen();
        setIsFullscreen(true);
      } else if (video.requestFullscreen) {
        void video.requestFullscreen().then(() => {
          void lockLandscape();
        });
      } else if (!isMobile && video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
        setIsFullscreen(true);
        void lockLandscape();
      }
    } else {
      if (doc.exitFullscreen) {
        void doc.exitFullscreen();
      } else if ((!isMobile || !isAndroidMobile) && doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if ((!isMobile || !isAndroidMobile) && video.webkitExitFullscreen) {
        video.webkitExitFullscreen();
      }
      setIsFullscreen(false);
      unlockOrientation();
    }
    restartHideTimer();
  }, [isAndroidMobile, isFullscreen, isMobile, restartHideTimer]);

  // 监听全屏变化
  useEffect(() => {
    const doc = document as DocumentWithWebkitFullscreen;
    const video = videoRef.current;
    const handleFullscreenChange = (): void => {
      const standardFullscreen = !!document.fullscreenElement;
      const webkitFullscreen = !!doc.webkitFullscreenElement;
      const webkitVideoFullscreen = !!video?.webkitDisplayingFullscreen;
      const nextIsFullscreen = standardFullscreen || webkitFullscreen || webkitVideoFullscreen;
      setIsFullscreen(nextIsFullscreen);
      if (!nextIsFullscreen) {
        unlockOrientation();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    video?.addEventListener('webkitbeginfullscreen', handleFullscreenChange);
    video?.addEventListener('webkitendfullscreen', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      video?.removeEventListener('webkitbeginfullscreen', handleFullscreenChange);
      video?.removeEventListener('webkitendfullscreen', handleFullscreenChange);
    };
  }, []);

  // 初始化视频
  useEffect(() => {
    if (!videoRef.current || !currentLine || !currentLine.url) return;

    const video = videoRef.current;
    try {
      video.src = currentLine.url;
      if (currentLine.refererUrl) {
        // 设置 referer（通过设置 headers，但浏览器限制可能无法生效）
        // 实际项目中可能需要通过代理服务器处理
      }
    } catch (error) {
      console.error('设置视频源失败:', error);
      setIsLoading(false);
      return;
    }

    const handleLoadedData = (): void => {
      setIsLoading(false);
      if (autoPlay) {
        video.play().catch(() => {
          // 播放失败时忽略错误
        });
      }
    };

    const handleLoadStart = (): void => {
      setIsLoading(true);
    };

    const handlePlaying = (): void => {
      setIsPlaying(true);
      setIsLoading(false);
    };

    const handlePause = (): void => {
      setIsPlaying(false);
    };

    const handleWaiting = (): void => {
      setIsLoading(true);
    };

    const handleCanPlay = (): void => {
      setIsLoading(false);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [currentLine, autoPlay]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
      if (qualitySelectorTimerRef.current) {
        clearTimeout(qualitySelectorTimerRef.current);
      }
    };
  }, []);

  // 点击视频区域显示/隐藏控制栏
  const handleVideoClick = useCallback(() => {
    togglePlay();
  }, [togglePlay]);

  // 鼠标移动时显示控制栏
  const handleMouseMove = useCallback(() => {
    restartHideTimer();
  }, [restartHideTimer]);

  if (!currentLine) {
    return null;
  }

  return (
    <div
      ref={playerRef}
      className={`${styles.videoPlayer}${rounded ? ` ${styles.videoPlayerRounded}` : ''}`}
      onMouseMove={handleMouseMove}
    >
      <video
        ref={videoRef}
        className={`${styles.video}${rounded ? ` ${styles.videoRounded}` : ''}`}
        playsInline
        controls={false}
        preload="auto"
        muted={isMuted}
      />
      {/* 加载状态 */}
      {isLoading && (
        <div className={styles.loading}>
          <img className={styles.loadingImg} src={`/images/dark/loading.webp`} alt="loading" />
          {currentLineIndex !== initialLineIndex && (
            <div className={styles.loadingText}>
              正在为您切换至{' '}
              <span className={styles.loadingTextHighlight}>
                高清{toZhNum(currentLineIndex + 1)}
              </span>
              ，请稍后…
            </div>
          )}
        </div>
      )}
      {/* 中心播放按钮 */}
      {!isLoading && showControls && !isPlaying && (
        <div className={styles.centerPlayButton} onClick={handleVideoClick}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="32" fill="rgba(0, 0, 0, 0.5)" />
            <path d="M26 20L44 32L26 44V20Z" fill="white" />
          </svg>
        </div>
      )}
      {/* 顶部工具栏 */}
      {lines.length > 1 && (
        <div
          className={`${styles.topBar} ${showControls ? styles.topBarVisible : styles.topBarHidden}`}
        >
          <div className={styles.topBarContent}>
            <button className={styles.qualityButton} onClick={openQualitySelector}>
              高清{toZhNum(currentLineIndex + 1)}
            </button>
          </div>
        </div>
      )}
      {/* 质量选择器 */}
      {showQualitySelector && lines.length > 1 && (
        <div className={styles.qualitySelectorOverlay} onClick={closeQualitySelector}>
          <div className={styles.qualitySelector} onClick={(e) => e.stopPropagation()}>
            {lines.map((_, index) => (
              <button
                key={index}
                className={`${styles.qualityOption} ${
                  index === currentLineIndex ? styles.qualityOptionActive : ''
                }`}
                onClick={() => switchLine(index)}
              >
                高清{toZhNum(index + 1)}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* 底部控制栏 */}
      <div
        className={`${styles.bottomBar} ${showControls ? styles.bottomBarVisible : styles.bottomBarHidden}`}
      >
        <div className={styles.bottomBarContent}>
          <button
            className={styles.controlButton}
            onClick={togglePlay}
            aria-label={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? (
              <img
                src="/images/common/sportsDetails/unplay_circle_fill_icon.png"
                width="20"
                height="20"
                alt="播放"
              />
            ) : (
              <img
                src="/images/common/sportsDetails/play_circle_fill_icon.png"
                width="20"
                height="20"
                alt="暂停"
              />
            )}
          </button>
          <button
            className={styles.controlButton}
            onClick={toggleMute}
            aria-label={isMuted ? '取消静音' : '静音'}
          >
            {isMuted ? (
              <img
                src="/images/common/sportsDetails/volume_up_fill_icon.png"
                width="20"
                height="20"
                alt={'静音'}
              />
            ) : (
              <img
                src="/images/common/sportsDetails/volume_fill_icon.png"
                width="20"
                height="20"
                alt={'取消静音'}
              />
            )}
          </button>
          <button className={styles.controlButton} onClick={catchUpToLive} aria-label="刷新">
            <img
              src="/images/common/sportsDetails/restart_line_icon.png"
              width="20"
              height="20"
              alt="刷新"
            />
          </button>
          <div className={styles.bottomBarSpacer} />
          <div className={styles.liveBadge}>OP7直播</div>
          <button className={styles.controlButton} onClick={toggleFullscreen} aria-label="全屏">
            <img
              src="/images/common/sportsDetails/fullscreen_line_icon.png"
              width="20"
              height="20"
              alt="全屏"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
