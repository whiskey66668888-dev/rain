'use client';

import { PATHS } from '@/sites/op7/routes/paths';
import styles from './SponsorList.module.scss';
import { generatePath } from 'react-router-dom';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import LazyImage from '@/common/components/LazyImage';
import { useAppSelector } from '@/core/store/hooks';
import { getSystemTheme } from '@/utils';

export interface SponsorItem {
  id: number;
  resourceName: string;
  daytimeMaterialContent: string;
  nightMaterialContent: string;
  jumpType: number;
  targetAddress: string;
  sort: number;
}

interface Props {
  data: SponsorItem[] | undefined;
  // loading?: boolean; // ✅ 新增 loading
  onClick?: (item: SponsorItem) => void;
}

const SponsorList = ({ data, onClick }: Props) => {
  // const SponsorList = ({ data, loading, onClick }: Props) => {
  const navigate = useNavigateWithLanguage();
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const theme = themeMode === 'system' ? getSystemTheme() : themeMode;
  const isMobile = useAppSelector((state) => state.config.isMobile);
  if (!data?.length) {
    return <div className={styles.empty}>No Sponsor</div>;
  }

  return (
    <div className={styles.SponsorBox}>
      <div className={styles.list}>
        {data
          .sort((a, b) => a.sort - b.sort)
          .map((item) => (
            <div
              key={item.id}
              className={styles.card}
              onClick={() => {
                if (onClick) {
                  onClick(item);
                } else {
                  if (item.jumpType === 1) {
                    if (isMobile) {
                      const id = item.id; // 从 URL 中提取 ID
                      return navigate(generatePath(PATHS.sponsorDetail, { id: `${id}` }));
                    }
                    window.open(
                      generatePath(PATHS.PcSponsorDetail, { id: `${item.id}` }),
                      '_blank',
                    );
                  } else {
                    window.open(item.targetAddress, '_blank');
                  }
                }
              }}
            >
              <LazyImage
                src={item.daytimeMaterialContent}
                alt={item.resourceName}
                className={styles.image}
                aspectRatio={'351 / 179'}
                placeholder={<img src={`/images/${theme}/discount_lazy_new.png`}></img>}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default SponsorList;
