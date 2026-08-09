import { useAppSelector } from '@/core/store/hooks';
import { memo, useCallback, useMemo } from 'react';
import Overlay from '@/common/components/Overlay';
import clsx from 'clsx';
import SegmentedControl from '@/common/components/SegmentedControl';
import { NoticeList } from './components/NoticeList';
import { SportsNoticeList } from './components/SportsNoticeList';
import { InboxList } from './components/InboxList';
import { OutboxList } from './components/OutboxList';
import { EMessageTabKey, ENoticeTabKey } from '@/core/store/slices/messageCenterSlice';
import { EMessageCenterTabKey } from '@/core/store/slices/messageCenterSlice';
import { useMessageCenterMethods } from '@/common/hooks/messageCenter/useMessageCenterMethods';
import { MsgHeader } from './components/MsgHeader';
import { toast } from '@/common/components/Toast';
import { MsgEditor } from './components/MsgEditor';
import { useMount } from 'ahooks';
import Button from '@/common/components/Button';
import { CloseSvg } from '../../components/SvgIcons';
import CheckBox from '@/common/components/CheckBox';

export const MESSAGE_CENTER_TABS = [
  {
    label: '公告',
    value: EMessageCenterTabKey.NOTICE,
    initialSubTab: ENoticeTabKey.PLATFORM_NOTICE,
  },
  { label: '消息', value: EMessageCenterTabKey.MESSAGE, initialSubTab: EMessageTabKey.INBOX },
];

export const NOTICE_TABS = [
  { label: '平台公告', value: ENoticeTabKey.PLATFORM_NOTICE },
  { label: '赛事公告(OP)', value: ENoticeTabKey.SPORT_NOTICE },
];

export const MESSAGE_TABS = [
  { label: '消息对话', value: EMessageTabKey.INBOX },
  { label: '已发消息', value: EMessageTabKey.OUTBOX },
];

const MessageCenterContent = memo(() => {
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const subTab = useAppSelector((state) => state.messageCenter.subTab);
  const initialSubTab = useAppSelector((state) => state.messageCenter.initialSubTab);
  const unreadInboxCount = useAppSelector((state) => state.messageCenter.unreadInboxCount);
  const multiDeleteMode = useAppSelector((state) => state.messageCenter.multiDeleteMode);
  const inboxSelectedMap = useAppSelector((state) => state.messageCenter.inboxSelectedMap);
  const outboxSelectedMap = useAppSelector((state) => state.messageCenter.outboxSelectedMap);
  const inboxList = useAppSelector((state) => state.messageCenter.inboxList);
  const outboxList = useAppSelector((state) => state.messageCenter.outboxList);
  const {
    selectAll,
    unselectAll,
    deleteMessages,
    closeMultiDeleteMode,
    changeSubTab,
    getUnreadInboxCount,
    openMsgEditor,
    readMessageAll,
    openMultiDeleteMode,
  } = useMessageCenterMethods();

  const activeTab = useMemo(() => {
    switch (subTab) {
      case ENoticeTabKey.PLATFORM_NOTICE:
      case ENoticeTabKey.SPORT_NOTICE:
        return EMessageCenterTabKey.NOTICE;
      case EMessageTabKey.INBOX:
      case EMessageTabKey.OUTBOX:
        return EMessageCenterTabKey.MESSAGE;
      default:
        return EMessageCenterTabKey.NOTICE;
    }
  }, [subTab]);

  const [selectedCount, isAllSelected, currentSelectedMap] = useMemo(() => {
    let _selectedCount = 0;
    let _isAllSelected = false;
    let _currentSelectedMap = {};
    if (subTab === EMessageTabKey.INBOX) {
      _selectedCount = Object.values(inboxSelectedMap).filter(Boolean).length;
      _isAllSelected = inboxList.every((item) => inboxSelectedMap[item.id]);
      _currentSelectedMap = inboxSelectedMap;
    } else if (subTab === EMessageTabKey.OUTBOX) {
      _selectedCount = Object.values(outboxSelectedMap).filter(Boolean).length;
      _isAllSelected = outboxList.every((item) => outboxSelectedMap[item.id]);
      _currentSelectedMap = outboxSelectedMap;
    }
    return [_selectedCount, _isAllSelected, _currentSelectedMap];
  }, [inboxList, inboxSelectedMap, outboxList, outboxSelectedMap, subTab]);

  const subTabList = useMemo(() => {
    const tabs = activeTab === EMessageCenterTabKey.MESSAGE ? MESSAGE_TABS : NOTICE_TABS;
    return tabs.map((tab) => ({
      label: (
        <div className="flex gap-4px items-center justify-center _tf[14]">
          <span className="leading-[16px]">{tab.label}</span>
          {tab.value === EMessageTabKey.INBOX && unreadInboxCount > 0 && (
            <span
              className={clsx(
                'bg-[var(--Red-300)] rounded-8px flex items-center justify-center',
                'h-16px min-w-16px px-4px',
                'text-12px leading-[16px] font-medium text-[var(--White-100)]',
              )}
            >
              {unreadInboxCount}
            </span>
          )}
        </div>
      ),
      value: tab.value,
    }));
  }, [activeTab, unreadInboxCount]);

  const changeActiveTab = useCallback(
    (_activeTab: EMessageCenterTabKey) => {
      if (activeTab === _activeTab) return;
      const currTab = MESSAGE_CENTER_TABS.find((i) => i.value === _activeTab);
      if (currTab) {
        changeSubTab({ nextSubTab: currTab.initialSubTab, subTab });
      }
    },
    [activeTab, changeSubTab, subTab],
  );

  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      unselectAll({ subTab });
    } else {
      selectAll({ subTab });
    }
  }, [isAllSelected, selectAll, subTab, unselectAll]);

  const handleDeleteMessages = useCallback(() => {
    if (_.every(currentSelectedMap, (value) => !value)) {
      toast({
        type: 'error',
        description: '请选择要删除的消息',
      });
      return;
    }
    deleteMessages({ subTab, idsMap: currentSelectedMap });
    closeMultiDeleteMode();
  }, [closeMultiDeleteMode, deleteMessages, subTab, currentSelectedMap]);

  useMount(() => {
    changeSubTab({
      nextSubTab: initialSubTab || ENoticeTabKey.PLATFORM_NOTICE,
      subTab,
      isInit: true,
    });
    getUnreadInboxCount();
  });

  return (
    <div
      data-desc="消息中心内容"
      className={clsx(
        'message-center',
        'flex-1 flex flex-col shrink-0 overflow-hidden',
        'bg-[var(--Background-700)]',
        'lg:w-[351px]',
      )}
    >
      <MsgHeader
        activeTab={activeTab}
        subTab={subTab}
        selectedCount={selectedCount}
        changeActiveTab={changeActiveTab}
      />

      <div className="p-12px flex-1 flex flex-col gap-12px overflow-hidden">
        {!multiDeleteMode && (
          <SegmentedControl
            options={subTabList}
            value={subTab}
            onChange={(val) => {
              changeSubTab({ nextSubTab: val, subTab });
            }}
            className="w-full bg-[var(--Background-300)] [--un-selected-color:var(--Text-Main-10)]"
            height={36}
          />
        )}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {subTab === ENoticeTabKey.PLATFORM_NOTICE && <NoticeList />}
          {subTab === ENoticeTabKey.SPORT_NOTICE && <SportsNoticeList />}
          {subTab === EMessageTabKey.INBOX && <InboxList />}
          {subTab === EMessageTabKey.OUTBOX && <OutboxList />}
        </div>
      </div>
      {isMobile && multiDeleteMode && (
        <div className={clsx('flex gap-14px', 'px-14px py-10px', 'bg-[var(--Background-700)]')}>
          <Button type="third" className="flex-1 _tf[16]" onClick={handleSelectAll}>
            {isAllSelected ? '取消全选' : '全选'}
          </Button>
          <Button className="flex-1 _tf[16]" onClick={handleDeleteMessages}>
            删除
          </Button>
        </div>
      )}

      {!isMobile && activeTab === EMessageCenterTabKey.MESSAGE && (
        <div
          className={clsx(
            'h-52px shrink-0',
            'bg-[var(--Background-300)] shadow-[-6px_0_12px_0_var(--Shadow-400)]',
          )}
        >
          {multiDeleteMode ? (
            <div className="h-full flex items-center justify-between px-12px">
              <button
                className="w-24px h-24px bg-[var(--Line-100)] rounded-full flex items-center justify-center"
                onClick={closeMultiDeleteMode}
              >
                <CloseSvg className="text-[var(--Text-Main-10)]" />
              </button>
              <div className="flex items-center gap-24px _tf[14] font-medium text-[var(--Text-Main-10)]">
                <div>
                  <span>已选</span>
                  <span className="mx-4px text-[var(--ThemeColor-Main)]">{selectedCount}</span>
                  <span>条</span>
                </div>
                <button className="flex items-center gap-8px" onClick={handleSelectAll}>
                  <CheckBox value={isAllSelected} />
                  <span>全选</span>
                </button>
                <button className="text-[var(--Red-300)]" onClick={handleDeleteMessages}>
                  删除
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center gap-12px _tf[14] font-medium text-[var(--Text-Main-10)]">
              <button className="flex-1 font-600" onClick={() => openMsgEditor({})}>
                写站内信
              </button>
              <div className="w-1px h-20px bg-[var(--Line-100)]" />
              <button className="flex-1" onClick={() => readMessageAll({ subTab })}>
                全部已读
              </button>
              <div className="w-1px h-20px bg-[var(--Line-100)]" />
              <button className="flex-1" onClick={openMultiDeleteMode}>
                选择信息
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

const MessageCenter = () => {
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const messageCenterVisible = useAppSelector((state) => state.messageCenter.messageCenterVisible);
  const msgEditorVisible = useAppSelector((state) => state.messageCenter.msgEditorData.visible);

  return (
    <>
      {isMobile && (
        <Overlay
          show={messageCenterVisible}
          position="bottom"
          background="transparent"
          bodyClassname="h-full flex flex-col overflow-hidden bg-[var(--Background-700)] safe-b"
        >
          <MessageCenterContent />
        </Overlay>
      )}
      {!isMobile && messageCenterVisible && <MessageCenterContent />}
      {msgEditorVisible && <MsgEditor />}
    </>
  );
};

export default memo(MessageCenter);
