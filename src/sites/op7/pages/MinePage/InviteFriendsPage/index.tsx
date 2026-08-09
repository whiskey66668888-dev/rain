import React, { useEffect } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';

import { persistInviteFriendsAppQuery } from './paths';

/**
 * 呼朋唤友（邀请好友活动页，三级路由）
 */
const InviteFriendsPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    persistInviteFriendsAppQuery(searchParams);
  }, [searchParams]);

  return (
    <div
      data-desc="invite-friends-layout"
      className="self-center w-full flex-1 flex flex-col overflow-y-auto lg:overflow-initial lg:max-w-[1220px]"
    >
      <Outlet />
    </div>
  );
};

export default InviteFriendsPage;
