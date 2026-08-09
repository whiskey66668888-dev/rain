import type { ResultLeagueOption } from '../../utils/resultLeagueFilterStorage';
import ResultSearchCondition, { type ResultSearchConditionValue } from '../ResultSearchCondition';

interface SubTabBarResultsProps {
  value: ResultSearchConditionValue;
  leagueOptions: ResultLeagueOption[];
  onChange: (value: ResultSearchConditionValue) => void;
  resultListCollapsed: boolean;
  onToggleResultListCollapsed: () => void;
}

const SubTabBarResults = ({
  value,
  leagueOptions,
  onChange,
  resultListCollapsed,
  onToggleResultListCollapsed,
}: SubTabBarResultsProps) => {
  return (
    <ResultSearchCondition
      leagueOptions={leagueOptions}
      defaultValue={value}
      onChange={onChange}
      resultListCollapsed={resultListCollapsed}
      onToggleResultListCollapsed={onToggleResultListCollapsed}
    />
  );
};

export default SubTabBarResults;
