import { EBetHistoryTab, EVenue } from '@/apis/commonSports/constants';
import { useBetHistoryContext } from '@/common/hooks/betHistory/context/BetHistoryContext';
import { useBetHistoryBaseMethods } from '@/common/hooks/betHistory/useBetHistoryMethods';
import Pagination from '@/common/components/Pagination';

const TableFooter = () => {
  const { activeTab, activeVenue, queryParams, total } = useBetHistoryContext();
  const { changePage } = useBetHistoryBaseMethods();

  // FB 预约注单接口一次性返回全部，无需分页；OB 按页返回，没有分页器就只能看到第一页
  if (activeTab === EBetHistoryTab.RESERVE && activeVenue !== EVenue.OB) return null;

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
