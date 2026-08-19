import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '../index';

/**
 * 预绑定 RootState 的 createSelector。
 * 派生对象/数组时，combiner 必须写明返回类型，否则 IDE 可能把结果推断成 unknown。
 */
export const createAppSelector = createSelector.withTypes<RootState>();
