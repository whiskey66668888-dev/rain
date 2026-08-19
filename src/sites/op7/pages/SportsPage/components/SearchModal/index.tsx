import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ClientOnly } from '@/common/components/ClientOnly';
import Overlay from '@/common/components/Overlay';
import type { OverlayPosition } from '@/common/components/Overlay';
import LeagueFilter from './components/LeagueFilter';
import { HotSportId } from '@/apis/commonSports/constants';
import KeywordFilter from './components/KeywordFilter';

import { useAppSelector } from '@/core/store/hooks';

import { zIndexMap } from '@/utils/constants/zIndex';
import styles from './index.module.scss';
import useSportsMainListControl from '@/common/hooks/useSportsMainListControl';

const SearchModal: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const {
    sportId,
    filterSearchText,
    filterByLeagueIds,
    filterLeaguePickerSynced: pickerSyncedStored,
  } = useAppSelector((state) => state.sport.mainList.settings);
  /** 旧 session 可能无该字段，视为与筛选 Tab 同步 */
  const filterLeaguePickerSynced = pickerSyncedStored ?? true;
  const { changeFilterByLeagueIds } = useSportsMainListControl();
  /** useLayoutEffect 注册，避免 forwardRef 未挂载时 header「搜索」点了无响应 */
  const keywordSearchActionsRef = useRef<{ triggerSearch?: () => void }>({});

  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const overlayPosition = useMemo<OverlayPosition>(
    () => (isMobile ? 'bottom' : 'center'),
    [isMobile],
  );

  const [curSportId, setSportId] = useState(0);
  const [tabIdx, setTabIdx] = useState(1);
  /** 筛选 Tab 内联赛列表搜索框（与搜索 Tab 输入独立） */
  const [pickerSearchText, setPickerSearchText] = useState('');
  /** 搜索 Tab 输入框：升层保存，避免切换 Tab 卸载子组件后被 Redux 旧值覆盖 */
  const [keywordTabSearchText, setKeywordTabSearchText] = useState('');
  const prevVisibleRef = useRef(false);

  const onPickerLeagueFilter = useCallback(
    (sid: number, leagueIds: Array<number | string>, text?: string) => {
      changeFilterByLeagueIds(leagueIds, sid, text ?? '', { syncLeaguePicker: true });
      onClose();
    },
    [changeFilterByLeagueIds, onClose],
  );

  /** 热门搜索：列表仍按联赛筛，不与筛选 Tab 勾选同步、再次打开默认搜索 Tab */
  const onHotSearchLeagueFilter = useCallback(
    (sid: number, leagueIds: Array<number | string>, text?: string) => {
      changeFilterByLeagueIds(leagueIds, sid, text ?? '', { syncLeaguePicker: false });
      onClose();
    },
    [changeFilterByLeagueIds, onClose],
  );

  /** 搜索框为空点搜索：去掉联赛筛选关键词并关弹窗 */
  const onClearFilterAndClose = useCallback(() => {
    changeFilterByLeagueIds([], sportId, '');
    onClose();
  }, [changeFilterByLeagueIds, sportId, onClose]);

  useEffect(() => {
    setSportId(sportId);
  }, [sportId]);

  /**
   * 每次打开弹层：Tab / picker 文案初始化；搜索 Tab 关键词写入 keywordTabSearchText（本地），切换 Tab 不丢
   */
  useEffect(() => {
    if (visible && !prevVisibleRef.current) {
      const hasLeagueFilter = filterByLeagueIds.length > 0;
      const canShowFilterTab = sportId !== HotSportId;
      const openFilterTab = hasLeagueFilter && filterLeaguePickerSynced && canShowFilterTab;
      const storeKw = filterSearchText ?? '';
      if (openFilterTab) {
        setTabIdx(0);
        setPickerSearchText(storeKw);
        setKeywordTabSearchText(storeKw);
      } else {
        setTabIdx(1);
        setPickerSearchText(
          filterLeaguePickerSynced && (hasLeagueFilter || filterSearchText) ? storeKw : '',
        );
        setKeywordTabSearchText(storeKw);
      }
    }
    prevVisibleRef.current = visible;
  }, [visible, sportId, filterByLeagueIds, filterSearchText, filterLeaguePickerSynced]);

  /** 热门赛种下没有「筛选」入口，tabIdx 若为 0 会导致右侧 header「搜索」被 hiddenAction 禁用 */
  useEffect(() => {
    if (curSportId === HotSportId && tabIdx === 0) {
      setTabIdx(1);
    }
  }, [curSportId, tabIdx]);

  return (
    <ClientOnly>
      <Overlay
        show={visible}
        close={onClose}
        position={overlayPosition}
        maskClickClose
        zIndex={zIndexMap.homeSearch}
      >
        <div className={`${styles.searchModal} ${isMobile ? styles.mobile : styles.desktop}`}>
          <header>
            <button type="button" className={styles.headerAction} onClick={onClose}>
              {'\u53d6\u6d88'}
            </button>
            <div className={styles.tabList}>
              {curSportId !== HotSportId && (
                <button
                  type="button"
                  className={`${styles.tabItem} ${tabIdx === 0 ? styles.active : ''}`}
                  onClick={() => setTabIdx(0)}
                >
                  {'\u7b5b\u9009'}
                </button>
              )}
              <button
                type="button"
                className={`${styles.tabItem} ${tabIdx === 1 ? styles.active : ''}`}
                onClick={() => setTabIdx(1)}
              >
                {'\u641c\u7d22'}
              </button>
            </div>
            <button
              type="button"
              className={`${styles.headerAction} ${styles.headerSearch} ${tabIdx !== 1 ? styles.hiddenAction : ''}`}
              onClick={() => keywordSearchActionsRef.current.triggerSearch?.()}
            >
              {'\u641c\u7d22'}
            </button>
          </header>
          <section className={styles.modalBody}>
            {curSportId !== HotSportId && (
              <div className={`${styles.tabPanel} ${styles.filterSection}`} hidden={tabIdx !== 0}>
                <LeagueFilter
                  sportId={curSportId}
                  initialSelectedLeagueIds={filterLeaguePickerSynced ? filterByLeagueIds : []}
                  onLeagueFilter={onPickerLeagueFilter}
                  defaultText={filterLeaguePickerSynced ? pickerSearchText : ''}
                  changeText={setPickerSearchText}
                />
              </div>
            )}
            <div className={`${styles.tabPanel} ${styles.searchSection}`} hidden={tabIdx !== 1}>
              <KeywordFilter
                imperativeSearchRef={keywordSearchActionsRef}
                searchKeyword={keywordTabSearchText}
                onSearchKeywordChange={setKeywordTabSearchText}
                sportId={curSportId}
                onChangeSport={setSportId}
                onLeagueFilter={onHotSearchLeagueFilter}
                onClearFilterAndClose={onClearFilterAndClose}
              />
            </div>
          </section>
        </div>
      </Overlay>
    </ClientOnly>
  );
};

export default SearchModal;
