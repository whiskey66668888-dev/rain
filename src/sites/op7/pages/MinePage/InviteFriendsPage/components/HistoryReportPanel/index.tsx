import dayjs from 'dayjs';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DotLoading, InfiniteScroll, PullToRefresh } from 'antd-mobile';

import MyTitle from '../MyTitle';
import TabList from '../TabList';
import ListTable from '../ListTable';
import { getCycle, upVipList } from '@/apis/origin/inviteFriends';
import { toDisplayString } from '../../stringUtils';
import styles from '../../report.module.scss';

const PAGE_SIZE = 20;

function asRecord(d: unknown): Record<string, unknown> {
  return d && typeof d === 'object' ? (d as Record<string, unknown>) : {};
}

interface HistoryReportPanelProps {
  /** PC 弹窗内为 true，隐藏与 ModalHeader 重复的副标题 */
  isPc?: boolean;
}

/**
 * 直升历史列表，供独立页与邀请子页弹窗复用。
 */
function HistoryReportPanel({ isPc }: HistoryReportPanelProps) {
  const [tab, setTab] = useState(0);
  const [list, setList] = useState<Record<string, unknown>[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [loading, setLoading] = useState(false);
  const skipTabEffect = useRef(true);
  const [cycleList, setCycleList] = useState<Array<{ beginTime?: string; endTime?: string }>>([
    { beginTime: '', endTime: '' },
    { beginTime: '', endTime: '' },
    { beginTime: '', endTime: '' },
    { beginTime: '', endTime: '' },
  ]);

  const getTimeParams = useCallback(() => {
    return {
      beginTime: cycleList[tab]?.beginTime,
      endTime: cycleList[tab]?.endTime,
    };
  }, [cycleList, tab]);

  const loadPage = useCallback(
    async (page: number, init = false) => {
      const { beginTime, endTime } = getTimeParams();
      if (!beginTime || !endTime) return null;
      setLoading(true);
      try {
        const res = await upVipList({
          pageNumber: page,
          pageSize: PAGE_SIZE,
          beginTime,
          endTime,
        });
        const data = asRecord(res?.data);
        const rows = (data?.list as Record<string, unknown>[]) ?? [];
        const totalSize = Number(data?.totalSize ?? 0);
        const totalPage = Number(data?.totalPage ?? 0);
        if (init) {
          setList(rows);
          setPageNumber(page);
          setHasMore(rows.length < totalSize && (totalPage > page || rows.length > 0));
        } else {
          setList((prev) => {
            const merged = [...prev, ...rows];
            setHasMore(merged.length < totalSize && page < totalPage);
            return merged;
          });
          setPageNumber(page);
        }
        return data;
      } finally {
        setLoading(false);
      }
    },
    [getTimeParams],
  );

  const onRefresh = useCallback(async () => {
    if (!cycleList[tab]?.beginTime || !cycleList[tab]?.endTime) return;
    setShowSkeleton(true);
    setList([]);
    setPageNumber(1);
    setRefreshing(true);
    try {
      await loadPage(1, true);
    } finally {
      setRefreshing(false);
    }
  }, [cycleList, loadPage, tab]);

  const loadMore = useCallback(async () => {
    if (loading || refreshing || !cycleList[tab]?.beginTime) return;
    setShowSkeleton(false);
    await loadPage(pageNumber + 1, false);
  }, [cycleList, loadPage, loading, pageNumber, refreshing, tab]);

  useEffect(() => {
    void (async () => {
      const res = await getCycle();
      const data = asRecord(res?.data);
      const currentCycle = asRecord(data.currentCycle);
      const previousCycle = asRecord(data.previousCycle);
      const monthTime = asRecord(data.monthTime);
      const allTimeMap = asRecord(data.allTimeMap);
      setCycleList([
        {
          beginTime: toDisplayString(currentCycle.begin, ''),
          endTime: toDisplayString(currentCycle.end, ''),
        },
        {
          beginTime: toDisplayString(previousCycle.begin, ''),
          endTime: toDisplayString(previousCycle.end, ''),
        },
        {
          beginTime: toDisplayString(monthTime.begin, ''),
          endTime: toDisplayString(monthTime.end, ''),
        },
        {
          beginTime: toDisplayString(allTimeMap.begin, ''),
          endTime: toDisplayString(allTimeMap.end, ''),
        },
      ]);
    })();
  }, []);

  useEffect(() => {
    if (!cycleList[tab]?.beginTime || !cycleList[tab]?.endTime) return;
    if (skipTabEffect.current) {
      skipTabEffect.current = false;
      void loadPage(1, true);
      return;
    }
    void onRefresh();
  }, [cycleList, loadPage, onRefresh, tab]);

  const columns: {
    title: string;
    dataIndex: string;
    className?: string;
    headerClassName?: string;
    render: (
      value: unknown,
      row?: Record<string, unknown>,
      idx?: number,
      type?: string,
    ) => ReactNode;
  }[] = [
    {
      title: '申请时间',
      dataIndex: 'postTime',
      className: styles.timeCol,
      headerClassName: styles.timeHeaderCol,
      render: (value: unknown) => {
        const text = toDisplayString(value, '');
        return text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-';
      },
    },
    {
      title: '旧等级',
      dataIndex: 'oldVip',
      render: (value: unknown) => toDisplayString(value, '-'),
    },
    {
      title: '账号',
      dataIndex: 'loginName',
      className: styles.nameCol,
      headerClassName: styles.nameHeaderCol,
      render: (value: unknown) => toDisplayString(value, '-'),
    },
    {
      title: '新等级',
      dataIndex: 'upVip',
      className: styles.black,
      render: (value: unknown) => toDisplayString(value, '-'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      className: styles.statusCol,
      render: (value: unknown) => {
        switch (value) {
          case 0:
            return <span className={styles.statusPending}>审核中</span>;
          case 1:
            return <span className={styles.statusApproved}>审核通过</span>;
          case -1:
            return <span className={styles.statusRejected}>审核拒绝</span>;
          case 9:
            return <span className={styles.statusCompleted}>完成</span>;
          default:
            return <span>-</span>;
        }
      },
    },
  ];

  const timeRangeText = useMemo(() => {
    if (!cycleList[tab]?.beginTime || !cycleList[tab]?.endTime) return '';
    return `${cycleList[tab].beginTime} - ${cycleList[tab].endTime}`;
  }, [cycleList, tab]);

  return (
    <>
      {!isPc && <MyTitle leftContent="直升历史记录" />}
      <TabList tabs={['本周', '上周', '本月', '全部']} value={tab} onChange={setTab} />
      <PullToRefresh onRefresh={onRefresh}>
        <ListTable
          columns={columns}
          dataSource={list}
          timeRange={timeRangeText}
          loading={loading && showSkeleton}
        />
        <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
          {(hm) =>
            list.length === 0 ? null : (
              <div className="py-12px text-center text-[var(--Text-800)] _tf[12]">
                {hm ? (
                  <span className="inline-flex items-center gap-6px">
                    加载中
                    <DotLoading />
                  </span>
                ) : (
                  <span>—— 我是底线 ——</span>
                )}
              </div>
            )
          }
        </InfiniteScroll>
      </PullToRefresh>
    </>
  );
}

export default HistoryReportPanel;
