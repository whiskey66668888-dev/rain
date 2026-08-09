import Skeleton from '@/common/components/Skeleton';
import Empty from '@/common/components/Empty';
import { MsgItem } from './MsgItem';
import { useAppSelector } from '@/core/store/hooks';
import { EMessageTabKey } from '@/core/store/slices/messageCenterSlice';

export const InboxList = () => {
  const inboxList = useAppSelector((state) => state.messageCenter.inboxList);
  const inboxLoading = useAppSelector((state) => state.messageCenter.inboxLoading);
  const inboxExpandedMap = useAppSelector((state) => state.messageCenter.inboxExpandedMap);
  const inboxSelectedMap = useAppSelector((state) => state.messageCenter.inboxSelectedMap);
  const inboxChildListMap = useAppSelector((state) => state.messageCenter.inboxChildListMap);

  if (!inboxList.length && inboxLoading) {
    return <Skeleton type="noticeList" />;
  }

  if (!inboxList.length && !inboxLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[240px] py-24px">
        <Empty className="h-auto" text="暂无消息" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-8px">
      {inboxList.map((item) => (
        <MsgItem
          key={item.id}
          type={EMessageTabKey.INBOX}
          data={item}
          expanded={inboxExpandedMap[item.id]}
          selected={inboxSelectedMap[item.id]}
          childMsg={inboxChildListMap[item.id]}
        />
      ))}
    </div>
  );
};
