import { NoticeItem } from './NoticeItem';
import dayjs from 'dayjs';
import Skeleton from '@/common/components/Skeleton';
import { useAppSelector } from '@/core/store/hooks';

export const SportsNoticeList = () => {
  const fbNoticeList = useAppSelector((state) => state.messageCenter.fbNoticeList);
  const fbNoticeLoading = useAppSelector((state) => state.messageCenter.fbNoticeLoading);

  if (!fbNoticeList.length && fbNoticeLoading) {
    return <Skeleton type="noticeList" />;
  }
  return (
    <div className="flex-1 flex flex-col gap-8px">
      {fbNoticeList.map((item) => (
        <NoticeItem
          key={item.id}
          title={item.ti}
          content={item.co}
          addTime={dayjs(item.pt).format('YYYY-MM-DD HH:mm:ss')}
        />
      ))}
    </div>
  );
};
