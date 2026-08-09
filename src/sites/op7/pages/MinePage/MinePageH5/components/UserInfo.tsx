import LazyImage from '@/common/components/LazyImage';
import { useAppSelector, useAppDispatch } from '@/core/store/hooks';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { openLoginModal } from '@/core/store/slices/authUISlice';
import { PATHS } from '@/sites/op7/routes/paths';
import styles from './UserInfo.module.scss';
import clsx from 'clsx';
import { DEFAULT_AVATAR_SRC, resolveEmcAvatarSrc } from '@/common/utils/emcAvatar';

export function UserInfo() {
  const dispatch = useAppDispatch();
  const navigate = useNavigateWithLanguage();
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const loginName = useAppSelector((state) => state.user.memberInfo.loginName);
  const subDay = useAppSelector((state) => state.user.memberInfo.subDay);
  const level = useAppSelector((state) => state.user.memberInfo.level);
  const avatarAddress = useAppSelector((state) => state.user.memberInfo.avatarAddress);
  const memberAvatarId = useAppSelector((state) => state.user.memberInfo.userAvatar);
  const userAvatarFallback = useAppSelector((state) => state.user.userAvatar);
  const avatar = memberAvatarId ? resolveEmcAvatarSrc(memberAvatarId) : avatarAddress;

  const displayName = loginName || '......';
  const displayLevel = level ?? 0;
  const showVipSweep = true;

  if (!isLogin) {
    return (
      <button
        type="button"
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-12px border-0 bg-transparent p-0 text-left"
        onClick={() => dispatch(openLoginModal())}
      >
        <span className={clsx(styles.userInfoButton)}>
          <LazyImage
            src={DEFAULT_AVATAR_SRC}
            lazy={false}
            fallback={DEFAULT_AVATAR_SRC}
            alt="avatar"
            className={styles.userInfoAvatarInner}
          />
        </span>

        <span className="_tf[16] font-600 leading-[1.4] text-[var(--Text-Main-10)]">立即登录</span>
      </button>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 items-center gap-12px">
      <div onClick={() => navigate(PATHS.mineProfile)}>
        <span className={clsx(styles.userInfoButton, 'cursor-pointer')}>
          <LazyImage
            src={avatar || userAvatarFallback || DEFAULT_AVATAR_SRC}
            lazy={false}
            fallback={DEFAULT_AVATAR_SRC}
            alt="avatar"
            className={styles.userInfoAvatarInner}
          />
        </span>
      </div>

      <div className="min-w-0 flex flex-col gap-4px">
        <div className="flex min-w-0 flex-wrap items-center gap-4px">
          <span className="truncate _tf[14] font-500 leading-[1.4] text-[var(--Text-Main-10)]">
            {displayName}
          </span>
          <span className={styles.vipBadgeWrap}>
            <LazyImage
              onClick={() => {
                navigate(PATHS.vipCenter);
              }}
              src={`/images/common/promotion/hotEvent/vip${displayLevel}.png`}
              fallback="/images/common/vip/vip_tags/vip_0.png"
              alt="level"
              className="h-26px w-57px shrink-0"
            />
            {showVipSweep && <span className={styles.sweepEffect}></span>}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2px _tf[10] font-400 leading-[1.33] text-[var(--Text-900)]">
          <span>已加入大家庭</span>
          <span className="_tf[10] font-500 leading-[1.33] text-[var(--ThemeColor-Main)] din-pro">
            {subDay}
          </span>
          <span>天</span>
        </div>
      </div>
    </div>
  );
}
