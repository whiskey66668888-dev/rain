import React from 'react';
import clsx from 'clsx';

import Icon from '@/common/components/Icon';
import LazyImage from '@/common/components/LazyImage';
import { gameProviderData } from './constants';
import styles from './HomeGameProvidersSection.module.scss';

const HomeGameProvidersSection: React.FC = () => {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <Icon size="18px" color="var(--ThemeColor-Main)" src="/images/common/yxgys.svg" />
        <p className={clsx('_tf[14]', styles.title)}>游戏供应商</p>
      </div>
      <ul className={styles.list}>
        {gameProviderData.map((gameProvider, index) => (
          <li className={styles.item} key={`${gameProvider.logo}-${index}`}>
            <LazyImage height={24} width={74} src={gameProvider.logo} lazy={false} />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default HomeGameProvidersSection;
