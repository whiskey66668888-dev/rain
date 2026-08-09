import { cn } from '@/utils';
import { EBetHistoryTab } from '@/apis/commonSports/constants';
import { useBetHistoryContext } from '@/common/hooks/betHistory/context/BetHistoryContext';
import Empty from '@/common/components/Empty';
import Skeleton from '@/common/components/Skeleton';
import { COLS_SETTLED, COLS_UNSETTLED, COLS_RESERVE } from './colDefs';
import { OrderRow } from './OrderRow';
import TableStats from './TableStats';
import clsx from 'clsx';
import './index.scss';

const thClass = 'px-12px py-12px text-[var(--Text-800)] font-400 whitespace-nowrap';

const BetHistoryTable = () => {
  const { activeTab, list, isLoading } = useBetHistoryContext();

  const cols =
    activeTab === EBetHistoryTab.SETTLED
      ? COLS_SETTLED
      : activeTab === EBetHistoryTab.RESERVE
        ? COLS_RESERVE
        : COLS_UNSETTLED;

  const colgroup = (
    <colgroup>
      {cols.map((col, i) => (
        <col key={i} style={{ width: col.width }} />
      ))}
    </colgroup>
  );

  return (
    <div
      className={clsx(
        'flex-1 flex flex-col overflow-hidden bg-[var(--Background-300)] rounded-12px p-12px',
        'text-left text-[var(--Text-Main-10)] _tf[12] leading-[1.33]',
      )}
    >
      {/* 固定表头 — scrollbar-gutter 与下方保持一致，列宽对齐 */}
      <div className="shrink-0 overflow-hidden" style={{ scrollbarGutter: 'stable' }}>
        <table className="w-full border-collapse table-fixed">
          {colgroup}
          <thead>
            <tr>
              {cols.map((col) => (
                <th
                  key={col.value}
                  className={cn(
                    thClass,
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
        </table>
      </div>

      {/* 可滚动 tbody 区域 */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarGutter: 'stable' }}>
        {isLoading ? (
          <div className="flex flex-col gap-8px px-16px">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} type="base" baseClassName="h-48px" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <Empty variant="card" />
        ) : (
          <table className="w-full border-collapse table-fixed">
            {colgroup}
            <tbody>
              {list.map((order, i) => (
                <OrderRow
                  key={order.orderId}
                  order={order}
                  rowIndex={i}
                  cols={cols}
                  isOdd={i % 2 === 0}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 统计栏目 */}
      <TableStats />
    </div>
  );
};

export default BetHistoryTable;
