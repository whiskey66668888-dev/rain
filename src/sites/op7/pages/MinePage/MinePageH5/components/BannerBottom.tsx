import { useCarouselResQuery, PidType } from '@/apis/origin/carouselRes';
import { useAuthNavigate } from '@/common/hooks/useAuthNavigate';
import SwiperCarouseResource from '@/sites/op7/components/SwiperCarouseResource';

import styles from './BannerBottom.module.scss';
import { PATHS } from '@/sites/op7/routes/paths';

/** 我的页底部运营位（pid=2）：有配置则轮播，无则「呼朋唤友」占位，对齐 emc-h5 mine/index/bannerBottom */
export default function BannerBottom() {
  const authNavigate = useAuthNavigate();
  const { data, isLoading } = useCarouselResQuery({ pid: PidType.MineBottom, isMobile: true });
  const list = data ?? [];

  const showCarousel = !isLoading && list.length > 0;

  const handleInviteClick = () => {
    authNavigate(PATHS.mineInviteFriends);
  };

  if (isLoading) {
    return <div className={styles.bannerBox} aria-hidden />;
  }

  if (showCarousel) {
    return (
      <div className={styles.bannerBox}>
        <div className="relative h-[56px] overflow-hidden rounded-[6px]">
          <SwiperCarouseResource height="56px" pid={PidType.MineBottom} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.bannerBox}>
      <button type="button" className={styles.friendPath} onClick={handleInviteClick}>
        <div className={styles.friendIcon}>
          <img
            src="/images/common/mine/mine_invite.png"
            alt=""
            className="h-full w-full object-contain"
          />
        </div>
        <div className={styles.titleAndDesc}>
          <div className={styles.downloadLinkTitle}>
            <span className="_tf[14]">呼朋唤友</span>
            <div className={styles.newIcon}>
              <img
                src="/images/common/mine/mine_invite_newIcon.png"
                alt=""
                width={28}
                height={14}
                className="object-contain"
              />
            </div>
          </div>
          <p className={`${styles.desc} _tf[12]`}>累计奖励·邀请礼金·VIP等级传承·返水奖励</p>
        </div>
      </button>
    </div>
  );
}
