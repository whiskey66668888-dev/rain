import clsx from 'clsx';
import { Skeleton } from 'antd-mobile';
import { CSSProperties, ReactNode, useMemo } from 'react';
import { useEffect, useState } from 'react';
import Empty from '@common/components/Empty';
import styles from './index.module.scss';
import { useAppSelector } from '@core/store/hooks';

interface Column {
  title: React.ReactNode;
  dataIndex: string;
  render?: (
    value: unknown,
    row?: Record<string, unknown>,
    rowIndex?: number,
    type?: 'body' | 'summary' | 'header',
  ) => ReactNode;
  className?: string;
  headerClassName?: string;
}

interface ListTableProps {
  columns: Column[];
  dataSource: Record<string, unknown>[];
  summary?: Record<string, unknown>;
  timeRange?: string;
  timeRangePopover?: React.ReactNode;
  emptyText?: React.ReactNode;
  loading?: boolean;
  skeletonRowCount?: number;
}

const skeletonCellStyle = {
  '--width': '72%',
  '--height': '14px',
  '--border-radius': '4px',
} as CSSProperties;

function rowStableKey(row: Record<string, unknown> | undefined, index: number): string {
  if (!row) return `sk-ph-${index}`;
  const id = row.id;
  if (typeof id === 'string' || typeof id === 'number' || typeof id === 'bigint') {
    return String(id);
  }
  return `sk-row-${index}`;
}

const ListTable: React.FC<ListTableProps> = ({
  columns,
  dataSource,
  summary,
  timeRange,
  timeRangePopover,
  loading = false,
  skeletonRowCount = 3,
}) => {
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = screenBreakpoint === 'md';
  const dataList = useMemo(() => {
    return dataSource;
  }, [dataSource]);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const skeletonRowKeys = useMemo(() => {
    if (!loading) return [];
    if (dataList.length > 0) {
      return dataList.map((row, i) => rowStableKey(row, i));
    }
    return Array.from({ length: skeletonRowCount }, (_, i) => `sk-ph-${i}`);
  }, [loading, dataList, skeletonRowCount]);

  const showSummarySkeleton = Boolean(loading && summary && dataList.length > 0);

  const renderTimeRange = () => {
    if (!timeRange) return null;
    return (
      <div className={clsx(styles.timeRange, '_tf[12]')}>
        <div className={styles.timeRangeContent}>
          <span>数据时间：{timeRange}</span>
          {timeRangePopover && <div className={styles.timeRangePopover}>{timeRangePopover}</div>}
        </div>
      </div>
    );
  };

  const renderHeader = () => (
    <div className={styles.tableHeader}>
      {columns.map((col, idx) => (
        <div key={col.dataIndex || idx} className={clsx(styles.th, '_tf[12]', col.headerClassName)}>
          {col.title}
        </div>
      ))}
    </div>
  );

  const showEmpty = !loading && dataList.length === 0;

  return (
    <div
      className={clsx(
        styles.listTable,
        !isMobile && 'min-h-396px max-h-616px',
        showEmpty &&
          `flex items-center justify-center w-full bg-transparent! ${isMobile ? 'min-h-78dvh' : ''}`,
      )}
    >
      {showEmpty ? (
        isClient ? (
          <div className={styles.noDataWrap}>
            <Empty />
          </div>
        ) : null
      ) : (
        <>
          {!loading && renderTimeRange()}
          {renderHeader()}
          <div className={styles.tableBody}>
            {loading ? (
              <>
                {skeletonRowKeys.map((rowKey) => (
                  <div className={styles.tr} key={rowKey}>
                    {columns.map((col, colIdx) => (
                      <div
                        key={String(col.dataIndex || colIdx)}
                        className={clsx(styles.td, '_tf[12]', col.className)}
                      >
                        <div className="flex min-h-[18px] w-full items-center justify-center">
                          <Skeleton animated className="max-w-full" style={skeletonCellStyle} />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                {showSummarySkeleton && (
                  <div className={clsx(styles.tr, styles.summaryRow)} key="sk-summary">
                    {columns.map((col, colIdx) => (
                      <div
                        key={String(col.dataIndex || colIdx)}
                        className={clsx(styles.td, '_tf[12]', col.className)}
                      >
                        <div className="flex min-h-[18px] w-full items-center justify-center">
                          <Skeleton animated className="max-w-full" style={skeletonCellStyle} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                {dataList.map((row, rowIdx) => (
                  <div className={styles.tr} key={rowStableKey(row, rowIdx)}>
                    {columns.map((col, colIdx) => (
                      <div
                        key={col.dataIndex || colIdx}
                        className={clsx(styles.td, '_tf[12]', col.className)}
                      >
                        {col.render
                          ? col.render(row[col.dataIndex], row, rowIdx, 'body')
                          : (row[col.dataIndex] as ReactNode)}
                      </div>
                    ))}
                  </div>
                ))}
                {summary && (
                  <div className={clsx(styles.tr, styles.summaryRow)}>
                    {columns.map((col, colIdx) => (
                      <div
                        key={col.dataIndex || colIdx}
                        className={clsx(styles.td, '_tf[12]', col.className)}
                      >
                        {col.render
                          ? col.render(summary[col.dataIndex], summary, -1, 'summary')
                          : (summary[col.dataIndex] as ReactNode)}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ListTable;
