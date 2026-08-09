import { useCallback } from 'react';
import { generatePath } from 'react-router-dom';

import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';

type GoMatchDetailOptions = {
  isChampion?: boolean;
};

/**
 * 跳转赛事详情（普通赛事）或冠军玩法页
 */
export function useGoMatchDetail() {
  const navigate = useNavigateWithLanguage();

  return useCallback(
    (matchId: string | number, options?: GoMatchDetailOptions) => {
      const id = Number(matchId);
      if (!Number.isFinite(id) || id <= 0) return;

      if (options?.isChampion) {
        navigate(generatePath(PATHS.champion, { id: String(id) }));
        return;
      }

      navigate(generatePath(PATHS.sportsDetail, { matchId: String(id) }));
    },
    [navigate],
  );
}
