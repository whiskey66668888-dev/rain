import React, { useMemo, useRef, useState } from 'react';
import clsx from 'clsx';

import type { PickerValue } from 'antd-mobile/es/components/picker';

import type { HistoryMatches } from '@/apis/origin/discover';
import Empty from '@/common/components/Empty';
import PickerModal from '@/sites/op7/components/PickerModal';
import winIcon from '@/sites/op7/images/common/discover/history/result_win.png';
import drawIcon from '@/sites/op7/images/common/discover/history/result_draw.png';
import loseIcon from '@/sites/op7/images/common/discover/history/result_lose.png';
import avgBallIcon from '@/sites/op7/images/common/discover/history/avg_ball.png';
import arrowLeftIcon from '@/sites/op7/images/common/discover/history/arrow_left.png';

import {
  buildHistoryList,
  groupByLeague,
  type CurrentMatchInfo,
  type HistoryContext,
  type HistoryFilters,
  type HistoryRow,
  type ResultTag,
} from './utils/historyLogic';

interface HistoryListProps {
  history: HistoryMatches;
  ctx: HistoryContext;
  cur: CurrentMatchInfo;
  title: string;
  /** 顶部与上方 sub-tab 栏相接：只保留底部圆角 */
  topFlush?: boolean;
}

const RESULT_ICON: Record<ResultTag, string> = {
  win: winIcon,
  draw: drawIcon,
  lose: loseIcon,
};

const ResultBadge: React.FC<{ tag: ResultTag }> = ({ tag }) => (
  <img className="w-16px h-16px flex-none object-contain" src={RESULT_ICON[tag]} alt="" />
);

const TeamLine: React.FC<{ icon: string; name: string }> = ({ icon, name }) => (
  <div className="flex items-center gap-4px min-w-0">
    {icon ? (
      <img className="w-16px h-16px rounded-full object-cover flex-none" src={icon} alt="" />
    ) : (
      <span className="w-16px h-16px rounded-full bg-[var(--Line-100)] flex-none" />
    )}
    <span className="truncate _tf[12] text-[var(--Text-Main-10)]">{name}</span>
  </div>
);

const OddsText: React.FC<{ text: string; bold: boolean }> = ({ text, bold }) => (
  <span
    className={clsx(
      '_tf[12] leading-none',
      bold ? 'font-700 text-[var(--Text-Main-10)]' : 'font-500 text-[var(--Text-700)]',
    )}
  >
    {text || '-'}
  </span>
);

const ODDS_ORANGE = '#F5C25B';

const GridRow: React.FC<{ row: HistoryRow }> = ({ row }) => {
  const m = row.item;
  const [expanded, setExpanded] = useState(false);
  const downX = useRef<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    downX.current = e.clientX;
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    if (downX.current == null) return;
    const dx = e.clientX - downX.current;
    downX.current = null;
    if (Math.abs(dx) < 10) {
      // 轻点：切换展开
      setExpanded((v) => !v);
    } else if (dx <= -22) {
      // 左滑展开
      setExpanded(true);
    } else if (dx >= 22) {
      // 右滑收起
      setExpanded(false);
    }
  };

  const rowProps = {
    className:
      'flex items-stretch h-50px border-b-[0.5px] border-[var(--Line-100)] select-none cursor-pointer',
    style: { touchAction: 'pan-y' as const },
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
  };

  if (expanded) {
    const { stand, handicap, total } = row.odds;
    return (
      <div {...rowProps}>
        {/* » + 胜负 */}
        <div className="w-44px flex-none flex items-center justify-center gap-2px">
          <img
            className="w-12px h-12px flex-none object-contain"
            src={arrowLeftIcon}
            alt=""
            style={{ transform: 'scaleX(-1)' }}
          />
          <ResultBadge tag={row.resultTag} />
        </div>
        {/* HT */}
        <div className="w-30px flex-none flex flex-col justify-center items-center gap-4px border-l-[0.5px] border-[var(--Line-100)] _tf[12] text-[var(--Text-700)]">
          <span>{m.homeHalfScore || '-'}</span>
          <span>{m.guestHalfScore || '-'}</span>
        </div>
        {/* FT */}
        <div className="w-34px flex-none flex flex-col justify-center items-center gap-4px border-l-[0.5px] border-[var(--Line-100)] _tf[12] font-700 text-[var(--Text-Main-10)]">
          <span>{m.homeScore || '-'}</span>
          <span>{m.guestScore || '-'}</span>
        </div>
        {/* 1X2 */}
        <div className="w-40px flex-none flex flex-col justify-center items-center gap-2px border-l-[0.5px] border-[var(--Line-100)]">
          <OddsText text={stand.home} bold={stand.homeBold} />
          <OddsText text={stand.draw} bold={stand.drawBold} />
          <OddsText text={stand.away} bold={stand.awayBold} />
        </div>
        {/* 让球：盘口 + 两边赔率 */}
        <div className="flex-1 min-w-0 flex items-center justify-center gap-6px px-3px border-l-[0.5px] border-[var(--Line-100)]">
          <span className="_tf[12] font-600 leading-none" style={{ color: ODDS_ORANGE }}>
            {handicap.line || '-'}
          </span>
          <div className="flex flex-col items-center gap-4px">
            <OddsText text={handicap.homeOdd} bold={handicap.homeOddBold} />
            <OddsText text={handicap.awayOdd} bold={handicap.awayOddBold} />
          </div>
        </div>
        {/* 大小球 */}
        <div className="w-90px flex-none flex flex-col justify-center gap-6px px-6px border-l-[0.5px] border-[var(--Line-100)]">
          <div className="flex items-center justify-between gap-4px">
            <span className="_tf[12] leading-none whitespace-nowrap" style={{ color: ODDS_ORANGE }}>
              {total.overLabel}
            </span>
            <OddsText text={total.overOdd} bold={total.overOddBold} />
          </div>
          <div className="flex items-center justify-between gap-4px">
            <span className="_tf[12] leading-none whitespace-nowrap" style={{ color: ODDS_ORANGE }}>
              {total.underLabel}
            </span>
            <OddsText text={total.underOdd} bold={total.underOddBold} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div {...rowProps}>
      <div className="w-46px flex-none flex flex-col justify-center items-center px-2px _tf[11] text-center text-[var(--Text-800)] leading-[1.3]">
        <span>{row.date.line1}</span>
        <span>{row.date.line2}</span>
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-4px py-6px pr-4px">
        <TeamLine icon={m.homeLogo} name={m.homeTeamName} />
        <TeamLine icon={m.guestLogo} name={m.guestTeamName} />
      </div>
      <div className="w-28px flex-none flex items-center justify-center">
        <ResultBadge tag={row.resultTag} />
      </div>
      <div className="w-30px flex-none flex flex-col justify-center items-center gap-4px py-6px border-l-[0.5px] border-[var(--Line-100)] _tf[12] text-[var(--Text-700)]">
        <span>{m.homeHalfScore || '-'}</span>
        <span>{m.guestHalfScore || '-'}</span>
      </div>
      <div className="w-34px flex-none flex flex-col justify-center items-center py-6px border-l-[0.5px] border-[var(--Line-100)] _tf[12] font-700 text-[var(--Text-Main-10)]">
        <span>{m.homeScore || '-'}</span>
        <img
          className="w-10px h-10px flex-none object-contain my-[1px]"
          src={arrowLeftIcon}
          alt=""
        />
        <span>{m.guestScore || '-'}</span>
      </div>
    </div>
  );
};

const SummaryStat: React.FC<{ tag: ResultTag; value: number }> = ({ tag, value }) => (
  <div className="flex items-center gap-4px">
    <ResultBadge tag={tag} />
    <span className="_tf[12] font-500 text-[var(--Text-Main-10)]">{`X${value}`}</span>
  </div>
);

const HistoryList: React.FC<HistoryListProps> = ({ history, ctx, cur, title, topFlush }) => {
  const [filters, setFilters] = useState<HistoryFilters>({
    sameHomeAway: false,
    sameLeague: false,
    desiredCount: null,
  });
  const [pickerOpen, setPickerOpen] = useState(false);

  const result = useMemo(
    () => buildHistoryList(history, ctx, cur, filters),
    [history, ctx, cur, filters],
  );
  const groups = useMemo(() => groupByLeague(result.rows), [result.rows]);
  const countColumns = useMemo(
    () => [
      Array.from({ length: result.available }, (_, i) => ({
        label: String(i + 1),
        value: i + 1,
      })),
    ],
    [result.available],
  );

  const toggleSameHomeAway = () =>
    setFilters((f) => ({
      ...f,
      sameHomeAway: !f.sameHomeAway,
      sameLeague: !f.sameHomeAway ? false : f.sameLeague,
    }));
  const toggleSameLeague = () =>
    setFilters((f) => ({
      ...f,
      sameLeague: !f.sameLeague,
      sameHomeAway: !f.sameLeague ? false : f.sameHomeAway,
    }));

  const openPicker = () => {
    if (result.available <= 0) return;
    setPickerOpen(true);
  };
  const handleCountConfirm = (val: PickerValue[]) => {
    const n = Number(val[0]);
    if (n > 0) setFilters((f) => ({ ...f, desiredCount: n }));
  };

  const avg = (result.summary.avgGoalsFor + result.summary.avgGoalsAgainst).toFixed(1);
  const rate = `${Math.round(result.summary.handicapWinRate * 100)}%`;

  const filterPill = (label: string, active: boolean, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'flex-none h-24px px-10px rounded-full _tf[12] leading-[1] cursor-pointer',
        active
          ? 'border-0 bg-[var(--ThemeColor-Main)] text-[var(--White-100)]'
          : 'border border-[var(--Line-100)] bg-transparent text-[var(--Text-Main-10)]',
      )}
    >
      {label}
    </button>
  );

  return (
    <div
      className={clsx(
        'bg-[var(--Background-300)] p-10px',
        topFlush ? 'rounded-b-8px' : 'rounded-8px',
      )}
    >
      <div className="_tf[14] font-600 leading-[1.43] text-[var(--Text-Main-10)]">{title}</div>

      {/* 筛选 */}
      <div className="flex items-center gap-10px mt-12px">
        {filterPill('同主客', filters.sameHomeAway, toggleSameHomeAway)}
        {filterPill('同赛事', filters.sameLeague, toggleSameLeague)}
        <div className="flex-1" />
        <button
          type="button"
          onClick={openPicker}
          className="flex-none flex items-center gap-2px h-22px pl-10px pr-3px rounded-6px bg-[var(--Line-100)] cursor-pointer"
        >
          <span className="_tf[12] font-500 text-[var(--Text-Main-10)]">{result.count}</span>
          <span className="_tf[12] text-[var(--Text-Main-10)] leading-[1]">▾</span>
        </button>
      </div>

      {/* 汇总 */}
      <div className="flex items-center gap-11px mt-12px">
        <SummaryStat tag="win" value={result.summary.win} />
        <SummaryStat tag="draw" value={result.summary.draw} />
        <SummaryStat tag="lose" value={result.summary.lose} />
        <div className="flex-none flex items-center gap-2px px-4px py-2px rounded-12px bg-[var(--Line-100)] _tf[11] text-[var(--Text-800)]">
          <img className="w-14px h-14px flex-none object-contain" src={avgBallIcon} alt="" />
          {`场均${avg}`}
        </div>
        <div className="flex-1" />
        <div className="flex-none flex items-center px-4px py-2px rounded-12px bg-[var(--Line-100)] _tf[11] text-[var(--Text-Main-10)]">
          {`赢盘率${rate}`}
        </div>
      </div>

      {/* 列表 */}
      {result.rows.length === 0 ? (
        <Empty variant="card" className="py-24px" />
      ) : (
        <div className="mt-8px border-[0.5px] border-[var(--Line-100)]">
          {groups.map((g) => (
            <div key={g.leagueName}>
              <div className="flex items-center h-30px bg-[var(--Line-100)] border-b-[0.5px] border-[var(--Line-100)]">
                <div className="flex-1 min-w-0 flex items-center gap-4px px-14px">
                  {g.leagueLogo ? (
                    <img
                      className="w-20px h-20px rounded-full object-cover flex-none"
                      src={g.leagueLogo}
                      alt=""
                    />
                  ) : (
                    <span className="w-10px flex-none" />
                  )}
                  <span className="truncate _tf[11] font-600 text-[var(--Text-800)]">
                    {g.leagueName}
                  </span>
                </div>
                <div className="w-30px flex-none text-center _tf[11] text-[var(--Text-800)] border-l-[0.5px] border-[var(--Line-100)]">
                  HT
                </div>
                <div className="w-34px flex-none text-center _tf[11] text-[var(--Text-800)] border-l-[0.5px] border-[var(--Line-100)]">
                  FT
                </div>
              </div>
              {g.rows.map((r) => (
                <GridRow
                  key={r.item.scheduleId || `${r.item.matchTime}-${r.item.homeTeamName}`}
                  row={r}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* 场次选择 */}
      <PickerModal
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        columns={countColumns}
        value={[result.count]}
        onConfirm={handleCountConfirm}
        title="请选择场次"
        cancelText="取消"
        confirmText="完成"
        itemLayout="center"
      />
    </div>
  );
};

export default HistoryList;
