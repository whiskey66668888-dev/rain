import React, { useMemo } from 'react';
import clsx from 'clsx';

import type { Environment } from '@/apis/origin/discover';

import styles from './index.module.scss';

const WeatherCard: React.FC<{ weather?: Environment; compact?: boolean }> = ({
  weather,
  compact = false,
}) => {
  const hasWeatherInfo = useMemo(() => {
    return [
      weather?.temperature,
      weather?.weather_name,
      weather?.humidity,
      weather?.pressure,
      weather?.wind,
    ].some((item) => typeof item === 'string' && item.trim().length > 0);
  }, [weather]);

  if (!hasWeatherInfo) return null;

  return (
    <section className={clsx(styles.weather, compact && styles.compact)}>
      <div className={styles.card}>
        <div className={styles.weatherLeft}>
          <div>{weather?.temperature}</div>
          <div>{weather?.weather_name}</div>
        </div>
        <div className={styles.weatherDivider} />
        <div className={styles.weatherRight}>
          <div className={styles.rightItem}>
            <div>
              湿度：<span>{weather?.humidity}</span>
            </div>
            <div>
              气压：<span>{weather?.pressure}</span>
            </div>
          </div>
          <div className={styles.rightItem}>
            <div>
              风速：<span>{weather?.wind}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WeatherCard;
