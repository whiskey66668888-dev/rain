import clsx from 'clsx';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';

import Icon from '@/common/components/Icon';
import LazyImage from '@/common/components/LazyImage';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { useAppSelector } from '@/core/store/hooks';
import { PATHS } from '@/sites/op7/routes/paths';
import { getSystemTheme } from '@/utils';
import { partnersData } from './constants';
import styles from './HomePartnersSection.module.scss';

const HomePartnersSection: React.FC = () => {
  const navigate = useNavigateWithLanguage();
  const { t } = useTranslation();
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const theme = themeMode === 'system' ? getSystemTheme() : themeMode;
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const handleTabClick = (id: number) => {
    if (isMobile) {
      navigate(generatePath(PATHS.sponsorDetail, { id: String(id) }));
    } else {
      window.open(generatePath(PATHS.PcSponsorDetail, { id: `${id}` }), '_blank');
    }
  };
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <Icon size="18px" color="var(--ThemeColor-Main)" src="/images/common/partners.svg" />
        <p className={clsx('_tf[14]', styles.title)}>赞助伙伴</p>
      </div>
      <ul className={styles.list}>
        {partnersData.map((partner) => (
          <li className={styles.item} key={partner.id} onClick={() => handleTabClick(partner.id)}>
            <LazyImage
              width={36}
              height={36}
              src={`/images/${theme}/sponsor/${partner.logo}`}
              alt={partner.name}
              className={styles.logo}
            />
            <div className={styles.textBlock}>
              <p className={styles.name}>{t(partner.name)}</p>
              <p className={styles.desc}>{t(partner.description)}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default HomePartnersSection;
