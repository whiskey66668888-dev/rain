import { createContext, useContext } from 'react';
import type { TUseBetHistory } from '../useBetHistory';

export const BetHistoryContext = createContext<TUseBetHistory | null>(null);

export const useBetHistoryContext = () => {
  const ctx = useContext(BetHistoryContext);
  if (!ctx) throw new Error('useBetHistoryContext must be used within BetHistoryProvider');
  return ctx;
};
