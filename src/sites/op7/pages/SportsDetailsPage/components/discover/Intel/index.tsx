import React, { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';

import { FBSportIdValue } from '@/apis/fbSports/common/constants';
import {
  hasJssContent,
  hasPolymarketData,
  useDiscoverIntelQuery,
  useDiscoverPolymarketBackgroundQuery,
} from '@/apis/origin/discover';
import Skeleton from '@/common/components/Skeleton';

import BasicIntel from './BasicIntel';
import JssReport from './JssReport';
import PolymarketBackground from './PolymarketBackground';

interface IntelProps {
  scheduleId: string | null;
  sportId?: number;
  homeTeamName?: string;
  awayTeamName?: string;
  homeTeamIcon?: string;
  awayTeamIcon?: string;
}

const MAIN_TAB_BASIC = 0;
const MAIN_TAB_JSS = 1;
const MAIN_TAB_POLYMARKET = 3;

const MAIN_TAB_BASE =
  'relative flex-none h-28px px-12px border-0 rounded-30px leading-[1] cursor-pointer whitespace-nowrap';

/**
 * 发现-情报
 * 对齐 App intel_view.dart：主 tab（基础情报 / 精算师报告-限免），精算师数据为空时不展示该 tab
 */
const Intel: React.FC<IntelProps> = ({
  scheduleId,
  sportId,
  homeTeamName = '',
  awayTeamName = '',
  homeTeamIcon,
  awayTeamIcon,
}) => {
  const sportType = sportId === Number(FBSportIdValue.Basketball) ? 2 : 1;
  const [activeMainTab, setActiveMainTab] = useState<number>(MAIN_TAB_BASIC);

  const { data: basicData, isLoading: basicLoading } = useDiscoverIntelQuery(
    scheduleId,
    sportType,
    0,
    !!scheduleId,
  );
  const { data: jssData, isLoading: jssLoading } = useDiscoverIntelQuery(
    scheduleId,
    sportType,
    1,
    !!scheduleId,
  );
  const { data: polymarketData, isLoading: polymarketLoading } =
    useDiscoverPolymarketBackgroundQuery(scheduleId, sportType, !!scheduleId);

  const jssAvailable = hasJssContent(jssData?.jss ?? null);
  const polymarketAvailable = hasPolymarketData(polymarketData ?? null);

  // 精算师报告不可用时，回退到基础情报
  useEffect(() => {
    if (activeMainTab === MAIN_TAB_JSS && !jssAvailable && !jssLoading) {
      setActiveMainTab(MAIN_TAB_BASIC);
    }
  }, [activeMainTab, jssAvailable, jssLoading]);

  // 盘口背景不可用时，回退到基础情报
  useEffect(() => {
    if (activeMainTab === MAIN_TAB_POLYMARKET && !polymarketAvailable && !polymarketLoading) {
      setActiveMainTab(MAIN_TAB_BASIC);
    }
  }, [activeMainTab, polymarketAvailable, polymarketLoading]);

  const mainTabs = useMemo(() => {
    const tabs: { id: number; label: string; limited: boolean }[] = [
      { id: MAIN_TAB_BASIC, label: '基础情报', limited: false },
    ];
    if (jssAvailable) {
      tabs.push({ id: MAIN_TAB_JSS, label: '精算师报告', limited: true });
    }
    if (polymarketAvailable) {
      tabs.push({ id: MAIN_TAB_POLYMARKET, label: '盘口背景', limited: false });
    }
    return tabs;
  }, [jssAvailable, polymarketAvailable]);

  if (!scheduleId) return null;

  const isJss = activeMainTab === MAIN_TAB_JSS;
  const isPolymarket = activeMainTab === MAIN_TAB_POLYMARKET;
  const loading = isJss ? jssLoading : isPolymarket ? polymarketLoading : basicLoading;

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-8px bg-[var(--Background-700)]">
      <div className="flex items-center gap-12px min-h-44px px-10px pt-8px">
        {mainTabs.map((tab) => {
          const active = tab.id === activeMainTab;
          return (
            <button
              key={tab.id}
              type="button"
              className={clsx(
                MAIN_TAB_BASE,
                '_tf[12]',
                active
                  ? 'bg-[var(--ThemeColor-Main)] text-[var(--White-100)] font-600'
                  : 'bg-[var(--Background-300)] text-[var(--Text-800)] font-400',
              )}
              onClick={() => setActiveMainTab(tab.id)}
            >
              <span>{tab.label}</span>
              {tab.limited && (
                <span className="absolute top-[-6px] right-[-8px] inline-flex items-center h-14px px-4px rounded-10px bg-[#ff5151] text-white _tf[9] font-500 leading-[1]">
                  限免
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <Skeleton type="base" baseClassName="h-260px" />
      ) : isJss ? (
        <JssReport
          jss={jssData?.jss ?? null}
          homeTeamName={homeTeamName}
          awayTeamName={awayTeamName}
        />
      ) : isPolymarket ? (
        <PolymarketBackground data={polymarketData ?? null} />
      ) : (
        <BasicIntel
          data={basicData ?? null}
          homeTeamName={homeTeamName}
          awayTeamName={awayTeamName}
          homeTeamIcon={homeTeamIcon}
          awayTeamIcon={awayTeamIcon}
        />
      )}
    </div>
  );
};

export default Intel;
