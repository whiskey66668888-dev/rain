import Skeleton from '@/common/components/Skeleton';
import Empty from '@/common/components/Empty';
import { MsgItem } from './MsgItem';
import { useAppSelector } from '@/core/store/hooks';
import { EMessageTabKey } from '@/core/store/slices/messageCenterSlice';

export const OutboxList = () => {
  const outboxList = useAppSelector((state) => state.messageCenter.outboxList);
  const outboxLoading = useAppSelector((state) => state.messageCenter.outboxLoading);
  const outboxExpandedMap = useAppSelector((state) => state.messageCenter.outboxExpandedMap);
  const outboxSelectedMap = useAppSelector((state) => state.messageCenter.outboxSelectedMap);

  if (!outboxList.length && outboxLoading) {
    return <Skeleton type="noticeList" />;
  }

  if (!outboxList.length && !outboxLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[240px] py-24px">
        <Empty className="h-auto" text="暂无消息" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-8px">
      {outboxList.map((item) => (
        <MsgItem
          key={item.id}
          type={EMessageTabKey.OUTBOX}
          data={item}
          expanded={!!outboxExpandedMap[item.id]}
          selected={!!outboxSelectedMap[item.id]}
        />
      ))}
    </div>
  );
};
