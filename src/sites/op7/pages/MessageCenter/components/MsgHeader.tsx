import { useCloseMessageCenter } from '@/common/hooks/messageCenter/useCloseMessageCenter';
import { useMessageCenterMethods } from '@/common/hooks/messageCenter/useMessageCenterMethods';
import { useAppSelector } from '@/core/store/hooks';
import {
  EMessageCenterTabKey,
  EMessageTabKey,
  ESubTabKey,
} from '@/core/store/slices/messageCenterSlice';
import H5Header from '@/sites/op7/components/H5Header';
import { CloseSvg, EditSvg, ThreeDotsSvg } from '@/sites/op7/components/SvgIcons';
import { Popover } from 'antd-mobile';
import clsx from 'clsx';
import { useCallback, useState } from 'react';
import { MESSAGE_CENTER_TABS } from '..';
import styles from './MsgHeader.module.scss';

interface IProps {
  activeTab: EMessageCenterTabKey;
  subTab: ESubTabKey;
  selectedCount: number;
  changeActiveTab: (tab: EMessageCenterTabKey) => void;
}

export const MsgHeader = ({ activeTab, subTab, selectedCount, changeActiveTab }: IProps) => {
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const unreadInboxCount = useAppSelector((state) => state.messageCenter.unreadInboxCount);
  const multiDeleteMode = useAppSelector((state) => state.messageCenter.multiDeleteMode);
  const { closeMultiDeleteMode, unselectAll, readMessageAll, openMultiDeleteMode, openMsgEditor } =
    useMessageCenterMethods();
  const { closeMessageCenter } = useCloseMessageCenter();

  const [popoverVisible, setPopoverVisible] = useState(false);

  const handleQuitMultiDeleteMode = useCallback(() => {
    closeMultiDeleteMode();
    unselectAll({ subTab });
  }, [closeMultiDeleteMode, subTab, unselectAll]);

  if (isMobile && multiDeleteMode) {
    return (
      <H5Header
        pcHidden={false}
        isFixed={false}
        title={
          <div className="flex items-center gap-4px">
            <span>已选</span>
            <span className="text-[var(--ThemeColor-Main)]">{selectedCount}</span>
            <span>条</span>
          </div>
        }
        left={null}
        right={
          <button onClick={handleQuitMultiDeleteMode}>
            <CloseSvg />
          </button>
        }
      />
    );
  }

  return (
    <H5Header
      pcHidden={false}
      isFixed={false}
      onBack={closeMessageCenter}
      left={isMobile ? undefined : null}
      title={
        <div className="h-full flex items-center justify-center gap-32px">
          {MESSAGE_CENTER_TABS.map((tab) => (
            <div
              key={tab.value}
              onClick={() => changeActiveTab(tab.value)}
              className={clsx('h-full flex items-center justify-center cursor-pointer relative', {
                'pointer-events-none': activeTab === tab.value,
              })}
            >
              <span className="relative inline-block">
                {tab.label}
                {tab.value === EMessageCenterTabKey.MESSAGE && unreadInboxCount > 0 && (
                  <span
                    className="pointer-events-none absolute -right-3px top-0px h-6px w-6px rounded-full bg-[var(--Red-300)]"
                    aria-hidden
                  />
                )}
              </span>
              {activeTab === tab.value && (
                <span className="absolute w-20px bottom-0 left-1/2 -translate-x-1/2 h-2px rounded-full bg-[var(--ThemeColor-Main)]" />
              )}
            </div>
          ))}
        </div>
      }
      right={
        <>
          {isMobile && activeTab === EMessageCenterTabKey.MESSAGE && (
            <>
              <button
                onClick={() => openMsgEditor({})}
                className={clsx('w-24px h-24px  rounded-full flex items-center justify-center')}
              >
                <EditSvg className="w-20px h-20px text-[var(--Text-Main-10)]" />
              </button>
              <Popover
                className={styles.msgActionPopover}
                placement="bottom-end"
                content={
                  <div className={clsx('text-14px')}>
                    {subTab === EMessageTabKey.INBOX && (
                      <div
                        onClick={() => {
                          readMessageAll({ subTab });
                          setPopoverVisible(false);
                        }}
                        className={clsx(
                          'w-88px h-44px flex items-center justify-center',
                          'shadow-[0_-1px_0_0_var(--Background-500)_inset]',
                        )}
                      >
                        全部已读
                      </div>
                    )}
                    <div
                      onClick={() => {
                        openMultiDeleteMode();
                        setPopoverVisible(false);
                      }}
                      className={clsx('w-88px h-44px flex items-center justify-center')}
                    >
                      选择信息
                    </div>
                  </div>
                }
                trigger="click"
                visible={popoverVisible}
                onVisibleChange={setPopoverVisible}
              >
                <button
                  className={clsx(
                    'w-24px h-24px rounded-full flex items-center justify-center',
                    'ml-8px relative',
                  )}
                >
                  <ThreeDotsSvg className="w-20px h-20px text-[var(--Text-Main-10)]" />
                </button>
              </Popover>
            </>
          )}
          {!isMobile && (
            <button onClick={closeMessageCenter} className="flex items-center justify-center">
              <CloseSvg className="text-[var(--Text-Main-10)]" />
            </button>
          )}
        </>
      }
    />
  );
};
