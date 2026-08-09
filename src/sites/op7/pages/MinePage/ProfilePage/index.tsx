import React, { useMemo } from 'react';
import clsx from 'clsx';
import H5Header from '@/sites/op7/components/H5Header';
import AvatarComp from './components/AvatarComp';
import AvatarUpdate from './components/AvatarUpdate';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { setShowAvatarPopup } from '@/core/store/slices/userSlice';
import RowGender from './components/RowGender';
import RealName from './components/RealName';
import Birthday from './components/Birthday';
import ShippingAddress from './components/ShippingAddress';
import InviteCodeRow from './components/InviteCodeRow';
import NickName from './components/NickName';
import MyMoments from './components/MyMoments';
import { ArrowRightSvg } from '@/sites/op7/components/SvgIcons';
import { useSocialConfigQuery } from '@/apis/origin/social/getSocialConfig';
import { useGetInviterInfo } from '@/common/hooks/useThunkRequest';
import { useMount } from 'ahooks';
import { useLogin } from '@/common/hooks/useLogin';
import Button from '@/common/components/Button';

const ProfilePage: React.FC = () => {
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const loginName = useAppSelector((state) => state.user.memberInfo.loginName);
  const dispatch = useAppDispatch();

  const { logout } = useLogin();
  const showAvatarPopup = () => {
    dispatch(setShowAvatarPopup(true));
  };

  const { getInviterInfo } = useGetInviterInfo();
  const { data: socialConfig } = useSocialConfigQuery();
  const showMyMoments = socialConfig?.is_open_social?.itemValue === '1';

  useMount(() => {
    getInviterInfo();
  });

  return (
    <>
      <H5Header title="个人资料" />
      <div className="flex flex-col gap-12px p-12px lg:p-0">
        <div className="bg-[var(--Background-300)] rounded-12px px-12px lg:px-24px py-8px flex items-center justify-between">
          <div className="_tf[14] text-[var(--Text-Main-10)]">头像</div>
          <div className="flex items-center gap-4px" onClick={showAvatarPopup}>
            <AvatarComp className="w-40px h-40px shrink-0 rounded-full" />
            <ArrowRightSvg className="w-12px h-12px text-[var(--Text-700)]" />
          </div>
        </div>

        {/* 列表区块：用户名、性别、姓名、生日、收货地址 */}
        <div className="overflow-hidden rounded-12px bg-[var(--Background-300)]">
          <div
            className={clsx(
              'flex items-center justify-between gap-12px px-12px py-14px !lg:px-24px ',
              'shadow-[0_-0.5px_0_0_var(--Line-100)_inset]',
            )}
          >
            <span className="_tf[14] leading-[1.43] text-[var(--Text-Main-10)]">用户名</span>
            <span className="_tf[14] leading-[1.43] text-[var(--Text-700)]">{loginName}</span>
          </div>

          <RowGender />

          <NickName />

          <RealName />

          <Birthday />

          <ShippingAddress />
        </div>

        {isMobile && showMyMoments && <MyMoments />}
        <InviteCodeRow />

        {/* 退出登录 */}
        <Button onClick={() => void logout()}>退出登录</Button>
      </div>
      <AvatarUpdate />
    </>
  );
};

export default ProfilePage;
