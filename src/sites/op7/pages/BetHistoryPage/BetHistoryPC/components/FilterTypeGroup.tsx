import { EBetHistoryQueryType } from '@/apis/commonSports/constants';
import CheckBox from '@/common/components/CheckBox';

const FilterTypeGroup = ({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: EBetHistoryQueryType }[];
  value: EBetHistoryQueryType | undefined;
  onChange: (v: EBetHistoryQueryType) => void;
}) => (
  <>
    {options.map((opt) => (
      <div
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className="shrink-0 flex items-center gap-4px"
      >
        <CheckBox value={opt.value === value} />
        <div className="_tf[12] leading-[1.33] text-[var(--Text-800)]">{opt.label}</div>
      </div>
    ))}
  </>
);

export default FilterTypeGroup;
