import SponsorList from '../components/SponsorList/SponsorList';
import { useSponsorListQuery } from '@/apis/origin/promotion/getSponsorList';
import Empty from '@/common/components/Empty';
import SponsorSkeleton from '@/common/components/Skeleton/promotion/sponsor';
import { Fragment } from 'react/jsx-runtime';
import MyPullToRefresh from '@/common/components/MyPullToRefresh';

const SponsorPage = () => {
  const { data: sponsorList, isLoading, refetch } = useSponsorListQuery();

  return (
    <Fragment>
      <MyPullToRefresh
        disabled={isLoading}
        threshold={30}
        onRefresh={async () => {
          await refetch();
        }}
      >
        {isLoading ? (
          <SponsorSkeleton />
        ) : sponsorList?.length ? (
          <SponsorList data={sponsorList} />
        ) : (
          <Empty />
        )}
      </MyPullToRefresh>
    </Fragment>
  );
};

export default SponsorPage;
