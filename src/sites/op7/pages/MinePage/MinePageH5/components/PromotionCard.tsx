import SwiperCarouseResource, { PidType } from '@/sites/op7/components/SwiperCarouseResource';

/** 主 Banner（mine）+ 底部条 Banner（mineBottom），对齐参考稿双运营位 */
const PromotionCard = () => {
  return (
    <div className="flex flex-col gap-8px">
      <div className="relative height-[100px] overflow-hidden rounded-12px">
        <SwiperCarouseResource height="100" pid={PidType.Mine} />
      </div>
      {/* <div className="relative h-[56px] overflow-hidden rounded-12px bg-[#E8F2FC]">
        <SwiperCarouseResource height="56px" pid={PidType.MineBottom} />
      </div> */}
    </div>
  );
};

export default PromotionCard;
