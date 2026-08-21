import type { Middleware } from '@reduxjs/toolkit';

import { persistBetState } from '../slices/betSlice';
import type { RootState } from '../index';
import {
  getMessageCenterCacheScope,
  removeMessageCenterScopeCache,
} from '../thunks/messageCenterCache';

export const persistMiddleware: Middleware<unknown, RootState> = (store) => {
  return (next) => {
    return (action) => {
      if (
        typeof action === 'object' &&
        action !== null &&
        'type' in action &&
        action.type === 'user/clearUserInfo'
      ) {
        const scope = getMessageCenterCacheScope(store.getState());
        if (scope) {
          void removeMessageCenterScopeCache(scope).catch(() => undefined);
        }
      }

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
