import Skeleton from '@/common/components/Skeleton';
import { NoticeItem } from './NoticeItem';
import { useAppSelector } from '@/core/store/hooks';

export const NoticeList = () => {
  const noticeList = useAppSelector((state) => state.messageCenter.noticeList);
  const noticeLoading = useAppSelector((state) => state.messageCenter.noticeLoading);

  if (!noticeList.length && noticeLoading) {
    return <Skeleton type="noticeList" />;
  }

  return (
    <div className="flex-1 flex flex-col gap-8px">
      {noticeList.map((item) => (
        <NoticeItem
          key={item.id}
          title={item.title}
          content={item.content ?? ''}
          addTime={item.addTime ?? ''}
        />
      ))}
    </div>
  );
};
