import type { Middleware } from '@reduxjs/toolkit';

import { persistBetState } from '../slices/betSlice';
import type { RootState } from '../index';

export const persistMiddleware: Middleware<unknown, RootState> = (store) => {
  return (next) => {
    return (action) => {
      const result = next(action);
      if (typeof action === 'object' && action !== null && 'type' in action) {
        const type = action.type;
        if (typeof type === 'string' && type.startsWith('bet/')) {
          persistBetState(store.getState().bet);
        }
      }
      return result;
    };
  };
};
