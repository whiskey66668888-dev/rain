import React, { useState } from 'react';

import type { LineUpData, Player, TeamLite } from '@/apis/origin/discover';
import LazyImage from '@/common/components/LazyImage';
import Modal from '@/common/components/Modal';
import PlayerToken from '../PlayerToken';
import type { PlayerOption } from '../../types';
import {
  getCountryGroups,
  getEnvRows,
  getHeaderCenterText,
  getHeaderNationalityStats,
} from '../../utils';
import type { CountryGroup, NationalityStat } from '../../utils';
import styles from './index.module.scss';
import Icon from '@/common/components/Icon';
import Empty from '@/common/components/Empty';

const fallbackLogo = '/images/common/logo_small.png';
const defaultMember = '/images/common/discover/lineup/default_memmber.png';

const flattenRows = (rows: Player[][]): Player[] => rows.flat().slice(0, 11);

const CountryGroups: React.FC<{ groups: CountryGroup[] }> = ({ groups }) => (
  <div className={styles.countryGroups}>
    {groups.map((group) => (
      <section className={styles.countryGroup} key={group.logo}>
        <div className={styles.countryGroupHeader}>
          <LazyImage
            className={styles.countryLogo}
            src={group.logo}
            alt=""
            fallback={fallbackLogo}
          />
          <strong>{group.country || '-'}</strong>
          <span>球员数 {group.count}</span>
        </div>
        <div className={styles.countryPlayers}>
          {group.players.map((player) => (
            <div
              className={styles.countryPlayer}
              key={`${group.logo}-${player.player_id || player.shirt_num || player.player}`}
            >
              <LazyImage
                className={styles.countryPlayerAvatar}
                src={player.player_logo || defaultMember}
                alt=""
                fallback={defaultMember}
              />
              <b>#{player.shirt_num || '-'}</b>
              <span>{player.player || '-'}</span>
              <em>{player.position || '-'}</em>
            </div>
          ))}
        </div>
      </section>
    ))}
  </div>
);

const PitchHeader: React.FC<{
  team: TeamLite;
  formation?: string;
  coach?: string;
  centerText: string;
  nationalityStats?: NationalityStat[];
  onNationalityClick?: () => void;
  reverse?: boolean;
}> = ({
  team,
  formation,
  coach,
  centerText,
  nationalityStats = [],
  onNationalityClick,
  reverse,
}) => (
  <div className={styles.pitchHeader}>
    <div className={styles.teamFormation}>
      <img src={team.logo || fallbackLogo} alt="" />
      <b>{formation || '-'}</b>
    </div>
    {nationalityStats.length > 0 ? (
      <button type="button" className={styles.nationalStats} onClick={onNationalityClick}>
        <div className={styles.nationalList}>
          {nationalityStats.map((item) => (
            <span className={styles.nationalStat} key={item.logo}>
              <img src={item.logo} alt="" />
              <b>{item.count}</b>
            </span>
          ))}
        </div>

        <Icon
          src="/images/common/discover/lineup/jiantou.svg"
          size="12px"
          color="var(--White-100)"
        />
      </button>
    ) : (
      centerText && <span className={styles.centerText}>{centerText}</span>
    )}
    <strong className={reverse ? styles.rightCoach : undefined}>{coach || '-'}</strong>
  </div>
);

const Pitch: React.FC<{
  homeRows: Player[][];
  awayRows: Player[][];
  option: PlayerOption;
  side: 'current' | 'last';
  data?: LineUpData | null;
  homeTeam: TeamLite;
  awayTeam: TeamLite;
  showLineup: boolean;
  hasSelectedLineup: boolean;
  onSideChange: (side: 'current' | 'last') => void;
}> = ({
  homeRows,
  awayRows,
  option,
  side,
  data,
  homeTeam,
  awayTeam,
  showLineup,
  hasSelectedLineup,
  onSideChange,
}) => {
  const [countryPanel, setCountryPanel] = useState<{
    teamName: string;
    groups: CountryGroup[];
  } | null>(null);
  const coach = data?.info?.coach;
  const envRows = getEnvRows(data?.info?.env);
  const homeFormation =
    side === 'current' ? coach?.home?.team_formation : data?.last?.home_formation;
  const awayFormation =
    side === 'current' ? coach?.away?.team_formation : data?.last?.away_formation;

  const homePlayers = flattenRows(homeRows);
  const awayPlayers = flattenRows(awayRows);
  const homeCenterText = getHeaderCenterText(option, homePlayers, coach?.home);
  const awayCenterText = getHeaderCenterText(option, awayPlayers, coach?.away);
  const showNationalityStats = option === 'national_logo';
  const homeNationalityStats = showNationalityStats
    ? getHeaderNationalityStats(data, 'home', homePlayers)
    : [];
  const awayNationalityStats = showNationalityStats
    ? getHeaderNationalityStats(data, 'away', awayPlayers)
    : [];
  const awayOutfieldRows = awayRows.length > 1 ? awayRows.slice(0, -1) : [];
  const awayKeeperRow = awayRows[awayRows.length - 1] ?? [];
  const openCountryPanel = (teamName: string, groups: CountryGroup[]) => {
    if (groups.length === 0) return;
    setCountryPanel({ teamName, groups });
  };

  return (
    <div className={styles.pitchBlock}>
      {showLineup && (
        <PitchHeader
          team={homeTeam}
          formation={homeFormation}
          coach={coach?.home?.coach}
          centerText={homeCenterText}
          nationalityStats={homeNationalityStats}
          onNationalityClick={() =>
            openCountryPanel(homeTeam.name || '主队', getCountryGroups(data, 'home', homePlayers))
          }
        />
      )}

      {showLineup && (
        <div className={styles.pitch}>
          <div className={styles.segment}>
            <button
              type="button"
              className={side === 'current' ? styles.activeSegment : undefined}
              onClick={() => onSideChange('current')}
            >
              本场
            </button>
            <button
              type="button"
              className={side === 'last' ? styles.activeSegment : undefined}
              onClick={() => onSideChange('last')}
            >
              上场
            </button>
          </div>

          {!hasSelectedLineup ? (
            <Empty text={side === 'current' ? '暂无本场数据' : '暂无上场数据'} />
          ) : (
            <div className={styles.playersLayer}>
              <div className={styles.pitchHalf}>
                {homeRows.map((row, index) => (
                  <div className={styles.pitchRow} key={`home-${index}`}>
                    {row.map((player) => (
                      <PlayerToken
                        key={`${player.player_id ?? ''}-${player.shirt_num ?? ''}-${player.player ?? ''}`}
                        player={player}
                        option={option}
                        side="home"
                      />
                    ))}
                  </div>
                ))}
              </div>

              <div className={`${styles.pitchHalf} ${styles.awayPitchHalf}`}>
                {awayRows.length === 1 ? (
                  <div className={`${styles.pitchRow} ${styles.awayKeeperRow}`}>
                    {awayKeeperRow.map((player) => (
                      <PlayerToken
                        key={`${player.player_id ?? ''}-${player.shirt_num ?? ''}-${player.player ?? ''}`}
                        player={player}
                        option={option}
                        side="away"
                      />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className={styles.awayOutfieldRows}>
                      {awayOutfieldRows.map((row, index) => (
                        <div className={styles.pitchRow} key={`away-${index}`}>
                          {row.map((player) => (
                            <PlayerToken
                              key={`${player.player_id ?? ''}-${player.shirt_num ?? ''}-${player.player ?? ''}`}
                              player={player}
                              option={option}
                              side="away"
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                    <div className={`${styles.pitchRow} ${styles.awayKeeperRow}`}>
                      {awayKeeperRow.map((player) => (
                        <PlayerToken
                          key={`${player.player_id ?? ''}-${player.shirt_num ?? ''}-${player.player ?? ''}`}
                          player={player}
                          option={option}
                          side="away"
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {showLineup && (
        <PitchHeader
          team={awayTeam}
          formation={awayFormation}
          coach={coach?.away?.coach}
          centerText={awayCenterText}
          nationalityStats={awayNationalityStats}
          onNationalityClick={() =>
            openCountryPanel(awayTeam.name || '客队', getCountryGroups(data, 'away', awayPlayers))
          }
          reverse
        />
      )}

      {envRows.length > 0 && (
        <div className={styles.envTable}>
          {envRows.map((row) => (
            <div className={styles.envRow} key={row.label}>
              <span>{row.label}</span>
              <strong>{row.value}</strong>
            </div>
          ))}
        </div>
      )}

      <Modal
        show={Boolean(countryPanel)}
        title={`${countryPanel?.teamName || ''}-国籍`}
        onClose={() => setCountryPanel(null)}
        width={330}
        maxHeight={540}
        footer={null}
        className={styles.countryModal}
        contentClassName={styles.countryModalContent}
      >
        <CountryGroups groups={countryPanel?.groups ?? []} />
      </Modal>
    </div>
  );
};

export default Pitch;
