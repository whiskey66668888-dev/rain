import { useState, useEffect, useCallback } from 'react';
import { safeGetLocalJSON, safeRemoveLocal, safeSetLocalJSON } from '@/utils/storage/webStorage';

interface VoteStorage {
  [key: string]: number; // 1: 有用, 2: 没用
}

export const useVoteStorage = () => {
  const STORAGE_KEY = 'help_votes';
  const [votes, setVotes] = useState<VoteStorage>({});

  // 初始化时从localStorage读取数据
  useEffect(() => {
    setVotes(safeGetLocalJSON<VoteStorage>(STORAGE_KEY, {}));
  }, []);

  // 获取特定投票状态
  const getVote = useCallback(
    (key: string): number | null => {
      return votes[key] || null;
    },
    [votes],
  );

  // 设置投票状态
  const setVote = useCallback(
    (key: string, status: number) => {
      const newVotes = { ...votes, [key]: status };
      setVotes(newVotes);
      safeSetLocalJSON(STORAGE_KEY, newVotes);
    },
    [votes],
  );

  // 删除特定投票
  const removeVote = useCallback(
    (key: string) => {
      const newVotes = { ...votes };
      delete newVotes[key];
      setVotes(newVotes);
      safeSetLocalJSON(STORAGE_KEY, newVotes);
    },
    [votes],
  );

  // 清除所有投票
  const clearAllVotes = useCallback(() => {
    setVotes({});
    safeRemoveLocal(STORAGE_KEY);
  }, []);

  // 获取所有投票
  const getAllVotes = useCallback(() => {
    return votes;
  }, [votes]);

  return {
    votes,
    getVote,
    setVote,
    removeVote,
    clearAllVotes,
    getAllVotes,
  };
};
