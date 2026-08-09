import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import type { AppPath } from '@/sites/op7/routes/paths';

import { withInviteFriendsSearch } from './paths';

/** 呼朋唤友模块内跳转，自动携带当前页 URL query */
export function useInviteFriendsNavigate() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigateWithLanguage();

  return useCallback(
    (path: AppPath) => {
      navigate(withInviteFriendsSearch(path, searchParams));
    },
    [navigate, searchParams],
  );
}
