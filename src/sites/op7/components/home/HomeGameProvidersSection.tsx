import React, { useMemo } from 'react';
import clsx from 'clsx';

import Icon from '@/common/components/Icon';
import LazyImage from '@/common/components/LazyImage';
import { useHomeList } from '@/common/hooks/useHomeList';
import { gameProviderData } from './constants';
import styles from './HomeGameProvidersSection.module.scss';

const HomeGameProvidersSection: React.FC = () => {
  const { homeList } = useHomeList();

  /** 仅展示 home/list 中存在对应 gameId 的供应商 logo */
  const visibleProviders = useMemo(() => {
    const gameIds = new Set(
      homeList.flatMap((category) =>
        (category.children ?? []).map((child) => String(child.gameId)),
      ),
    );
    return gameProviderData.filter((item) => item.id && gameIds.has(item.id));
  }, [homeList]);

  if (visibleProviders.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <Icon size="18px" color="var(--ThemeColor-Main)" src="/images/common/yxgys.svg" />
        <p className={clsx('_tf[14]', styles.title)}>游戏供应商</p>
      </div>
      <ul className={styles.list}>
        {visibleProviders.map((gameProvider) => (
          <li className={styles.item} key={gameProvider.id}>
            <LazyImage height={24} width={74} src={gameProvider.logo} lazy={false} />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default HomeGameProvidersSection;
