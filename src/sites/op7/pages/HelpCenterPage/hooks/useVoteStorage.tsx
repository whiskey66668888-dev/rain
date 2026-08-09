import { useState, useEffect, useCallback } from 'react';

interface VoteStorage {
  [key: string]: number; // 1: 有用, 2: 没用
}

export const useVoteStorage = () => {
  const STORAGE_KEY = 'help_votes';
  const [votes, setVotes] = useState<VoteStorage>({});

  // 初始化时从localStorage读取数据
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setVotes(JSON.parse(stored) as VoteStorage);
      }
    } catch (error) {
      console.error('读取投票状态失败:', error);
    }
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
      try {
        const newVotes = { ...votes, [key]: status };
        setVotes(newVotes);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newVotes));
      } catch (error) {
        console.error('保存投票状态失败:', error);
      }
    },
    [votes],
  );

  // 删除特定投票
  const removeVote = useCallback(
    (key: string) => {
      try {
        const newVotes = { ...votes };
        delete newVotes[key];
        setVotes(newVotes);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newVotes));
      } catch (error) {
        console.error('删除投票状态失败:', error);
      }
    },
    [votes],
  );

  // 清除所有投票
  const clearAllVotes = useCallback(() => {
    try {
      setVotes({});
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('清除所有投票状态失败:', error);
    }
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
