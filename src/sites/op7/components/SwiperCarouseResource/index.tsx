import { useMemo } from 'react';
import { useCarouselResQuery, PidType, CarouselItem } from '@/apis/origin/carouselRes';
import LazyImage from '@/common/components/LazyImage';
import { getSystemTheme } from '@/utils';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { openLoginModal } from '@/core/store/slices/authUISlice';
import 'swiper/css';
import 'swiper/css/pagination';
import { generatePath } from 'react-router-dom';

export { PidType };

interface SwiperCarouseProps {
  pid: PidType;
  height: string | number;
}

const SwiperCarouse: React.FC<SwiperCarouseProps> = ({ pid, height }) => {
  const dispatch = useAppDispatch();
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const navigate = useNavigateWithLanguage();
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const { data } = useCarouselResQuery({ pid: pid, isMobile: true });
  const list = data || [];
  const theme = useMemo(() => {
    return themeMode === 'system' ? getSystemTheme() : (themeMode ?? 'light');
  }, [themeMode]);

  const handleCarouse = (banner: CarouselItem) => {
    const target = isMobile ? banner.appTargetAddress : banner.webTargetAddress;
    if (banner.jumpType === 0) return;

    if (banner.jumpType === 1) {
      if (!isLogin) {
        dispatch(openLoginModal());
        return;
      }

      if (!target) return;
      if (isMobile) {
        navigate(target);
      } else {
        window.open(generatePath(target), '_blank');
      }
      return;
    }

    if (banner.jumpType === 2) {
      if (!target) return;
      window.open(target);
    }
  };
  const getImage = (item: CarouselItem) =>
    theme === 'dark' && item.nightMaterialContent
      ? item.nightMaterialContent
      : item.daytimeMaterialContent;

  return (
    <Swiper
      modules={[Autoplay, Pagination]}
      speed={800}
      loop={list.length > 1}
      autoplay={{
        delay: 6000,
        disableOnInteraction: false,
      }}
      roundLengths
    >
      {list.map((item) => (
        <SwiperSlide key={item.id} onClick={() => handleCarouse(item)}>
          <LazyImage
            className="w-full object-cover"
            style={{ height }}
            src={getImage(item)}
            alt=""
            lazy={false}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default SwiperCarouse;
