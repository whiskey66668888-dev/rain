import dayjs from 'dayjs';
import type { ReactNode } from 'react';
import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DotLoading, InfiniteScroll, Popover, PullToRefresh } from 'antd-mobile';

import MyTitle from '../MyTitle';
import TabList from '../TabList';
import ListTable from '../ListTable';
import { getCycle, getInviteMemberList } from '@/apis/origin/inviteFriends';
import { handleContent } from '@/utils/format/handleContent';
import { toDisplayString } from '../../stringUtils';
import styles from '../../report.module.scss';
import { CloseSvg } from '@/sites/op7/components/SvgIcons';

const PAGE_SIZE = 20;

function asRecord(d: unknown): Record<string, unknown> {
  return d && typeof d === 'object' ? (d as Record<string, unknown>) : {};
}

/**
 * 好友邀请记录列表，供独立页与邀请子页弹窗复用。
 */
interface InvitationReportPanelProps {
  isPc?: boolean;
}
function InvitationReportPanel({ isPc }: InvitationReportPanelProps) {
  const [tab, setTab] = useState(0);
  const [list, setList] = useState<Record<string, unknown>[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [inputValue, setInputValue] = useState('');
  const skipTabEffect = useRef(true);
  const [cycleList, setCycleList] = useState<Array<{ beginTime?: string; endTime?: string }>>([
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
        const res = await getInviteMemberList({
          pageNumber: page,
          pageSize: PAGE_SIZE,
          beginTime,
          endTime,
          loginName: searchKeyword || undefined,
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
    [getTimeParams, searchKeyword],
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

  const handleSearch = useCallback(() => {
    setSearchKeyword(inputValue.trim());
    setList([]);
    setPageNumber(1);
  }, [inputValue]);

  useEffect(() => {
    if (!cycleList[tab]?.beginTime || !cycleList[tab]?.endTime) return;
    void loadPage(1, true);
  }, [loadPage, searchKeyword, tab, cycleList]);

  const clearSearch = () => {
    setSearchKeyword('');
    setInputValue('');
    setList([]);
    setPageNumber(1);
  };

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
      title: '账号(等级)',
      dataIndex: 'vipLevel',
      className: styles.nameCol,
      render: (value: unknown, row?: Record<string, unknown>) =>
        `${toDisplayString(row?.loginName, '-')}(${toDisplayString(value, '-')})`,
    },
    {
      title: '注册时间',
      dataIndex: 'resisterTime',
      className: styles.timeCol,
      headerClassName: styles.timeHeaderCol,
      render: (value: unknown) => {
        const text = toDisplayString(value, '');
        return text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-';
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (value: unknown) => {
        if ([0, 1, 2, 3].includes(Number(value))) {
          return <span className={styles.black}>已注册</span>;
        }
        if (Number(value) === 9) {
          return <span className={styles.green}>已绑定</span>;
        }
        if (Number(value) === -9) {
          return <span className={styles.red}>已失效</span>;
        }
        return <span>-</span>;
      },
    },
  ];

  const timeRangeText = useMemo(() => {
    if (!cycleList[tab]?.beginTime || !cycleList[tab]?.endTime) return '';
    return `${cycleList[tab].beginTime} - ${cycleList[tab].endTime}`;
  }, [cycleList, tab]);

  return (
    <>
      {!isPc && <MyTitle leftContent="好友邀请记录" className="mt-0!" />}
      <TabList tabs={['本周期', '上周期', '全部']} value={tab} onChange={setTab} />

      <div className={styles.searchSpecInput}>
        <div className={styles.searchSpecContent}>
          <div className={styles.searchSpecIcon}>
            <svg
              onClick={handleSearch}
              xmlns="http://www.w3.org/2000/svg"
              width="17"
              height="17"
              viewBox="0 0 17 17"
              fill="none"
            >
              <path
                d="M13.3592 12.1808L16.5747 15.3956C16.77 15.5909 16.77 15.9075 16.5747 16.1028L16.1028 16.5747C15.9075 16.77 15.5909 16.77 15.3956 16.5747L12.1808 13.3592C10.8531 14.4235 9.20167 15.0024 7.5 15C3.36 15 0 11.64 0 7.5C0 3.36 3.36 0 7.5 0C11.64 0 15 3.36 15 7.5C15.0024 9.20167 14.4235 10.8531 13.3592 12.1808ZM11.6875 11.5625C12.7451 10.4749 13.3357 9.01702 13.3333 7.5C13.3333 4.27667 10.7225 1.66667 7.5 1.66667C4.27667 1.66667 1.66667 4.27667 1.66667 7.5C1.66667 10.7225 4.27667 13.3333 7.5 13.3333C9.01702 13.3357 10.4749 12.7451 11.5625 11.6875L11.6875 11.5625Z"
                fill="var(--Text-700)"
              />
            </svg>
          </div>
          <input
            className={clsx(styles.searchSpecPlaceholder, '_tf[14]')}
            type="text"
            placeholder="输入好友账号"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
        </div>
        {!!inputValue && (
          <button
            type="button"
            className="flex h-20px w-20px items-center justify-center border-none p-0 bg-[var(--Line-100)] rounded-full"
            aria-label="关闭"
            onClick={clearSearch}
          >
            <CloseSvg className="w-8px h-8px text-[var(--Text-Main-10)]" />
          </button>
        )}
      </div>

      <PullToRefresh onRefresh={onRefresh}>
        <ListTable
          columns={columns}
          dataSource={list}
          timeRange={timeRangeText}
          loading={loading && showSkeleton}
          timeRangePopover={
            <Popover
              className={styles.invitePopover}
              content={
                <div className={styles.popOverContent}>
                  <div className={styles.popOverTitle}>条件</div>
                  <div
                    className={styles.popOverDesc}
                    dangerouslySetInnerHTML={{
                      __html: handleContent(
                        '体育/棋牌/电竞/真人/电子任一完成有效流水≥3888（不包含不计算返水的游戏），受邀人如未在20天内达成有效绑定条件，系统将会自动解除邀请关系。',
                      ),
                    }}
                  />
                </div>
              }
              placement="right"
              trigger="click"
            >
              <span className={clsx(styles.timeRangeHelp, '_tf[10]')}>?</span>
            </Popover>
          }
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

export default InvitationReportPanel;
