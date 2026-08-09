import clsx from 'clsx';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DotLoading, InfiniteScroll } from 'antd-mobile';

import MyTitle from '../MyTitle';
import TabList from '../TabList';
import ListTable from '../ListTable';
import { toast } from '@/common/components/Toast';

import { getBonusStatement, getCycle, getRewards } from '@/apis/origin/inviteFriends';
import { toDisplayString } from '../../stringUtils';
import styles from '../../report.module.scss';
import MyPullToRefresh from '@/common/components/MyPullToRefresh';

const PAGE_SIZE = 20;

function asRecord(d: unknown): Record<string, unknown> {
  return d && typeof d === 'object' ? (d as Record<string, unknown>) : {};
}

interface BonusReportPanelProps {
  isPc?: boolean;
}

/**
 * 奖金报表列表（未领取 / 全部），供独立页与首页弹窗复用。
 */
function BonusReportPanel({ isPc }: BonusReportPanelProps) {
  const [tab, setTab] = useState(0);
  const [list, setList] = useState<Record<string, unknown>[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [currentRewardId, setCurrentRewardId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const skipTabEffect = useRef(true);

  const getFilterParams = useCallback(
    () => ({
      type: tab === 0 ? 1 : 2,
    }),
    [tab],
  );

  const loadPage = useCallback(
    async (page: number, init = false) => {
      setLoading(true);
      try {
        const params = {
          pageNumber: page,
          pageSize: PAGE_SIZE,
          ...getFilterParams(),
        };
        const res = await getBonusStatement(params);
        const data = asRecord(res?.data);
        const rows = (data?.list as Record<string, unknown>[]) || [];
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
    [getFilterParams],
  );

  const onRefresh = useCallback(async () => {
    setShowSkeleton(true);
    setList([]);
    setPageNumber(1);
    setRefreshing(true);
    try {
      await loadPage(1, true);
    } finally {
      setRefreshing(false);
    }
  }, [loadPage]);

  const loadMore = useCallback(async () => {
    if (loading || refreshing) return;
    setShowSkeleton(false);
    const next = pageNumber + 1;
    await loadPage(next, false);
  }, [loadPage, loading, pageNumber, refreshing]);

  useEffect(() => {
    void (async () => {
      await getCycle();
      await loadPage(1, true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 仅挂载时拉首屏
  }, []);

  useEffect(() => {
    if (skipTabEffect.current) {
      skipTabEffect.current = false;
      return;
    }
    void onRefresh();
  }, [tab, onRefresh]);

  const claimReward = async (id: number) => {
    if (currentRewardId !== null) return;
    setCurrentRewardId(id);
    try {
      await getRewards({ id });
      toast({ type: 'success', description: '领取成功' });
      await onRefresh();
    } catch {
      // request 已提示
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
      render: (value: unknown) => toDisplayString(value, '合计'),
    },
    {
      title: '奖励类型',
      dataIndex: 'bonusType',
      render: (value: unknown) => {
        if (value === 1) return '首存奖励';
        if (value === 2) return '累计奖励';
        return '-';
      },
    },
    {
      title: '奖励金额(元)',
      dataIndex: 'bonusCash',
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
      dataIndex: 'bonusStatus',
      className: styles.statusCol,
      render: (value: unknown, row?: Record<string, unknown>, _idx?: number, type?: string) => {
        if (!row) return null;
        if (type === 'summary') {
          return value as ReactNode;
        }
        if (value === 1) {
          return <span className={styles.black}>待完成</span>;
        }
        if (value === 2) {
          if (row.nextCycle === 1) {
            return <span>延期审核</span>;
          }
          return <span className={styles.orange}>待审核</span>;
        }
        if (value === 4) {
          return <span className={styles.fail}>审核拒绝</span>;
        }
        if (value === 5) {
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
                void claimReward(row.id as number);
              }}
            >
              {isLoading ? <DotLoading color="var(--White-100)" /> : '领取'}
            </span>
          );
        }
        if (value === 6) {
          return <span className={styles.statusSuccess}>已领取</span>;
        }
        if (value === -1) {
          return <span className={styles.black}>已过期</span>;
        }
        return null;
      },
    },
  ];

  const calculatedTotalBonus = useMemo(() => {
    if (!list.length) return '0.00';
    const total = list.reduce((sum, item) => {
      if (item.bonusStatus !== 5 && item.bonusStatus !== 6) return sum;
      const v = parseFloat(toDisplayString(item.bonusCash, '0'));
      return sum + (Number.isNaN(v) ? 0 : v);
    }, 0);
    const truncated = Math.floor(total * 100) / 100;
    return truncated.toFixed(2);
  }, [list]);

  const summary = {
    loginName: <b className="text-[var(--Text-Main-10)]">合计</b>,
    bonusType: '-',
    bonusCash: calculatedTotalBonus,
    bonusStatus: '-',
  };

  return (
    <>
      {!isPc && <MyTitle leftContent="奖金报表记录" />}
      <TabList tabs={['未领取', '全部']} value={tab} onChange={setTab} />
      <MyPullToRefresh onRefresh={onRefresh}>
        <ListTable
          columns={columns}
          dataSource={list}
          summary={summary}
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
      </MyPullToRefresh>
    </>
  );
}

export default BonusReportPanel;
