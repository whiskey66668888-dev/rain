import React, { useMemo } from 'react';

import LazyImage from '@/common/components/LazyImage';
import type { StateStat, TeamLite } from '@/apis/origin/discover/sportsTypes';
import attackIcon from '@/sites/op7/images/common/discover/liveSituation/stiuation_attack.png.webp';
import attackDangerIcon from '@/sites/op7/images/common/discover/liveSituation/stiuation_attack_danger.png.webp';
import rateIcon from '@/sites/op7/images/common/discover/liveSituation/stiuation_rate.png.webp';
import cornerIcon from '@/sites/op7/images/common/discover/lineup/2.png';
import redCardIcon from '@/sites/op7/images/common/discover/lineup/4.png';
import yellowCardIcon from '@/sites/op7/images/common/discover/lineup/3.png';

import styles from './index.module.scss';

interface SituationViewProps {
  list: StateStat[];
  homeTeam: TeamLite;
  awayTeam: TeamLite;
}

interface SituationPieProps {
  title: string;
  icon: string;
  homeValue: number;
  awayValue: number;
}

interface ScoreItemProps {
  icon: string;
  value: number;
}

interface ScoreBarProps {
  title: string;
  homeScore: number;
  awayScore: number;
}

const fallbackLogo = '/images/common/logo_small.png';

const toInt = (value: unknown): number => {
  const next = Number(value);
  return Number.isFinite(next) ? next : 0;
};

const getStatValue = (map: Map<string, StateStat>, type: string, side: 'home' | 'away'): number =>
  toInt(map.get(type)?.[side]);

const SituationPie: React.FC<SituationPieProps> = ({ title, icon, homeValue, awayValue }) => {
  const total = homeValue + awayValue;
  const homeRate = total > 0 ? (homeValue / total) * 100 : 50;
  const homeStartRate = 100 - homeRate;

  return (
    <div className={styles.pieItem}>
      <div className={styles.pieTitle}>{title}</div>
      <div className={styles.pieBody}>
        <span>{homeValue}</span>
        <div
          className={styles.ring}
          style={{
            background: `conic-gradient(rgba(51, 143, 255, 0.25) 0 ${homeStartRate}%, rgba(51, 143, 255, 0.8) ${homeStartRate}% 100%)`,
          }}
        >
          <div className={styles.ringInner}>
            <img src={icon} alt="" />
          </div>
        </div>
        <span>{awayValue}</span>
      </div>
    </div>
  );
};

const ScoreItem: React.FC<ScoreItemProps> = ({ icon, value }) => (
  <div className={styles.scoreItem}>
    <img src={icon} alt="" />
    <span>{value}</span>
  </div>
);

const ScoreBar: React.FC<ScoreBarProps> = ({ title, homeScore, awayScore }) => {
  const total = homeScore + awayScore;
  const homeRate = total > 0 ? (homeScore / total) * 100 : 50;
  const awayRate = total > 0 ? (awayScore / total) * 100 : 50;

  return (
    <div className={styles.scoreBar}>
      <div className={styles.scoreBarTitle}>{title}</div>
      <div className={styles.scoreBarBody}>
        <span>{homeScore}</span>
        <div className={styles.scoreTrack}>
          <i style={{ width: `${homeRate}%` }} />
          <em style={{ width: `${awayRate}%` }} />
        </div>
        <span>{awayScore}</span>
      </div>
    </div>
  );
};

const SituationView: React.FC<SituationViewProps> = ({ list, homeTeam, awayTeam }) => {
  const statMap = useMemo(() => new Map(list.map((item) => [item.type, item])), [list]);

  const values = {
    attackHome: getStatValue(statMap, '23', 'home'),
    attackAway: getStatValue(statMap, '23', 'away'),
    dangerHome: getStatValue(statMap, '24', 'home'),
    dangerAway: getStatValue(statMap, '24', 'away'),
    rateHome: getStatValue(statMap, '25', 'home'),
    rateAway: getStatValue(statMap, '25', 'away'),
    cornerHome: getStatValue(statMap, '2', 'home'),
    cornerAway: getStatValue(statMap, '2', 'away'),
    yellowHome: getStatValue(statMap, '3', 'home'),
    yellowAway: getStatValue(statMap, '3', 'away'),
    redHome: getStatValue(statMap, '4', 'home'),
    redAway: getStatValue(statMap, '4', 'away'),
    shotTargetHome: getStatValue(statMap, '21', 'home'),
    shotTargetAway: getStatValue(statMap, '21', 'away'),
    shotMissHome: getStatValue(statMap, '22', 'home'),
    shotMissAway: getStatValue(statMap, '22', 'away'),
  };

  return (
    <section className={styles.situationView}>
      <div className="flex flex-col gap-[12px]">
        <div className={styles.teamRow}>
          <div className={styles.teamInfo}>
            <LazyImage
              src={homeTeam.logo || fallbackLogo}
              alt={homeTeam.name || '主队'}
              width={24}
              height={24}
              lazy={false}
              fallback={fallbackLogo}
            />
            <span>{homeTeam.name || '主队'}</span>
          </div>
          <div className={styles.teamInfo}>
            <span>{awayTeam.name || '客队'}</span>
            <LazyImage
              src={awayTeam.logo || fallbackLogo}
              alt={awayTeam.name || '客队'}
              width={24}
              height={24}
              lazy={false}
              fallback={fallbackLogo}
            />
          </div>
        </div>

        <div className={styles.pieRow}>
          <SituationPie
            title="进攻"
            icon={attackIcon}
            homeValue={values.attackHome}
            awayValue={values.attackAway}
          />
          <SituationPie
            title="危险进攻"
            icon={attackDangerIcon}
            homeValue={values.dangerHome}
            awayValue={values.dangerAway}
          />
          <SituationPie
            title="控球率"
            icon={rateIcon}
            homeValue={values.rateHome}
            awayValue={values.rateAway}
          />
        </div>
      </div>

      <div className={styles.scoreRow}>
        <ScoreItem icon={cornerIcon} value={values.cornerHome} />
        <ScoreItem icon={redCardIcon} value={values.redHome} />
        <ScoreItem icon={yellowCardIcon} value={values.yellowHome} />
        <div className={styles.scoreBars}>
          <ScoreBar
            title="射正球门"
            homeScore={values.shotTargetHome}
            awayScore={values.shotTargetAway}
          />
          <ScoreBar
            title="射偏球门"
            homeScore={values.shotMissHome}
            awayScore={values.shotMissAway}
          />
        </div>
        <ScoreItem icon={yellowCardIcon} value={values.yellowAway} />
        <ScoreItem icon={redCardIcon} value={values.redAway} />
        <ScoreItem icon={cornerIcon} value={values.cornerAway} />
      </div>
    </section>
  );
};

export default SituationView;
