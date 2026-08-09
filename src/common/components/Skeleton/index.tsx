import React from 'react';

import SportsSkeleton from './SportsMainListSkeleton';
import LeagueFilterSkeleton from './LeagueFilterSkeleton';
import SportsDetailsSkeleton from './SportsDetailsSkeleton';
import DepositMainListSkeleton from './Deposit/MainListSkeleton';
import TransferMainListSkeleton from './Transfer/MainListSkeleton';
import NoticeListSkeleton from './NoticeListSkeleton';
import MsgChildListSkeleton from './MsgChildListSkeleton';
import BaseSkeleton from './BaseSkeleton';
import SlotListSkeleton from './SlotListSkeleton';
import BankCardSkeleton from './BankCardSkeleton';
import DiscoverSkeleton from './DiscoverSkeleton';

interface SkeletonProps {
  type:
    | 'base'
    | 'sportsMainList'
    | 'leagueFilter'
    | 'sportsDetails'
    | 'depositMainList'
    | 'withdrawalMainList'
    | 'transferMainList'
    | 'noticeList'
    | 'msgChildList'
    | 'slotList'
    | 'bankCard'
    | 'discoverLiveStreaming'
    | 'discoverLiveSituation'
    | 'discoverLineUp';
  baseClassName?: string;
  /** slotList 骨架数量，默认 18（3 行 × 6 列） */
  slotListCount?: number;
}

/**
 * 骨架屏组件(组件级别，页面级别请使用PageLoading组件)
 * @param type - 骨架屏类型
 * @returns 骨架屏组件
 */

function Skeleton({ type, baseClassName, slotListCount }: SkeletonProps) {
  switch (type) {
    case 'base':
      return <BaseSkeleton className={baseClassName} />;
    case 'sportsMainList':
      return <SportsSkeleton />;
    case 'leagueFilter':
      return <LeagueFilterSkeleton />;
    case 'sportsDetails':
      return <SportsDetailsSkeleton />;
    case 'depositMainList':
      return <DepositMainListSkeleton />;
    case 'withdrawalMainList':
      return <DepositMainListSkeleton />;
    case 'transferMainList':
      return <TransferMainListSkeleton />;

    case 'noticeList':
      return <NoticeListSkeleton />;
    case 'msgChildList':
      return <MsgChildListSkeleton />;
    case 'slotList':
      return <SlotListSkeleton count={slotListCount} />;
    case 'bankCard':
      return <BankCardSkeleton />;
    case 'discoverLiveStreaming':
    case 'discoverLiveSituation':
    case 'discoverLineUp':
      return <DiscoverSkeleton type={type} />;
    default:
      return null;
  }
}

export default React.memo(Skeleton);
