import type { MarketOddsHistoryItem } from '@/apis/origin/discover/marketOddsTypes';

import type { OddCellData } from '../types';

export { companyIdToApiPlatform, getHeaderTitles } from './indexOddsLogic';

export const formatHistoryTime = (timeStr: string): { date: string; time: string } => {
  if (!timeStr) return { date: '-', time: '-' };
  const date = new Date(timeStr);
  if (Number.isNaN(date.getTime())) return { date: '-', time: '-' };
  const pad = (n: number) => String(n).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return {
    date: `${yy}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
  };
};

export const calcMatchProgressMinutes = (recordTime: string, matchTime: string): number | null => {
  const record = new Date(recordTime).getTime();
  const match = new Date(matchTime).getTime();
  if (!Number.isFinite(record) || !Number.isFinite(match) || match <= 0) return null;
  return Math.floor((record - match) / 60000) + 1;
};

export const formatFootballMinute = (minute: number): string => `${minute}′`;

export const cellsFromHistoryItem = (
  item: MarketOddsHistoryItem | null,
  middleIsOdds: boolean,
): OddCellData[] => {
  if (!item) {
    return [
      { text: '-', change: 0, locked: false },
      { text: '-', change: 0, locked: false },
      { text: '-', change: 0, locked: false },
    ];
  }
  return [
    {
      text: item.odds1.toFixed(2),
      change: item.oddsChange1,
      locked: item.odds1 < 0,
    },
    {
      text: item.odds2.toFixed(2),
      change: item.oddsChange2,
      locked: middleIsOdds && item.odds2 < 0,
    },
    {
      text: item.odds3.toFixed(2),
      change: item.oddsChange3,
      locked: item.odds3 < 0,
    },
  ];
};
