import React, { useMemo } from 'react';

import LazyImage from '@/common/components/LazyImage';

import { MatchBaseInfo, TBaseBetItem } from '@/apis/commonSports/types';
import { getBetItemDisplayShortName } from '@/apis/fbSports/common/fbFormat';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { generatePath } from 'react-router-dom';
import { PATHS } from '@/sites/op7/routes/paths';
import Popover from '@/common/components/Popover';
import clsx from 'clsx';
import { useOddsDisplay } from '@/common/hooks/sports/useOddsDisplay';

interface SportsCardProps {
  matchInfo: MatchBaseInfo;
  type: 'bigCard' | 'smallCard';
}

/**
 * 赛事卡片组件
 */
export const SportsCard: React.FC<SportsCardProps> = ({ matchInfo, type }) => {
  const {
    homeName,
    homeLogo,
    awayName,
    awayLogo,
    leagueName,
    homeScore,
    awayScore,
    matchDate,
    isLive,
    matchPeriod,
    periodName,
    bt,
    children = [],
  } = matchInfo;
  const navigate = useNavigateWithLanguage();
  const { getOddsDisplay } = useOddsDisplay();
  const goMatchDetailWithPick = (e: React.MouseEvent, option: TBaseBetItem) => {
    e.stopPropagation();
    const selectionTy =
      option.fb?.ty != null ? String(option.fb.ty) : (option.betItemId?.split('_').pop() ?? '');
    if (!selectionTy) return;
    navigate(generatePath(PATHS.sportsDetail, { matchId: String(matchInfo.matchId) }), {
      state: { pickBet: { marketId: String(option.marketId), selectionTy } },
    });
  };
  const kickoffTime = useMemo(() => {
    const ts = Number(bt ?? 0);
    if (!ts) return '--:--';
    const ms = ts > 1_000_000_000_000 ? ts : ts * 1000;
    const date = new Date(ms);
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }, [bt]);
  const kickoffDate = useMemo(() => {
    const ts = Number(bt ?? 0);
    if (!ts) return matchDate;
    const ms = ts > 1_000_000_000_000 ? ts : ts * 1000;
    const date = new Date(ms);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}年${mm}月${dd}日`;
  }, [bt, matchDate]);
  const liveStatusText = matchPeriod || periodName || '--';

  // 小卡片与详情页轮播第一屏一致：justify-center + 渐变；大卡片用 justify-around
  const layoutClasses =
    type === 'smallCard'
      ? 'justify-center rounded-12px bg-gradient-to-b pt-0px pb-5px'
      : 'justify-around bg-[var(--Background-300)] rounded-10px';

  const teamColorClasses =
    type === 'smallCard' ? 'text-[var(--Text-Main-10)]' : 'text-[var(--Text-Main-10)]';
  const leagueColorClasses =
    type === 'smallCard' ? 'text-[var(--Text-Main-10)]' : 'text-[var(--Text-800)]';
  const bettingOptions = useMemo<TBaseBetItem[]>(() => {
    if (type === 'smallCard' || !children.length) return [];

    const takeTwo = (mty?: string) =>
      (
        children.find((m) => mty && m.itemType.startsWith(`${mty}_`))?.children?.[0]?.lists ?? []
      ).slice(0, 2);
    const mtys = [...new Set(children.map((m) => m.itemType.split('_')[0]))];

    return [...takeTwo(mtys[0]), ...takeTwo(mtys[1])].filter((item) => item.betItemId);
  }, [children, type]);
  return (
    <div
      className={`w-full h-full flex flex-col items-center p-12px gap-12px px-8px cursor-pointer ${layoutClasses}`}
      onClick={() => {
        navigate(generatePath(PATHS.sportsDetail, { matchId: String(matchInfo.matchId) }));
      }}
    >
      {/* 顶部：队伍信息（左右等分撑开，中间固定居中；左右图片定高宽自适应） */}
      <div className="flex flex-row items-start w-full">
        {/* 左侧队伍 */}
        <div className="flex-1 min-w-0 flex flex-col items-center gap-12px">
          <LazyImage
            src={homeLogo}
            alt={homeName}
            className="h-44px w-44px max-w-56px object-contain"
            lazy={false}
          />
          <Popover content={homeName}>
            <p
              className={`w-full text-center _tf[12] font-${matchInfo.nameBold === 'home' ? '600' : '300'} ${teamColorClasses} line-clamp-1`}
            >
              {homeName}
            </p>
          </Popover>
        </div>

        {/* 中间：联赛、比分、状态（固定宽度不伸缩，始终居中） */}
        <div
          className={clsx(
            'flex-shrink-0 flex flex-col items-center gap-2px justify-center mx-10px  max-w-120px h-full w-auto',
          )}
        >
          <p
            className={`w-full text-center _tf[12] font-weight-400 ${leagueColorClasses} truncate`}
            title={leagueName}
          >
            {leagueName}
          </p>
          <p
            className={clsx('text-center', {
              [`_tf[30] font-weight-800 leading-[30px] font-din-pro ${teamColorClasses}`]: isLive,
              [`_tf[12] font-weight-400 ${leagueColorClasses}`]: !isLive,
            })}
          >
            {isLive ? `${homeScore} - ${awayScore}` : kickoffTime}
          </p>
          <div
            className={`w-full text-center _tf[12] flex items-center justify-center gap-4px font-weight-400 ${leagueColorClasses}`}
          >
            <span className="whitespace-nowrap">{isLive ? liveStatusText : kickoffDate}</span>
          </div>
        </div>

        {/* 右侧队伍 */}
        <div className="flex-1 min-w-0 flex flex-col items-center gap-12px">
          <LazyImage
            src={awayLogo}
            alt={awayName}
            className="h-44px w-44px max-w-56px object-contain"
            lazy={false}
          />
          <Popover content={awayName}>
            <p
              className={`w-full text-center _tf[12] font-${matchInfo.nameBold === 'away' ? '600' : '300'} ${teamColorClasses} line-clamp-1`}
            >
              {awayName}
            </p>
          </Popover>
        </div>
      </div>

      {/* 底部：投注选项 */}
      {bettingOptions.length > 0 && (
        <div className="w-full flex flex-row items-center gap-8px">
          {bettingOptions.map((option, index) => (
            <div
              key={index}
              role="presentation"
              className="flex-1 flex flex-col items-center justify-center gap-2px bg-[var(--Line-100)] rounded-6px h-42px cursor-pointer"
              onClick={(e) => goMatchDetailWithPick(e, option)}
            >
              <p
                className={`text-center _tf[12] font-weight-400 din-pro mb-[-1px] ${leagueColorClasses}`}
              >
                {getBetItemDisplayShortName(option)}
              </p>
              <p className="text-center din-pro font-weight-800 text-14px text-[var(--Text-Main-10)] mb-[-2px]">
                {
                  getOddsDisplay({ baseOdds: option.baseOdds, isSupportHK: option.isSupportHK })
                    .odds
                }
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SportsCard;
