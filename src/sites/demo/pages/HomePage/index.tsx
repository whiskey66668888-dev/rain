import React from 'react';
import { useTranslation } from 'react-i18next';

import { OBMenuListResponse, useMenuListQuery } from '@/apis/obSports/menu';
import { useBannerListQuery, type BannerItem } from '@/apis/origin/bannerList';

import styles from './HomePage.module.scss';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { data: bannerList = [] } = useBannerListQuery({ colorType: 'dark' });
  const { data: obMenuList = [] } = useMenuListQuery();

  return (
    <div className={`${styles.homePage}`}>
      <h1 className="p-4">{t('home.title')}</h1>
      <p>{t('header.welcome')}</p>

      <h2 className="text-lg font-bold mb-4 text-text-primary bg-[var(--color-bg-secondary)]">
        接口数据demo，SSR注入，客户端内容直出，js接收后再次请求更新列表（无需token的数据）
      </h2>
      <div className={'flex gap-10 flex-wrap'}>
        <section className={'flex gap-4 flex-col'}>
          <h3>主站接口Banner列表数据 ({bannerList.length})</h3>
          <ul>
            {bannerList.map((banner: BannerItem) => (
              <li key={banner.bannerId}>{banner.title}</li>
            ))}
          </ul>
        </section>
        <section className={'flex gap-4 flex-col'}>
          <h3>OB接口体育菜单列表数据 ({obMenuList.length})</h3>
          <ul>
            {obMenuList.map((menu: OBMenuListResponse) => (
              <li key={menu.menuId}>{menu.menuName}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
