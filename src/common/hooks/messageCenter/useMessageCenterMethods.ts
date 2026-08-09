import { useCallback } from 'react';
import { useAppDispatch } from '@/core/store/hooks';
import {
  clearMsgItemStateMap,
  EMessageTabKey,
  ENoticeTabKey,
  selectAllAction,
  setInboxExpanded,
  setMsgEditorData,
  setMultiDeleteMode,
  setOutboxExpanded,
  setSubTabAction,
  toogleSelectOneAction,
  unselectAllAction,
  clearInitialSubTabAction,
  ESubTabKey,
} from '@/core/store/slices/messageCenterSlice';
import {
  getFBNoticeListThunk,
  getNewsInboxThunk,
  readSingleMessageThunk,
  getNewsOutboxThunk,
  getNoticeListThunk,
  getUnreadInboxCountThunk,
  getNewsInboxChildThunk,
  readMessageAllThunk,
  deleteInboxMessageThunk,
  deleteOutboxMessageThunk,
} from '@/core/store/thunks/messageCenterThunks';
import { TNewsMsgItem } from '@/apis/origin/msgCenter/newsInbox';
import { EMessageStatus } from '@/apis/commonSports/constants';

export const useMessageCenterMethods = () => {
  const dispatch = useAppDispatch();

  const clearInitialSubTab = useCallback(() => {
    dispatch(clearInitialSubTabAction());
  }, [dispatch]);

  const setSubTab = useCallback(
    (nextSubTab: ESubTabKey) => {
      dispatch(setSubTabAction(nextSubTab));
    },
    [dispatch],
  );

  // #region 请求数据thunks
  const getNoticeList = useCallback(() => {
    dispatch(getNoticeListThunk());
  }, [dispatch]);

  const getFBNoticeList = useCallback(() => {
    dispatch(getFBNoticeListThunk());
  }, [dispatch]);

  const getNewsInbox = useCallback(() => {
    dispatch(getNewsInboxThunk());
  }, [dispatch]);

  const getNewsOutbox = useCallback(() => {
    dispatch(getNewsOutboxThunk());
  }, [dispatch]);

  const getUnreadInboxCount = useCallback(() => {
    dispatch(getUnreadInboxCountThunk());
  }, [dispatch]);

  const readMessageAll = useCallback(
    ({ subTab }: { subTab: ESubTabKey }) => {
      dispatch(readMessageAllThunk())
        .unwrap()
        .catch(() => {
          // 回滚
          getUnreadInboxCount();

          if (subTab === ENoticeTabKey.PLATFORM_NOTICE) {
            getNoticeList();
          } else if (subTab === ENoticeTabKey.SPORT_NOTICE) {
            getFBNoticeList();
          } else if (subTab === EMessageTabKey.INBOX) {
            getNewsInbox();
          } else if (subTab === EMessageTabKey.OUTBOX) {
            getNewsOutbox();
          }
        });
    },
    [dispatch, getFBNoticeList, getNewsInbox, getNewsOutbox, getNoticeList, getUnreadInboxCount],
  );
  // #endregion

  const changeSubTab = useCallback(
    ({
      nextSubTab,
      subTab,
      isInit,
    }: {
      nextSubTab: ESubTabKey;
      subTab: ESubTabKey;
      isInit?: boolean;
    }) => {
      if (!isInit && nextSubTab === subTab) return;
      if (nextSubTab === EMessageTabKey.INBOX || subTab === EMessageTabKey.OUTBOX) {
        dispatch(clearMsgItemStateMap());
      }
      setSubTab(nextSubTab);
      if (nextSubTab === ENoticeTabKey.PLATFORM_NOTICE) {
        getNoticeList();
      } else if (nextSubTab === ENoticeTabKey.SPORT_NOTICE) {
        getFBNoticeList();
      } else if (nextSubTab === EMessageTabKey.INBOX) {
        getNewsInbox();
      } else if (nextSubTab === EMessageTabKey.OUTBOX) {
        getNewsOutbox();
      }
      if (isInit) {
        clearInitialSubTab();
      }
    },
    [
      dispatch,
      getFBNoticeList,
      getNewsInbox,
      getNewsOutbox,
      getNoticeList,
      setSubTab,
      clearInitialSubTab,
    ],
  );

  // #region 展开站内信
  const expandInboxMsgItem = useCallback(
    (item: TNewsMsgItem) => {
      // 设置展开
      dispatch(
        setInboxExpanded({
          id: item.id,
          expanded: true,
        }),
      );

      // 如果是未读消息
      if (item.messageStatus === EMessageStatus.Unread) {
        dispatch(readSingleMessageThunk(item.id))
          .unwrap()
          .finally(() => {
            // 更新未读站内信数量
            getUnreadInboxCount();
          });
      }

      // 获取子列表 thunk（内部会维护 loading 和 list）
      dispatch(getNewsInboxChildThunk(item.id));
    },
    [dispatch, getUnreadInboxCount],
  );
  // #endregion

  // #region 折叠站内信
  const collapseInboxMsgItem = useCallback(
    (item: TNewsMsgItem) => {
      dispatch(
        setInboxExpanded({
          id: item.id,
          expanded: false,
        }),
      );
    },
    [dispatch],
  );
  // #endregion

  // #region 展开已发送
  const expandOutboxMsgItem = useCallback(
    (item: TNewsMsgItem) => {
      dispatch(
        setOutboxExpanded({
          id: item.id,
          expanded: true,
        }),
      );
    },
    [dispatch],
  );
  // #endregion

  // #region 折叠已发送
  const collapseOutboxMsgItem = useCallback(
    (item: TNewsMsgItem) => {
      dispatch(
        setOutboxExpanded({
          id: item.id,
          expanded: false,
        }),
      );
    },
    [dispatch],
  );
  // #endregion

  // #region 开启/关闭多选模式
  const openMultiDeleteMode = useCallback(() => {
    dispatch(setMultiDeleteMode(true));
  }, [dispatch]);

  const closeMultiDeleteMode = useCallback(() => {
    dispatch(setMultiDeleteMode(false));
  }, [dispatch]);

  const toogleSelectOne = useCallback(
    ({ id, subTab }: { id: number; subTab: ESubTabKey }) => {
      dispatch(toogleSelectOneAction({ id, subTab }));
    },
    [dispatch],
  );

  const selectAll = useCallback(
    ({ subTab }: { subTab: ESubTabKey }) => {
      dispatch(selectAllAction({ subTab }));
    },
    [dispatch],
  );

  const unselectAll = useCallback(
    ({ subTab }: { subTab: ESubTabKey }) => {
      dispatch(unselectAllAction({ subTab }));
    },
    [dispatch],
  );
  // #endregion

  // #region 删除消息
  const deleteMessages = useCallback(
    ({ subTab, idsMap }: { subTab: ESubTabKey; idsMap: Partial<Record<number, boolean>> }) => {
      if (subTab === EMessageTabKey.INBOX) {
        dispatch(deleteInboxMessageThunk(idsMap))
          .unwrap()
          .catch(() => {
            // 回滚
            getNewsInbox();
            getUnreadInboxCount();
          });
      } else if (subTab === EMessageTabKey.OUTBOX) {
        dispatch(deleteOutboxMessageThunk(idsMap))
          .unwrap()
          .catch(() => {
            // 回滚
            getNewsOutbox();
          });
      }
    },
    [dispatch, getNewsInbox, getNewsOutbox, getUnreadInboxCount],
  );

  // #endregion

  // #region 新增站内信
  const openMsgEditor = useCallback(
    ({ replyItem }: { replyItem?: TNewsMsgItem }) => {
      dispatch(setMsgEditorData({ visible: true, replyItem }));
    },
    [dispatch],
  );

  const closeMsgEditor = useCallback(() => {
    dispatch(setMsgEditorData({ visible: false }));
  }, [dispatch]);
  // #endregion

  return {
    clearInitialSubTab,
    setSubTab,
    changeSubTab,
    expandInboxMsgItem,
    collapseInboxMsgItem,
    expandOutboxMsgItem,
    collapseOutboxMsgItem,
    openMultiDeleteMode,
    closeMultiDeleteMode,
    getNoticeList,
    getFBNoticeList,
    getNewsInbox,
    getNewsOutbox,
    getUnreadInboxCount,
    readMessageAll,
    toogleSelectOne,
    selectAll,
    unselectAll,
    deleteMessages,
    openMsgEditor,
    closeMsgEditor,
  };
};
