import { CircleTipDownSvg } from '@/sites/op7/components/SvgIcons';

export interface MarketStatusTipsProps {
  /** 是否盘口变更 */
  marketValueChange?: boolean;
  /** 是否盘口关闭 */
  oddsClosed?: boolean;
}

/** 投注项盘口状态提示：盘口变更、盘口关闭 */
const MarketStatusTips = ({ marketValueChange, oddsClosed }: MarketStatusTipsProps) => (
  <>
    {!oddsClosed && !!marketValueChange && (
      <div className="bg-[var(--Red-100)] px-10px py-8px flex items-center gap-4px">
        <CircleTipDownSvg className="w-12px h-12px text-[var(--Red-300)]" />
        <p className="_tf[12] text-[var(--Red-300)] leading-[1]">盘口变更</p>
      </div>
    )}
    {oddsClosed && (
      <div className="bg-[var(--Background-30)] px-10px py-8px flex items-center gap-4px">
        <CircleTipDownSvg className="w-12px h-12px text-[var(--White-100)]" />
        <p className="_tf[12] text-[var(--White-100)] leading-[1]">盘口关闭</p>
      </div>
    )}
  </>
);

export default MarketStatusTips;
