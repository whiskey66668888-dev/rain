import React, { useState, useMemo, useEffect } from 'react';
// components
import Icon from '@/common/components/Icon';
import SearchModal from '../SearchModal';
import SimpleTabList from './components/simpleTabList';
import LeagueTabsH5 from '../LeagueTabs/LeagueTabsH5';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

import { useAppSelector } from '@/core/store/hooks';

// styles
import styles from './index.module.scss';
import { PlayType } from '@/apis/commonSports/constants';
import useSportsMainListControl from '@/common/hooks/useSportsMainListControl';
import clsx from 'clsx';
import { ClientOnly } from '@/common/components/ClientOnly';
import { useSportsMainListData } from '@/common/hooks/useSportsMainListData';
import { useMemoizedFn } from 'ahooks';

const SearchBarH5: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const { playType, orderBy, collapsedAll, filterTime, isSimpleOdds, filterByLeagueIds } =
    useAppSelector((state) => state.sport.mainList.settings);
  const { listData, isLoading } = useSportsMainListData();
  // const { refetch, isFetching } = useSportsMainListData();
  // const [isRefreshing, setIsRefreshing] = useState(false);
  // useEffect(() => {
  //   if (!isFetching) {
  //     setIsRefreshing(false);
  //   }
  // }, [isFetching]);

  const activeTime = useMemo(() => {
    if (!filterTime) return 0;
    if (filterTime.length === 0) return 0;

    return filterTime[0];
  }, [filterTime]);

  // 切换是关闭
  useEffect(() => {
    setCalendarVisible(false);
  }, [playType]);

  const { changeCollapsedAll, changeOrderBy, changeFilterTime } = useSportsMainListControl();

  const changeTime = useMemoizedFn((time: number[]) => {
    changeFilterTime(time);
    setCalendarVisible(false);
  });

  if (listData.length === 0 && !isLoading) return null;

  if ([PlayType.Follow].includes(playType) && isSimpleOdds)
    return <SimpleTabList className={styles.followSimpleTabList} />;

  return (
    <div
      className={clsx(
        styles.searchBar,
        PlayType.Champion == playType ? styles.championSearchBar : '',
      )}
    >
      <div className={styles.mainSearch}>
        <div className={styles.left}>
          <span className={styles.icon} onClick={() => setModalVisible(true)}>
            <Icon
              src="/images/common/search.svg"
              size="16px"
              color={filterByLeagueIds.length ? 'var(--ThemeColor-Main)' : 'var(--Text-800)'}
            />
          </span>
          {playType == PlayType.Early && (
            <div className={clsx(styles.button, '_tf[12]')} style={{ marginRight: '0px' }}>
              <span>{activeTime === 0 ? '全部' : dayjs(activeTime).format('MM/DD')}</span>
              <Icon
                src="/images/common/calendar.svg"
                size="16px"
                color="var(--ThemeColor-Main)"
                onClick={() => setCalendarVisible(!calendarVisible)}
              />
            </div>
          )}
          <div className={clsx(styles.button, '_tf[12]')}>
            <span className={clsx(orderBy === 1 && styles.active)} onClick={() => changeOrderBy(1)}>
              联赛
            </span>
            <Icon src="/images/common/sort.svg" size="14px" color="var(--ThemeColor-Main)" />
            <span className={clsx(orderBy === 0 && styles.active)} onClick={() => changeOrderBy(0)}>
              时间
            </span>
          </div>
          <ClientOnly>{isSimpleOdds && <SimpleTabList />}</ClientOnly>
          {/* 固定联赛快捷筛选，占「联赛/时间」到右侧收起按钮之间的剩余空间 */}
          <ClientOnly>
            <LeagueTabsH5 />
          </ClientOnly>
        </div>

        <div className={styles.right}>
          {/* <span
            className={clsx(styles.iconExpandAll, {
              [styles.refreshing as string]: isRefreshing,
            })}
            onClick={() => {
              void refetch();
              setIsRefreshing(true);
            }}
          >
            <Icon src="/images/common/refresh.svg" size="16px" color="var(--Text-Main-10)" />
          </span> */}
          <span
            className={clsx(styles.iconExpandAll, {
              [styles.collapsed as string]: collapsedAll,
            })}
            onClick={() => changeCollapsedAll(!collapsedAll)}
          >
            <Icon src="/images/common/arrows_up.svg" size="16px" color="var(--Text-800)" />
          </span>
        </div>

        <SearchModal visible={modalVisible} onClose={() => setModalVisible(false)} />
      </div>

      {calendarVisible && (
        <div className={styles.calendar}>
          <div className={clsx(styles.calendarWrapper, '_tf[11]')}>
            <span
              className={clsx(styles.calendarItem, activeTime === 0 && styles.active)}
              onClick={() => changeTime([])}
            >
              全部
            </span>
            {Array(7)
              .fill(null)
              .map((_, index) => {
                const date = dayjs()
                  .locale('zh-cn')
                  .add(index + 1, 'day');
                const startTime = date.startOf('day').valueOf();
                const endTime = date.endOf('day').valueOf();
                const isActive = startTime === activeTime;
                return (
                  <span
                    key={index}
                    className={clsx(styles.calendarItem, isActive && styles.active)}
                    onClick={() => changeTime([startTime, endTime])}
                  >
                    <span>{date.format('MM/DD')}</span>
                    <span>{date.format('dddd')}</span>
                  </span>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBarH5;
