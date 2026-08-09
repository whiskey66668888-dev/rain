import { createContext, useContext } from 'react';
import { TUseVenueBetData } from '@/common/hooks/bet/useVenueBetData';

export const BettingDataContext = createContext<TUseVenueBetData | null>(null);

export const useBettingData = () => {
  const context = useContext(BettingDataContext);
  if (!context) {
    throw new Error('useBettingData must be used within BettingDataProvider');
  }
  return context;
};
