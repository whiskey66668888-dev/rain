import { useOpenMessageCenter } from '@/common/hooks/messageCenter/useOpenMessageCenter';
import { ArrowRightSvg, SpeakerSvg } from '@/sites/op7/components/SvgIcons';
import { ENoticeTabKey } from '@/core/store/slices/messageCenterSlice';
import { useMessageCenterMethods } from '@/common/hooks/messageCenter/useMessageCenterMethods';
import { useMount } from 'ahooks';
import { useAppSelector } from '@/core/store/hooks';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

const AnnouncementBar = () => {
  const fbNoticeList = useAppSelector((state) => state.messageCenter.fbNoticeList);
  const { openMessageCenter } = useOpenMessageCenter();
  const { getFBNoticeList } = useMessageCenterMethods();

  const handleClick = () => {
    openMessageCenter({ initialSubTab: ENoticeTabKey.SPORT_NOTICE });
  };

  useMount(() => {
    getFBNoticeList();
  });

  if (!fbNoticeList.length) {
    return null;
  }

  return (
    <div
      className="flex items-center gap-8px bg-[var(--Background-500)] rounded-full px-12px overflow-hidden my-4px"
      onClick={handleClick}
    >
      <SpeakerSvg className="shrink-0 w-15px h-15px text-[var(--ThemeColor-Main)]" />
      <Swiper
        className="flex-1 h-24px"
        direction="vertical"
        modules={[Autoplay]}
        loop={fbNoticeList.length > 1}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        allowTouchMove={false}
      >
        {fbNoticeList.map((item) => (
          <SwiperSlide key={item.id}>
            <div className="_tf[12] leading-[24px] text-[var(--Text-Main-10)] truncate">
              赛事公告：{item.co}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <ArrowRightSvg className="shrink-0 w-14px h-14px text-[var(--Text-700)]" />
    </div>
  );
};

export default AnnouncementBar;
