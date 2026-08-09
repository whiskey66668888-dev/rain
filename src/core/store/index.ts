import { configureStore, combineReducers } from '@reduxjs/toolkit';

import { deepMerge } from '@/utils';

import { persistMiddleware } from './middleware/persistMiddleware';

import authUIReducer from './slices/authUISlice';
import configReducer from './slices/configSlice';
import entertainmentReducer from './slices/entertainmentSlice';
import sportReducer from './slices/sportSlice';
import thirdApiConfigReducer from './slices/thirdApiConfigSlice';
import userReducer from './slices/userSlice';
import betReducer from './slices/betSlice';
import betHistoryReducer from './slices/betHistorySlice';
import messageCenterReducer from './slices/messageCenterSlice';
import customerServiceUIReducer from './slices/customerServiceUISlice';

const rootReducer = combineReducers({
  authUI: authUIReducer,
  config: configReducer,
  user: userReducer,
  thirdApiConfig: thirdApiConfigReducer,
  entertainment: entertainmentReducer,
  sport: sportReducer,
  bet: betReducer,
  betHistory: betHistoryReducer,
  messageCenter: messageCenterReducer,
  customerServiceUI: customerServiceUIReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

// 创建 store 的函数
// preloadedState 用于 SSR hydration
export const makeStore = (
  preloadedState?: Partial<RootState>,
): ReturnType<typeof configureStore<RootState>> => {
  if (preloadedState) {
    // 如果有服务端传入的状态，先创建临时 store 获取完整初始状态，然后合并
    const tempStore = configureStore({
      reducer: rootReducer,
    });
    const initialState = tempStore.getState();

    // 深度合并服务端状态和客户端初始状态
    const mergedPreloadedState = deepMerge(initialState, preloadedState);

    // 使用合并后的状态创建最终 store
    return configureStore({
      reducer: rootReducer,
      preloadedState: mergedPreloadedState,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: {
            // 忽略某些不可序列化的值（如果需要）
            ignoredActions: [],
          },
        }).concat(persistMiddleware),
    });
  }

  // 如果没有服务端状态，直接创建 store
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // 忽略某些不可序列化的值（如果需要）
          ignoredActions: [],
        },
      }).concat(persistMiddleware),
  });
};

/**
 * 获取 SSR 注水的 Redux 状态
 */
export function getSSRPreloadedState(): Partial<RootState> | undefined {
  const state = window.__REDUX_STATE__;
  if (state) {
    try {
      return typeof state === 'string' ? (JSON.parse(state) as Partial<RootState>) : state;
    } catch (error) {
      console.warn('Failed to parse SSR preloaded state:', error);
      return undefined;
    }
  }

  return undefined;
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
