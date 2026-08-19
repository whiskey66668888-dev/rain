import { useCallback } from 'react';
import { EBetHistoryQueryType, EVenue } from '@/apis/commonSports/constants';
import { useBetHistoryContext } from '@/common/hooks/betHistory/context/BetHistoryContext';
import { useBetHistoryBaseMethods } from '@/common/hooks/betHistory/useBetHistoryMethods';
import { unsettledTabs } from '@/common/hooks/betHistory/constants';
import FilterTypeGroup from './FilterTypeGroup';

const UnsettledSubFilter = () => {
  const { activeVenue, queryParams } = useBetHistoryContext();
  const { changeQueryType } = useBetHistoryBaseMethods();

  const handleTypeChange = useCallback(
    (type: EBetHistoryQueryType) => {
      if (queryParams?.queryType === type) {
        changeQueryType({ activeVenue, queryType: EBetHistoryQueryType.UNSETTLED });
      } else {
        changeQueryType({ activeVenue, queryType: type });
      }
    },
    [activeVenue, changeQueryType, queryParams?.queryType],
  );

  // 冠军 / 提前结算筛选依赖 FB 接口参数，OB 场馆不提供
  if (activeVenue !== EVenue.FB) return null;

  return (
    <div className="shrink-0 h-32px flex items-center gap-12px">
      <FilterTypeGroup
        options={unsettledTabs}
        value={queryParams?.queryType}
        onChange={handleTypeChange}
      />
    </div>
  );
};

export default UnsettledSubFilter;
