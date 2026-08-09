import clsx from 'clsx';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DotLoading, InfiniteScroll, PullToRefresh } from 'antd-mobile';

import MyTitle from '../MyTitle';
import TabList from '../TabList';
import ListTable from '../ListTable';
import { toast } from '@/common/components/Toast';

import { getCycle, getweekBonusList, weekBonusGet } from '@/apis/origin/inviteFriends';
import { toDisplayString } from '../../stringUtils';
import styles from '../../report.module.scss';

const PAGE_SIZE = 20;

function asRecord(d: unknown): Record<string, unknown> {
  return d && typeof d === 'object' ? (d as Record<string, unknown>) : {};
}

interface RebateReportPanelProps {
  isPc?: boolean;
}

/**
 * 返水报表列表（上期 / 本期），供独立页与首页弹窗复用。
 */
function RebateReportPanel({ isPc }: RebateReportPanelProps) {
  const [tab, setTab] = useState(0);
  const [list, setList] = useState<Record<string, unknown>[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [currentRewardId, setCurrentRewardId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [cycleList, setCycleList] = useState<{ beginTime?: string; endTime?: string }[]>([{}, {}]);

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
        const params = {
          pageNumber: page,
          pageSize: PAGE_SIZE,
          beginTime,
          endTime,
        };
        const res = await getweekBonusList(params);
        const data = asRecord(res?.data);
        const rows = (data?.list as Record<string, unknown>[]) || [];
        const totalSize = Number(data?.totalSize ?? 0);
        const totalPage = Number(data?.totalPage ?? 0);
        if (init) {
          setList(rows);
          setPageNumber(page);
          setHasMore(rows.length < totalSize);
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
      const previousCycle = asRecord(data.previousCycle);
      const allTimeMap = asRecord(data.allTimeMap);
      setCycleList([
        { beginTime: previousCycle?.begin as string, endTime: previousCycle?.end as string },
        { beginTime: allTimeMap?.begin as string, endTime: allTimeMap?.end as string },
      ]);
    })();
  }, []);

  useEffect(() => {
    if (!cycleList[tab]?.beginTime || !cycleList[tab]?.endTime) return;
    void loadPage(1, true);
  }, [cycleList, loadPage, tab]);

  const claimRebate = async (id: number) => {
    if (currentRewardId !== null) return;
    setCurrentRewardId(id);
    try {
      await weekBonusGet({ id });
      toast({ type: 'success', description: '领取成功' });
      await onRefresh();
    } catch {
      // handled
    } finally {
      setCurrentRewardId(null);
    }
  };

  const columns: {
    title: string;
    dataIndex: string;
    className?: string;
    render: (
      value: unknown,
      row?: Record<string, unknown>,
      idx?: number,
      type?: string,
    ) => ReactNode;
  }[] = [
    {
      title: '账号',
      dataIndex: 'loginName',
      render: (value: unknown) => toDisplayString(value),
    },
    {
      title: '返水类型',
      dataIndex: 'gameBigType',
      render: (value: unknown) => {
        switch (value) {
          case '1':
          case 1:
            return '真人';
          case '2':
          case 2:
            return '体育';
          case '3':
          case 3:
            return '电子';
          case '4':
          case 4:
            return '彩票';
          case '5':
          case 5:
            return '棋牌';
          case '6':
          case 6:
            return '电竞';
          default:
            return '-';
        }
      },
    },
    {
      title: '奖励(元)',
      dataIndex: 'rebatesCashWeek',
      className: styles.black,
      render: (value: unknown, _row?: Record<string, unknown>, _idx?: number, type?: string) => {
        const formattedValue =
          typeof value === 'number' ? value.toFixed(2) : toDisplayString(value, '');
        return type === 'summary' ? (
          <span className={styles.red}>{formattedValue}</span>
        ) : (
          formattedValue
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      className: styles.statusCol,
      render: (value: unknown, row?: Record<string, unknown>, _idx?: number, type?: string) => {
        if (type === 'summary') {
          return value as ReactNode;
        }
        if (!row) return null;
        switch (value) {
          case 0:
            return <span className={styles.orange}>审核中</span>;
          case 1: {
            const isLoading = currentRewardId === row.id;
            const isAnyLoading = currentRewardId !== null;
            const btnClassName = clsx(
              styles.btn,
              isAnyLoading && !isLoading ? styles.disabledBtn : '',
            );
            return (
              <span
                className={btnClassName}
                onClick={() => {
                  if (isAnyLoading) return;
                  void claimRebate(row.id as number);
                }}
              >
                {isLoading ? <DotLoading color="var(--White-100)" /> : '领取'}
              </span>
            );
          }
          case -1:
            return <span className={styles.red}>审核拒绝</span>;
          case 9:
            return <span className={styles.done}>已领取</span>;
          default:
            return <span>-</span>;
        }
      },
    },
  ];

  const calculatedTotalBonus = useMemo(() => {
    if (!list.length) return '0.00';
    const total = list.reduce((sum, item) => {
      const v = parseFloat(toDisplayString(item.rebatesCashWeek, '0'));
      return sum + (Number.isNaN(v) ? 0 : v);
    }, 0);
    return (Math.floor(total * 100) / 100).toFixed(2);
  }, [list]);

  const summary = {
    loginName: <b className="text-[var(--Text-Main-10)]">合计</b>,
    gameBigType: '-',
    rebatesCashWeek: calculatedTotalBonus,
    status: '-',
  };

  const timeRangeText = useMemo(() => {
    if (!cycleList[tab]?.beginTime || !cycleList[tab]?.endTime) return '';
    return `${cycleList[tab].beginTime} - ${cycleList[tab].endTime}`;
  }, [cycleList, tab]);

  return (
    <>
      {!isPc && <MyTitle leftContent="返水报表记录" />}
      <TabList tabs={['上期', '本期']} value={tab} onChange={setTab} />
      <PullToRefresh onRefresh={onRefresh}>
        <ListTable
          columns={columns}
          dataSource={list}
          summary={summary}
          timeRange={timeRangeText}
          loading={loading && showSkeleton}
        />
        {list.length > 0 && (
          <div className={styles.tips}>
            <div>说明：1.受邀人不产生奖金。</div>
            <div className={styles.tips2}>
              <span>说明：</span>
              2.此列表数据根据活动规则计算产生，解释权归平台所有。
            </div>
          </div>
        )}
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

export default RebateReportPanel;
