import React, { useCallback, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import fileSaver from 'file-saver';
import QRCode from 'react-qr-code';

import { toast } from '@/common/components/Toast';
import Skeleton from '@/common/components/Skeleton';
import { useDiscoverLineUpQuery, useDiscoverMatchInfoQuery } from '@/apis/origin/discover';
import { usePreInfoQuery } from '@/apis/origin/setting';
import FooterView from '../FooterView';
import ChangeCard from './components/ChangeCard';
import { optionTabs } from './constants';
import InfoRows from './components/InfoRows';
import Pitch from './components/Pitch';
import PlayerListCard from './components/PlayerListCard';
import posterIcon from '@/sites/op7/images/common/discover/lineup/share_icon.png';
import type { LineUpProps, PlayerOption } from './types';
import { groupPitchPlayersByRow, hasPitchLineup } from './utils';
import styles from './LineUp.module.scss';
import Icon from '@/common/components/Icon';

const fallbackLogo = '/images/common/logo_small.png';
const posterRenderTimeout = 20_000;
const posterBlobTimeout = 10_000;

const formatPosterTime = (value?: string) => {
  if (!value) return '-';
  return value.length >= 16 ? value.slice(0, 16) : value;
};

const withTimeout = <T,>(promise: Promise<T>, timeout: number, message: string): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), timeout);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        window.clearTimeout(timer);
        reject(error instanceof Error ? error : new Error(message));
      },
    );
  });

const canvasToPngBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
  withTimeout(
    new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('生成图片失败'));
        }
      }, 'image/png');
    }),
    posterBlobTimeout,
    '生成图片超时',
  );

const LineUp: React.FC<LineUpProps> = ({ scheduleId, homeTeam, awayTeam, leagueName }) => {
  const posterCardRef = useRef<HTMLDivElement>(null);
  const matchInfoQuery = useDiscoverMatchInfoQuery(scheduleId, !!scheduleId);
  const { data: preInfo } = usePreInfoQuery();
  const homeTeamId = matchInfoQuery.data?.home_team_id ?? '';
  const awayTeamId = matchInfoQuery.data?.guest_team_id ?? '';
  const { data, isLoading } = useDiscoverLineUpQuery(
    scheduleId,
    !!scheduleId,
    homeTeamId,
    awayTeamId,
  );
  const [side, setSide] = useState<'current' | 'last'>('current');
  const [option, setOption] = useState<PlayerOption>('rating');
  const [posterSaving, setPosterSaving] = useState(false);
  const [posterVisible, setPosterVisible] = useState(false);

  const currentHome = useMemo(() => data?.info?.lineup?.home || [], [data?.info?.lineup?.home]);
  const currentAway = useMemo(() => data?.info?.lineup?.away || [], [data?.info?.lineup?.away]);
  const isEmptyLineUp = currentHome.length === 0 && currentAway.length === 0;
  const showPosterEntry = !isEmptyLineUp;
  const hasCurrentPitchLineup = hasPitchLineup(currentHome, currentAway);
  const hasPreviousPitchLineup = hasPitchLineup(data?.last?.home, data?.last?.away);
  const showPitchLineup = hasCurrentPitchLineup || hasPreviousPitchLineup;
  const matchInfo = matchInfoQuery.data;

  const activeLineup = side === 'current' ? data?.info?.lineup : data?.last;
  const homePlayers = useMemo(() => activeLineup?.home ?? [], [activeLineup?.home]);
  const awayPlayers = useMemo(() => activeLineup?.away ?? [], [activeLineup?.away]);

  const homeRows = useMemo(() => groupPitchPlayersByRow(homePlayers), [homePlayers]);
  const awayRows = useMemo(() => groupPitchPlayersByRow(awayPlayers, true), [awayPlayers]);
  const hasSelectedPitchLineup =
    side === 'current' ? hasCurrentPitchLineup : hasPreviousPitchLineup;
  const posterQrValue =
    (typeof preInfo?.downUrl === 'string' && preInfo.downUrl) ||
    (typeof window !== 'undefined' ? window.location.origin : '');

  const handleSavePoster = useCallback(async () => {
    const el = posterCardRef.current;
    if (!el || posterSaving) return;

    setPosterSaving(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await withTimeout(
        html2canvas(el, {
          useCORS: true,
          imageTimeout: 10_000,
          scale: 3,
          backgroundColor: null,
        }),
        posterRenderTimeout,
        '生成海报超时',
      );

      const blob = await canvasToPngBlob(canvas);
      const homeName = homeTeam.name || '主队';
      const awayName = awayTeam.name || '客队';
      fileSaver.saveAs(blob, `阵容海报-${homeName}vs${awayName}.png`);
      toast({ type: 'success', description: '图片已保存' });
    } catch (error) {
      console.error('生成阵容海报失败:', error);
      toast({
        type: 'warning',
        description:
          error instanceof Error && error.message.includes('超时')
            ? '生成海报超时，请重试'
            : '保存失败，请重试',
      });
    } finally {
      setPosterSaving(false);
    }
  }, [awayTeam.name, homeTeam.name, posterSaving]);

  if (isLoading) {
    return <Skeleton type="discoverLineUp" />;
  }

  return (
    <div className={styles.lineUp}>
      <div className={styles.content}>
        {!isEmptyLineUp && (
          <div>
            <div className={styles.titleBar}>
              <h3>首发阵容</h3>
              {showPosterEntry && (
                <button
                  type="button"
                  className={styles.posterButton}
                  onClick={() => setPosterVisible(true)}
                >
                  <img src={posterIcon} alt="" />
                  生成海报
                </button>
              )}
            </div>

            <InfoRows data={data} homeTeam={homeTeam} awayTeam={awayTeam} />

            <div className={styles.optionBar}>
              {optionTabs.map((item) => {
                const selected = option === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    className={clsx(selected && styles.activeOption)}
                    onClick={() => setOption(item.key)}
                    title={item.label}
                  >
                    <img src={selected ? item.activeIcon : item.icon} alt="" />
                    {selected && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>

            <Pitch
              homeRows={homeRows}
              awayRows={awayRows}
              option={option}
              side={side}
              data={data}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
              showLineup={showPitchLineup}
              hasSelectedLineup={hasSelectedPitchLineup}
              onSideChange={setSide}
            />
          </div>
        )}

        {data?.last?.away_last_match_str && side === 'last' && (
          <div className={styles.lastHint}>{data.last.away_last_match_str}</div>
        )}

        <ChangeCard
          title="本场换人"
          home={data?.other?.change?.home || []}
          away={data?.other?.change?.away || []}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
        />

        <PlayerListCard
          title="替补未上场的球员"
          home={data?.other?.substitute?.home || []}
          away={data?.other?.substitute?.away || []}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
        />

        <PlayerListCard
          title="伤停名单"
          home={data?.other?.injury?.home || []}
          away={data?.other?.injury?.away || []}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
        />

        <FooterView />

        {showPosterEntry &&
          posterVisible &&
          typeof document !== 'undefined' &&
          createPortal(
            <div className={styles.posterOverlay}>
              <div className={styles.posterScroll}>
                <div className={styles.posterCard} ref={posterCardRef}>
                  <div className={styles.posterHero}>
                    <div className={styles.posterLeague}>{leagueName || '-'}</div>
                    <div className={styles.posterTime}>
                      {formatPosterTime(matchInfo?.match_time)}
                    </div>
                    <div className={styles.posterTeams}>
                      <div className={styles.posterTeam}>
                        <img src={homeTeam.logo || matchInfo?.home_logo || fallbackLogo} alt="" />
                        <strong>{homeTeam.name || matchInfo?.home_team_name || '-'}</strong>
                        <span>{leagueName || '-'}</span>
                      </div>
                      <div className={styles.posterScore}>
                        <span>{matchInfo?.match_state_name || '-'}</span>
                        <b>
                          {matchInfo?.home_score || '0'} - {matchInfo?.guest_score || '0'}
                        </b>
                      </div>
                      <div className={styles.posterTeam}>
                        <img src={awayTeam.logo || matchInfo?.guest_logo || fallbackLogo} alt="" />
                        <strong>{awayTeam.name || matchInfo?.guest_team_name || '-'}</strong>
                        <span>{leagueName || '-'}</span>
                      </div>
                    </div>
                  </div>
                  {showPitchLineup && (
                    <div className={styles.posterPitchWrap}>
                      <Pitch
                        homeRows={homeRows}
                        awayRows={awayRows}
                        option={option}
                        side={side}
                        data={data}
                        homeTeam={homeTeam}
                        awayTeam={awayTeam}
                        showLineup
                        hasSelectedLineup={hasSelectedPitchLineup}
                        onSideChange={setSide}
                      />
                    </div>
                  )}
                  <div className={styles.posterQrBar}>
                    <div className={styles.posterQr}>
                      <QRCode value={posterQrValue || 'OP7'} size={30} level="H" />
                    </div>
                    <div className={styles.posterBrandText}>
                      <strong>OP7</strong>
                      <span>顶级的赛事体验</span>
                    </div>
                    <img className={styles.posterLogo} src="/images/common/op7.png" alt="" />
                  </div>
                </div>
              </div>
              <div className={styles.posterActions}>
                <button
                  type="button"
                  className={styles.posterSaveButton}
                  disabled={posterSaving}
                  onClick={() => {
                    void handleSavePoster();
                  }}
                >
                  <Icon src="/images/common/ic_save.svg" size={16} color="var(--ThemeColor-Main)" />
                  {posterSaving ? '保存中' : '保存本地'}
                </button>
                <button
                  type="button"
                  className={styles.posterCancelButton}
                  onClick={() => setPosterVisible(false)}
                >
                  取消
                </button>
              </div>
            </div>,
            document.body,
          )}
      </div>
    </div>
  );
};

export default LineUp;
