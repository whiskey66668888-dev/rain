import { useMemo } from 'react';

export type MediaMode = 'video' | 'animation' | '';

export interface VideoLine {
  url: string;
  refererUrl?: string;
}

interface MediaControllProps {
  /** 视频线路列表 */
  videoLines: VideoLine[];
  /** 动画 URL 列表 */
  animationUrls?: string[];
}

export function useMedia({ videoLines, animationUrls }: MediaControllProps) {
  // 当前动画 URL（取第一个）
  const animationUrl = useMemo(() => {
    if (animationUrls) {
      return animationUrls.length > 0 ? animationUrls[0] : '';
    }
    return '';
  }, [animationUrls]);

  const hasAnimation = useMemo(() => animationUrl !== '', [animationUrl]);
  const hasVideo = useMemo(() => videoLines.length > 0, [videoLines]);

  return {
    hasAnimation,
    hasVideo,
    animationUrl,
  };
}
