import { configureStore, combineReducers } from '@reduxjs/toolkit';

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

/** 创建 Redux store（纯 SPA，无服务端预注水） */
export const makeStore = (): ReturnType<typeof configureStore<RootState>> => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [],
        },
      }).concat(persistMiddleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
