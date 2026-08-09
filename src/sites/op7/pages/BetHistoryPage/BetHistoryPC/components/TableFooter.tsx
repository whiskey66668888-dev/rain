import { EBetHistoryTab } from '@/apis/commonSports/constants';
import { useBetHistoryContext } from '@/common/hooks/betHistory/context/BetHistoryContext';
import { useBetHistoryBaseMethods } from '@/common/hooks/betHistory/useBetHistoryMethods';
import Pagination from '@/common/components/Pagination';

const TableFooter = () => {
  const { activeTab, activeVenue, queryParams, total } = useBetHistoryContext();
  const { changePage } = useBetHistoryBaseMethods();

  if (activeTab === EBetHistoryTab.RESERVE) return null;

  const pageSize = queryParams?.pageSize ?? 20;
  const pageNum = queryParams?.pageNum ?? 1;

  return (
    <div className="shrink-0 flex justify-end">
      <Pagination
        current={pageNum}
        total={total}
        pageSize={pageSize}
        pageSizeOptions={[20, 50, 100]}
        onChange={(page, size) => changePage(activeVenue, page, size)}
      />
    </div>
  );
};

export default TableFooter;
