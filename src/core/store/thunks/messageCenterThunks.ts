import { createAsyncThunk } from '@reduxjs/toolkit';
import { API_CODE_ORIGIN_SUCCESS } from '@/utils/constants/apiCodeOrigin';
import { getFBNoticeListReq, getNoticeListReq } from '@/apis/origin/noticeList';
import { getNewsInboxReq } from '@/apis/origin/msgCenter/newsInbox';
import { getNewsOutboxReq } from '@/apis/origin/msgCenter/newsOutbox';
import { getMessageSumReq } from '@/apis/origin/msgCenter/messageSum';
import { findMessageReq } from '@/apis/origin/msgCenter/findMessage';
import { getNewsInboxChildReq } from '@/apis/origin/msgCenter/newsInboxChild';
import { readMessageAllReq } from '@/apis/origin/msgCenter/readMessageAll';
import { inboxDelMulReq } from '@/apis/origin/msgCenter/inboxDelMul';
import { outboxDelMulReq } from '@/apis/origin/msgCenter/outboxDelMul';
import type { RootState } from '../index';
import {
  getMessageCenterCacheScope,
  readInboxCache,
  readInboxChildCache,
  readOutboxCache,
  removeInboxCache,
  removeOutboxCache,
  writeInboxCache,
  writeInboxChildCache,
  writeOutboxCache,
} from './messageCenterCache';

export const getNoticeListThunk = createAsyncThunk(
  'messageCenter/getNoticeList',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getNoticeListReq({ limit: 50 });
      if (res.code !== API_CODE_ORIGIN_SUCCESS) {
        return rejectWithValue(res.info);
      }
      return res.data;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : '获取公告列表失败');
    }
  },
);

export const getFBNoticeListThunk = createAsyncThunk(
  'messageCenter/getFBNoticeList',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getFBNoticeListReq({ limit: 50 });
      if (res.code !== API_CODE_ORIGIN_SUCCESS) {
        return rejectWithValue(res.info);
      }
      return res.data;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : '获取FB公告列表失败');
    }
  },
);

export const getNewsInboxThunk = createAsyncThunk(
  'messageCenter/getNewsInbox',
  async (_, { getState, rejectWithValue }) => {
    const scope = getMessageCenterCacheScope(getState() as RootState);
    try {
      const res = await getNewsInboxReq();
      if (res.code !== API_CODE_ORIGIN_SUCCESS) {
        return rejectWithValue(res.info);
      }
      if (scope) {
        void writeInboxCache(scope, res.data).catch(() => undefined);
      }
      return res.data;
    } catch (error: unknown) {
      if (scope) {
        const cached = await readInboxCache(scope).catch(() => null);
        if (cached) return cached;
      }
      return rejectWithValue(error instanceof Error ? error.message : '获取站内信列表失败');
    }
  },
);

export const getNewsOutboxThunk = createAsyncThunk(
  'messageCenter/getNewsOutbox',
  async (_, { getState, rejectWithValue }) => {
    const scope = getMessageCenterCacheScope(getState() as RootState);
    try {
      const res = await getNewsOutboxReq();
      if (res.code !== API_CODE_ORIGIN_SUCCESS) {
        return rejectWithValue(res.info);
      }
      if (scope) {
        void writeOutboxCache(scope, res.data).catch(() => undefined);
      }
      return res.data;
    } catch (error: unknown) {
      if (scope) {
        const cached = await readOutboxCache(scope).catch(() => null);
        if (cached) return cached;
      }
      return rejectWithValue(error instanceof Error ? error.message : '获取已发消息列表失败');
    }
  },
);

export const getUnreadInboxCountThunk = createAsyncThunk(
  'messageCenter/getUnreadInboxCount',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getMessageSumReq();
      if (res.code !== API_CODE_ORIGIN_SUCCESS) {
        return rejectWithValue(res.info);
      }
      return res.data;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : '获取未读站内信数量失败');
    }
  },
);

export const readSingleMessageThunk = createAsyncThunk(
  'messageCenter/readSingleMessage',
  async (id: number, { getState, rejectWithValue }) => {
    const scope = getMessageCenterCacheScope(getState() as RootState);
    try {
      const res = await findMessageReq(id);
      if (res.code !== API_CODE_ORIGIN_SUCCESS) {
        return rejectWithValue(res.info);
      }
      if (scope) {
        void removeInboxCache(scope).catch(() => undefined);
      }
      return res.data;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : '已读一条站内信失败');
    }
  },
);

// 全部已读
export const readMessageAllThunk = createAsyncThunk(
  'messageCenter/readMessageAll',
  async (_, { getState, rejectWithValue }) => {
    const scope = getMessageCenterCacheScope(getState() as RootState);
    try {
      const res = await readMessageAllReq();
      if (res.code !== API_CODE_ORIGIN_SUCCESS) {
        return rejectWithValue(res.info);
      }
      if (scope) {
        void removeInboxCache(scope).catch(() => undefined);
      }
      return res.data;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : '全部已读失败');
    }
  },
);

export const getNewsInboxChildThunk = createAsyncThunk(
  'messageCenter/getNewsInboxChild',
  async (id: number, { getState, rejectWithValue }) => {
    const scope = getMessageCenterCacheScope(getState() as RootState);
    try {
      const res = await getNewsInboxChildReq({ id });
      if (res.code !== API_CODE_ORIGIN_SUCCESS) {
        return rejectWithValue(res.info);
      }
      if (scope) {
        void writeInboxChildCache(scope, id, res.data).catch(() => undefined);
      }
      return res.data;
    } catch (error: unknown) {
      if (scope) {
        const cached = await readInboxChildCache(scope, id).catch(() => null);
        if (cached) return cached;
      }
      return rejectWithValue(error instanceof Error ? error.message : '获取站内信子列表失败');
    }
  },
);

export const deleteInboxMessageThunk = createAsyncThunk(
  'messageCenter/deleteInboxMessage',
  async (idsMap: Partial<Record<number, boolean>>, { getState, rejectWithValue }) => {
    const scope = getMessageCenterCacheScope(getState() as RootState);
    try {
      const ids = Object.entries(idsMap).reduce((prev, [key, value]) => {
        if (value) {
          if (!prev) {
            prev = `${key}`;
          } else {
            prev += `,${key}`;
          }
        }
        return prev;
      }, '');
      const res = await inboxDelMulReq({ ids });
      if (res.code !== API_CODE_ORIGIN_SUCCESS) {
        return rejectWithValue(res.info);
      }
      if (scope) {
        void removeInboxCache(scope).catch(() => undefined);
      }
      return res.data;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : '删除站内信失败');
    }
  },
);

export const deleteOutboxMessageThunk = createAsyncThunk(
  'messageCenter/deleteOutboxMessage',
  async (idsMap: Partial<Record<number, boolean>>, { getState, rejectWithValue }) => {
    const scope = getMessageCenterCacheScope(getState() as RootState);
    try {
      const ids = Object.entries(idsMap).reduce((prev, [key, value]) => {
        if (value) {
          if (!prev) {
            prev = `${key}`;
          } else {
            prev += `,${key}`;
          }
        }
        return prev;
      }, '');
      const res = await outboxDelMulReq({ ids });
      if (res.code !== API_CODE_ORIGIN_SUCCESS) {
        return rejectWithValue(res.info);
      }
      if (scope) {
        void removeOutboxCache(scope).catch(() => undefined);
      }
      return res.data;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : '删除已发消息失败');
    }
  },
);
