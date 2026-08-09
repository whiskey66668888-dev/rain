import React, { useRef } from 'react';

import Skeleton from '@/common/components/Skeleton';

import IndexOddsDisplayEditor from './components/IndexOddsDisplayEditor';
import { IndexOddsEntryList } from './components/IndexOddsEntryList';
import IndexOddsHistorySheet from './components/IndexOddsHistorySheet';
import IndexOddsToolbar from './components/IndexOddsToolbar';
import { useIndexOdds } from './hooks/useIndexOdds';
import { toOverlayBodyStyle, useParentOverlayBounds } from './hooks/useParentOverlayBounds';
import type { IndexOddsProps } from './types';
import styles from './index.module.scss';

const IndexOdds: React.FC<IndexOddsProps> = ({ scheduleId, matchId, sportId }) => {
  const {
    resolvedSportId,
    tabs,
    activeIndex,
    activeTab,
    isFullTime,
    isLive,
    isLoading,
    rowTypes,
    companyRows,
    headerTitles,
    initialSelected,
    preMatchSelected,
    setInitialSelected,
    setPreMatchSelected,
    selectedCompanyIds,
    toggleCompanySelected,
    displayEditorVisible,
    setDisplayEditorVisible,
    historyCompanyId,
    setHistoryCompanyId,
    historyEntry,
    historyOddsItem,
    matchDataScope,
    playType,
    handleTabChange,
    handlePeriodChange,
  } = useIndexOdds(scheduleId, sportId, matchId);

  const wrapperRef = useRef<HTMLDivElement>(null);
  // PC 侧始终测量父级宽度，打开弹层时可立即对齐，避免首帧闪成全屏宽
  const parentBounds = useParentOverlayBounds(wrapperRef, true);
  const overlayBodyStyle = toOverlayBodyStyle(parentBounds);

  if (!scheduleId && !matchId) return null;

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <div className={styles.topSection}>
        <IndexOddsToolbar
          tabs={tabs}
          activeIndex={activeIndex}
          resolvedSportId={resolvedSportId}
          isFullTime={isFullTime}
          onTabChange={handleTabChange}
          onPeriodChange={handlePeriodChange}
        />
      </div>

      {isLive && !isLoading && companyRows.length > 0 ? (
        <div className={styles.liveSelectBar}>
          <button
            type="button"
            className={styles.selectItem}
            onClick={() => setInitialSelected((prev) => !prev)}
          >
            <img
              src={
                initialSelected
                  ? '/images/common/sportsDetails/indexOdds/index_checked.png.webp'
                  : '/images/common/sportsDetails/indexOdds/index_select.png.webp'
              }
              alt=""
              className={styles.selectIcon}
            />
            <span>初始赔率</span>
          </button>
          <button
            type="button"
            className={styles.selectItem}
            onClick={() => setPreMatchSelected((prev) => !prev)}
          >
            <img
              src={
                preMatchSelected
                  ? '/images/common/sportsDetails/indexOdds/index_checked.png.webp'
                  : '/images/common/sportsDetails/indexOdds/index_select.png.webp'
              }
              alt=""
              className={styles.selectIcon}
            />
            <span>赛前赔率</span>
          </button>
        </div>
      ) : null}

      <div className={styles.card}>
        {isLoading ? (
          <div className={styles.loadingWrap}>
            <Skeleton type="base" baseClassName="h-200px" />
          </div>
        ) : (
          <IndexOddsEntryList
            headerTitles={headerTitles}
            rowTypes={rowTypes}
            companies={companyRows}
            onOpenSettings={() => setDisplayEditorVisible(true)}
            onOpenHistory={setHistoryCompanyId}
          />
        )}
      </div>

      <IndexOddsDisplayEditor
        visible={displayEditorVisible}
        selectedCompanyIds={selectedCompanyIds}
        onToggle={toggleCompanySelected}
        onClose={() => setDisplayEditorVisible(false)}
        bodyStyle={overlayBodyStyle}
      />

      <IndexOddsHistorySheet
        visible={!!historyCompanyId}
        companyId={historyCompanyId}
        companyName={historyEntry?.name}
        // 使用稳定的场馆 matchId，避免 list 轮询更新 historyOddsItem 时触发历史重载闪烁
        matchId={matchId || historyOddsItem?.matchId || historyEntry?.matchId || scheduleId || ''}
        matchTime={historyOddsItem?.matchTime}
        sportId={resolvedSportId}
        tabKey={activeTab.key}
        playType={playType}
        matchDataScope={matchDataScope}
        entryItem={historyOddsItem}
        onClose={() => setHistoryCompanyId(null)}
        bodyStyle={overlayBodyStyle}
      />
    </div>
  );
};

export default IndexOdds;
