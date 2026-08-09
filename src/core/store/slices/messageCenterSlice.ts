import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TFBNoticeListResponse, TNoticeListResponse } from '@/apis/origin/noticeList';
import {
  getFBNoticeListThunk,
  getNewsInboxThunk,
  getNoticeListThunk,
  getUnreadInboxCountThunk,
  readSingleMessageThunk,
  getNewsOutboxThunk,
  getNewsInboxChildThunk,
  readMessageAllThunk,
  deleteInboxMessageThunk,
  deleteOutboxMessageThunk,
} from '../thunks/messageCenterThunks';
import { TNewsMsgItem } from '@/apis/origin/msgCenter/newsInbox';
import { EMessageStatus } from '@/apis/commonSports/constants';
import { TNewsInboxChildItem } from '@/apis/origin/msgCenter/newsInboxChild';

// 公告tabs
export enum ENoticeTabKey {
  PLATFORM_NOTICE = 'platform_notice',
  SPORT_NOTICE = 'sport_notice',
}

// 消息 tabs
export enum EMessageTabKey {
  INBOX = 'inbox',
  OUTBOX = 'outbox',
}

export type ESubTabKey = ENoticeTabKey | EMessageTabKey;

export enum EMessageCenterTabKey {
  NOTICE = 'notice',
  MESSAGE = 'message',
}

export type TChildMsg = {
  list?: TNewsInboxChildItem[];
  loading?: boolean;
};

export type TChildMsgMap = Partial<Record<number, TChildMsg>>;

export type TMsgEditorData = {
  visible?: boolean;
  replyItem?: TNewsMsgItem;
};

/**
 * 消息中心State
 */
export interface TMessageCenterState {
  messageCenterVisible: boolean;
  initialSubTab?: ESubTabKey;
  /** 当前二级 tab（公告/消息子 tab） */
  subTab: ESubTabKey;
  noticeList: TNoticeListResponse[];
  noticeLoading: boolean;
  fbNoticeList: TFBNoticeListResponse[];
  fbNoticeLoading: boolean;
  inboxList: TNewsMsgItem[];
  inboxLoading: boolean;
  unreadInboxCount: number;
  /** 朋友圈未读消息数 */
  socialUnreadCount: number;
  outboxList: TNewsMsgItem[];
  outboxLoading: boolean;
  // 收件箱
  inboxExpandedMap: Partial<Record<number, boolean>>;
  inboxSelectedMap: Partial<Record<number, boolean>>;
  inboxChildListMap: TChildMsgMap;
  // 发件箱
  outboxExpandedMap: Partial<Record<number, boolean>>;
  outboxSelectedMap: Partial<Record<number, boolean>>;
  /** 是否开启多选删除模式 */
  multiDeleteMode: boolean;
  /** 站内信编辑窗口数据 */
  msgEditorData: TMsgEditorData;
}

export const initialState: TMessageCenterState = {
  messageCenterVisible: false,
  subTab: ENoticeTabKey.PLATFORM_NOTICE,
  noticeList: [],
  noticeLoading: false,
  fbNoticeList: [],
  fbNoticeLoading: false,
  inboxList: [],
  inboxLoading: false,
  unreadInboxCount: 0,
  socialUnreadCount: 0,
  outboxList: [],
  outboxLoading: false,
  inboxExpandedMap: {},
  inboxSelectedMap: {},
  inboxChildListMap: {},
  outboxExpandedMap: {},
  outboxSelectedMap: {},
  multiDeleteMode: false,
  msgEditorData: {},
};

const messageCenterSlice = createSlice({
  name: 'messageCenter',
  initialState,
  reducers: {
    setMessageCenterVisible: (
      state,
      action: PayloadAction<{ visible: boolean; initialSubTab?: ESubTabKey }>,
    ) => {
      const { visible, initialSubTab } = action.payload;
      if (initialSubTab) {
        state.initialSubTab = initialSubTab;
      }
      state.messageCenterVisible = visible;
    },
    clearInitialSubTabAction: (state) => {
      state.initialSubTab = undefined;
    },
    setSubTabAction: (state, action: PayloadAction<ESubTabKey>) => {
      state.subTab = action.payload;
    },
    toggleMessageCenterVisible: (state) => {
      state.messageCenterVisible = !state.messageCenterVisible;
    },
    setInboxExpanded: (state, action: PayloadAction<{ id: number; expanded: boolean }>) => {
      const { id, expanded } = action.payload;
      state.inboxExpandedMap[id] = expanded;
    },
    setOutboxExpanded: (state, action: PayloadAction<{ id: number; expanded: boolean }>) => {
      const { id, expanded } = action.payload;
      state.outboxExpandedMap[id] = expanded;
    },
    toogleSelectOneAction: (state, action: PayloadAction<{ id: number; subTab: ESubTabKey }>) => {
      const { id, subTab } = action.payload;
      if (subTab === EMessageTabKey.INBOX) {
        state.inboxSelectedMap[id] = !state.inboxSelectedMap[id];
      } else if (subTab === EMessageTabKey.OUTBOX) {
        state.outboxSelectedMap[id] = !state.outboxSelectedMap[id];
      }
    },
    selectAllAction: (state, action: PayloadAction<{ subTab: ESubTabKey }>) => {
      const { subTab } = action.payload;
      if (subTab === EMessageTabKey.INBOX) {
        state.inboxSelectedMap = state.inboxList.reduce(
          (prev, curr) => {
            prev[curr.id] = true;
            return prev;
          },
          {} as Record<number, boolean>,
        );
      } else if (subTab === EMessageTabKey.OUTBOX) {
        state.outboxSelectedMap = state.outboxList.reduce(
          (prev, curr) => {
            prev[curr.id] = true;
            return prev;
          },
          {} as Record<number, boolean>,
        );
      }
    },
    unselectAllAction: (state, action: PayloadAction<{ subTab: ESubTabKey }>) => {
      const { subTab } = action.payload;
      if (subTab === EMessageTabKey.INBOX) {
        state.inboxSelectedMap = {};
      } else if (subTab === EMessageTabKey.OUTBOX) {
        state.outboxSelectedMap = {};
      }
    },
    clearMsgItemStateMap: (state) => {
      state.inboxExpandedMap = {};
      state.inboxSelectedMap = {};
      state.inboxChildListMap = {};
      state.outboxExpandedMap = {};
      state.outboxSelectedMap = {};
    },
    setMultiDeleteMode: (state, action: PayloadAction<boolean>) => {
      state.multiDeleteMode = action.payload;
    },
    setMsgEditorData: (state, action: PayloadAction<TMsgEditorData>) => {
      state.msgEditorData = action.payload;
    },
    setSocialUnreadCount: (state, action: PayloadAction<number>) => {
      state.socialUnreadCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getNoticeListThunk.pending, (state) => {
      state.noticeLoading = true;
    });
    builder.addCase(getNoticeListThunk.fulfilled, (state, action) => {
      state.noticeList = action.payload;
      state.noticeLoading = false;
    });
    builder.addCase(getNoticeListThunk.rejected, (state) => {
      state.noticeLoading = false;
    });
    builder.addCase(getFBNoticeListThunk.pending, (state) => {
      state.fbNoticeLoading = true;
    });
    builder.addCase(getFBNoticeListThunk.fulfilled, (state, action) => {
      state.fbNoticeList = action.payload;
      state.fbNoticeLoading = false;
    });
    builder.addCase(getFBNoticeListThunk.rejected, (state) => {
      state.fbNoticeLoading = false;
    });
    builder.addCase(getNewsInboxThunk.pending, (state) => {
      state.inboxLoading = true;
    });
    builder.addCase(getNewsInboxThunk.fulfilled, (state, action) => {
      state.inboxList = action.payload;
      state.inboxLoading = false;
    });
    builder.addCase(getNewsInboxThunk.rejected, (state) => {
      state.inboxLoading = false;
    });

    builder.addCase(getNewsOutboxThunk.pending, (state) => {
      state.outboxLoading = true;
    });
    builder.addCase(getNewsOutboxThunk.fulfilled, (state, action) => {
      state.outboxList = action.payload;
      state.outboxLoading = false;
    });
    builder.addCase(getNewsOutboxThunk.rejected, (state) => {
      state.outboxLoading = false;
    });

    builder.addCase(getUnreadInboxCountThunk.fulfilled, (state, action) => {
      state.unreadInboxCount = action.payload;
    });

    // 站内信子列表
    builder.addCase(getNewsInboxChildThunk.pending, (state, action) => {
      const id = action.meta.arg;
      state.inboxChildListMap[id] = {
        ...(state.inboxChildListMap[id] || {}),
        loading: true,
      };
    });
    builder.addCase(getNewsInboxChildThunk.fulfilled, (state, action) => {
      const id = action.meta.arg;
      state.inboxChildListMap[id] = {
        ...(state.inboxChildListMap[id] || {}),
        loading: false,
        list: action.payload,
      };
    });
    builder.addCase(getNewsInboxChildThunk.rejected, (state, action) => {
      const id = action.meta.arg;
      if (!state.inboxChildListMap[id]) return;
      state.inboxChildListMap[id] = {
        ...state.inboxChildListMap[id],
        loading: false,
      };
    });

    // 乐观更新：已读一条站内信
    builder.addCase(readSingleMessageThunk.pending, (state, action) => {
      const id = action.meta.arg;
      let changeOne = false;
      state.inboxList = state.inboxList.map((item) => {
        if (item.id === id && item.messageStatus === EMessageStatus.Unread) {
          changeOne = true;
          return { ...item, messageStatus: EMessageStatus.Read };
        }
        return item;
      });
      if (changeOne && state.unreadInboxCount > 0) {
        state.unreadInboxCount -= 1;
      }
    });
    builder.addCase(readSingleMessageThunk.rejected, (state, action) => {
      const id = action.meta.arg;
      let changeOne = false;
      state.inboxList = state.inboxList.map((item) => {
        // 回滚：只有在当前是“已读”（说明之前被我们改过）时才回滚
        if (item.id === id && item.messageStatus === EMessageStatus.Read) {
          changeOne = true;
          return { ...item, messageStatus: EMessageStatus.Unread };
        }
        return item;
      });
      if (changeOne) {
        state.unreadInboxCount += 1;
      }
    });

    // 全部已读，乐观更新
    builder.addCase(readMessageAllThunk.pending, (state) => {
      state.inboxList = state.inboxList.map((item) => ({
        ...item,
        messageStatus: EMessageStatus.Read,
      }));
      state.unreadInboxCount = 0;
    });

    // 删除站内信 , 乐观更新
    builder.addCase(deleteInboxMessageThunk.pending, (state, action) => {
      const idsMap = action.meta.arg;
      state.inboxSelectedMap = {};
      let delUnreadCount = 0;
      state.inboxList = state.inboxList.filter((item) => {
        // 被选中的消息
        if (idsMap[item.id]) {
          if (item.messageStatus === EMessageStatus.Unread) {
            delUnreadCount += 1;
          }
          return false;
        }
        return true;
      });
      if (delUnreadCount > 0) {
        state.unreadInboxCount -= delUnreadCount;
      }
    });

    // 删除已发消息 , 乐观更新
    builder.addCase(deleteOutboxMessageThunk.pending, (state, action) => {
      const idsMap = action.meta.arg;
      state.outboxSelectedMap = {};
      state.outboxList = state.outboxList.filter((item) => !idsMap[item.id]);
    });
  },
});

export const {
  clearInitialSubTabAction,
  setMessageCenterVisible,
  toggleMessageCenterVisible,
  setInboxExpanded,
  setOutboxExpanded,
  toogleSelectOneAction,
  selectAllAction,
  unselectAllAction,
  clearMsgItemStateMap,
  setMultiDeleteMode,
  setMsgEditorData,
  setSubTabAction,
  setSocialUnreadCount,
} = messageCenterSlice.actions;

export default messageCenterSlice.reducer;
