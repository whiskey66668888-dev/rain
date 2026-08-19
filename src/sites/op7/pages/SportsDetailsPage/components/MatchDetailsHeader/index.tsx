import React from 'react';
import HeaderMobile from './headerMobile';
import type { MatchBaseInfo } from '@/apis/commonSports/types';

interface MatchDetailsHeaderProps {
  matchInfo: MatchBaseInfo;
  isFavorite: boolean;
  isMatchTeamHeader: boolean;
  isVideoVisible: boolean;
  isDataBoardVisible: boolean;
  isRefreshing: boolean;
  webHeaderFixedStyle?: React.CSSProperties;
  /** 嵌入右侧栏等场景不展示 PC 顶栏（避免与主区域重复） */
  hideWebHeader?: boolean;
  onBack: () => void;
  onToggleFavorite: () => void;
  onToggleDataBoard: () => void;
  onRefresh: () => void;
  onDrawerOpen?: () => void;
  /** 打开分享弹窗（未登录时不传，即不展示分享入口） */
  onShare?: () => void;
}

/**
 * 赛事详情页头部组件
 */
const MatchDetailsHeader: React.FC<MatchDetailsHeaderProps> = ({
  matchInfo,
  isFavorite,
  isMatchTeamHeader,
  isVideoVisible,
  onBack,
  onToggleFavorite,
  onDrawerOpen,
  onShare,
}) => {
  return (
    <>
      <HeaderMobile
        matchInfo={matchInfo}
        isFavorite={isFavorite}
        onBack={onBack}
        onToggleFavorite={onToggleFavorite}
        onDrawerOpen={onDrawerOpen}
        isMatchTeamHeader={isMatchTeamHeader}
        isVideoVisible={isVideoVisible}
        onShare={onShare}
      />
    </>
  );
};

export default MatchDetailsHeader;
