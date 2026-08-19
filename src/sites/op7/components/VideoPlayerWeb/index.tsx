import React, { useEffect, useMemo, useRef, useState } from 'react';
import { generatePath } from 'react-router-dom';
import clsx from 'clsx';
import Icon from '@/common/components/Icon';
import { useGetSportVideoQuery } from '@/apis/fbSports/getSportVideo';
import { useVenueService } from '@/apis/commonSports';
import { EVenue, PlayType, PlayTypeId } from '@/apis/commonSports/constants';
import Timing from '@/common/components/Timing';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { useAppSelector } from '@/core/store/hooks';
import { PATHS } from '@/sites/op7/routes/paths';
import type { MatchBaseInfo } from '@/apis/commonSports/types';
import type { VideoLine } from '../../pages/SportsDetailsPage/type';
import VideoPlayer from '../../pages/SportsDetailsPage/components/VideoPlayer';
import AnimationView from '../../pages/SportsDetailsPage/components/AnimationView';
import SportCard from '../../pages/SportsDetailsPage/components/MatchInfo/sportCard';
import styles from './index.module.scss';

type MediaMode = 'video' | 'animation' | 'scoreboard';

type SourceMatch = {
  id?: number | string;
  matchId?: number | string;
  ms?: number;
};

interface VideoPlayerWebProps {
  sourceMatch?: SourceMatch;
  matchInfo?: MatchBaseInfo;
}

const VideoPlayerWeb: React.FC<VideoPlayerWebProps> = ({ sourceMatch, matchInfo }) => {
  const navigate = useNavigateWithLanguage();
  const venue = useAppSelector((state) => state.sport.venue);
  const isOb = venue === EVenue.OB;
  const { useGetMainListQuery } = useVenueService();
  const [currentMode, setCurrentMode] = useState<MediaMode>('scoreboard');
  const [leagueDropdownOpen, setLeagueDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userAdjustedRef = useRef(false);

  const handleMatchClick = (matchId: string) => {
    setLeagueDropdownOpen(false);
    navigate(generatePath(PATHS.sportsDetail, { matchId }));
  };

  const leagueId = matchInfo?.leagueId ?? 0;
  const sportId = matchInfo?.sportId ?? 0;
  const playType = useAppSelector((state) => state.sport.mainList.settings.playType);

  const currentMatchType = (() => {
    switch (playType) {
      case PlayType.Today:
        return PlayTypeId.Today;
      case PlayType.Early:
        return PlayTypeId.Early;
      default:
        return PlayTypeId.Living;
    }
  })();

  // 按当前场馆拉同联赛赛事（OB 需带 sportId 才能解析 euid）
  const { data: leagueListData } = useGetMainListQuery(
    {
      sportId,
      leagueIds: [leagueId],
      type: currentMatchType,
      size: 50,
    },
    { enabled: leagueDropdownOpen && leagueId > 0 && sportId > 0 },
  );

  const leagueMatches = useMemo<MatchBaseInfo[]>(() => {
    if (!leagueListData?.pages) return [];
    return leagueListData.pages.flat();
  }, [leagueListData]);

  useEffect(() => {
    if (!leagueDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLeagueDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [leagueDropdownOpen]);

  // OB mid 可能超长，保持字符串，避免 Number 精度丢失
  const mediaMatchId = useMemo(() => {
    const raw = sourceMatch?.id ?? sourceMatch?.matchId ?? matchInfo?.matchId;
    const id = String(raw ?? '').trim();
    if (!id || id === '0' || id === '-1' || id === 'NaN') return '';
    return id;
  }, [sourceMatch, matchInfo?.matchId]);

  useEffect(() => {
    userAdjustedRef.current = false;
  }, [mediaMatchId]);

  const shouldFetchMedia = useMemo(() => {
    if (!mediaMatchId) return false;
    // OB 无 FB 的 ms=5 语义，以 isLive 为准
    if (isOb) return !!matchInfo?.isLive;
    if (sourceMatch?.ms != null) return sourceMatch.ms === 5;
    return !!matchInfo?.isLive;
  }, [mediaMatchId, isOb, sourceMatch?.ms, matchInfo?.isLive]);

  const videoParams = useMemo(
    () => (mediaMatchId ? { gameType: isOb ? 'OB' : 'FB', matchId: mediaMatchId } : null),
    [mediaMatchId, isOb],
  );

  const { data: videoData } = useGetSportVideoQuery(videoParams, {
    enabled: !!videoParams && shouldFetchMedia,
  });

  const videoLines = useMemo<VideoLine[]>(() => {
    if (!Array.isArray(videoData?.data?.live)) return [];
    return videoData.data.live
      .filter((live) => live?.url && live.url.trim() !== '')
      .map((live) => ({
        url: live.url || '',
        refererUrl: live.refererUrl,
      }));
  }, [videoData]);

  const animationUrls = useMemo<string[]>(() => {
    if (!Array.isArray(videoData?.data?.mlive)) return [];
    return videoData.data.mlive.filter((url) => !!url && url.trim() !== '');
  }, [videoData]);

  const animationUrl = useMemo(() => animationUrls[0] ?? '', [animationUrls]);
  const hasVideo = videoLines.length > 0;
  const hasAnimation = animationUrl !== '';
  const hasScoreboard = !!matchInfo;

  const matchTitle = useMemo(() => {
    if (!matchInfo) return '';
    const { homeName, awayName } = matchInfo;
    if (!homeName && !awayName) return '';
    return `${homeName || ''} vs ${awayName || ''}`.trim();
  }, [matchInfo]);

  useEffect(() => {
    if (userAdjustedRef.current) return;
    if (hasVideo) setCurrentMode('video');
    else if (hasAnimation) setCurrentMode('animation');
    else setCurrentMode('scoreboard');
  }, [hasVideo, hasAnimation]);

  useEffect(() => {
    if (currentMode === 'video' && !hasVideo) {
      setCurrentMode(hasAnimation ? 'animation' : 'scoreboard');
    } else if (currentMode === 'animation' && !hasAnimation) {
      setCurrentMode(hasVideo ? 'video' : 'scoreboard');
    }
  }, [hasVideo, hasAnimation, currentMode]);

  const selectMode = (mode: MediaMode) => {
    userAdjustedRef.current = true;
    setCurrentMode(mode);
  };

  const showMediaChrome = hasVideo || hasAnimation || hasScoreboard;
  if (!showMediaChrome) return null;

  const renderMain = () => {
    if (currentMode === 'scoreboard' && hasScoreboard && matchInfo) {
      return (
        <div className={styles.scoreboardWrapper}>
          <SportCard matchInfo={matchInfo} isMobile={false} />
        </div>
      );
    }
    if (currentMode === 'video' && hasVideo) {
      return (
        <div className={styles.mediaAspectWrapper}>
          <VideoPlayer lines={videoLines} initialLineIndex={0} autoPlay={true} rounded />
        </div>
      );
    }
    if (currentMode === 'animation' && hasAnimation) {
      return (
        <div className={styles.mediaAspectWrapper}>
          <AnimationView url={animationUrl} isVideo={false} rounded />
        </div>
      );
    }
    if (hasScoreboard && matchInfo) {
      return (
        <div className={styles.scoreboardWrapper}>
          <SportCard matchInfo={matchInfo} isMobile={false} />
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.mediaView}>
      <div className={styles.webMediaHeader}>
        <div className={styles.matchTitleWrapper} ref={dropdownRef}>
          <button
            type="button"
            className={styles.matchTitleBtn}
            aria-label="当前赛事"
            onClick={() => leagueId > 0 && setLeagueDropdownOpen((v) => !v)}
          >
            <span className={styles.matchTitleText}>{matchTitle || '—'}</span>
            <span
              className={styles.arrowIcon}
              style={{ transform: leagueDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              <Icon
                src="/images/common/rightSidebar/down_left.svg"
                size={12}
                color="var(--Text-Main-10)"
              />
            </span>
          </button>
          {leagueDropdownOpen && (
            <div className={styles.leagueDropdown}>
              {matchInfo?.leagueName && (
                <div className={styles.leagueDropdownHeader}>{matchInfo.leagueName}</div>
              )}
              {leagueMatches.length === 0 ? (
                <div className={styles.leagueDropdownEmpty}>暂无赛事</div>
              ) : (
                leagueMatches.map((match) => (
                  <div
                    key={match.matchId}
                    className={`${styles.leagueDropdownItem}${String(match.matchId) === mediaMatchId ? ` ${styles.leagueDropdownItemActive}` : ''}`}
                    onClick={() => handleMatchClick(match.matchId)}
                  >
                    <div className={styles.leagueDropdownTeam}>
                      {match.homeLogo && (
                        <img src={match.homeLogo} className={styles.leagueDropdownLogo} alt="" />
                      )}
                      <span
                        className={clsx(
                          styles.leagueDropdownTeamName,
                          match.nameBold === 'home' && styles.leagueDropdownTeamNameBold,
                        )}
                      >
                        {match.homeName}
                      </span>
                    </div>
                    <div className={styles.leagueDropdownScore}>
                      {match.isLive ? (
                        <>
                          <div className={styles.leagueDropdownPeriod}>
                            <span>{match.periodName}</span>
                            {match.matchTime !== 0 && (
                              <Timing
                                time={match.matchTime}
                                running={match.isCountdown}
                                isCountdown={match.clockType === 'DESC'}
                                className={styles.leagueDropdownTiming}
                              />
                            )}
                          </div>
                          <span className={styles.leagueDropdownScoreText}>
                            {match.homeScore} - {match.awayScore}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className={styles.leagueDropdownDate}>
                            {match.matchDate.split(' ')[0]}
                          </span>
                          <span className={styles.leagueDropdownTime}>
                            {match.matchDate.split(' ')[1]}
                          </span>
                        </>
                      )}
                    </div>
                    <div className={styles.leagueDropdownTeam}>
                      {match.awayLogo && (
                        <img src={match.awayLogo} className={styles.leagueDropdownLogo} alt="" />
                      )}
                      <span
                        className={clsx(
                          styles.leagueDropdownTeamName,
                          match.nameBold === 'away' && styles.leagueDropdownTeamNameBold,
                        )}
                      >
                        {match.awayName}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <div className={styles.modeButtons}>
          {hasVideo && (
            <button
              type="button"
              // className={clsx(styles.modeBtn, currentMode === 'video' && styles.modeBtnActive)}
              disabled={!hasVideo}
              aria-pressed={currentMode === 'video'}
              aria-label="视频"
              onClick={() => hasVideo && selectMode('video')}
            >
              <Icon
                src="/images/common/sportsDetails/video_icon.svg"
                size={16}
                color={currentMode === 'video' ? 'var(--ThemeColor-Main)' : 'var(--Text-700)'}
              />
            </button>
          )}
          {hasAnimation && (
            <button
              type="button"
              disabled={!hasAnimation}
              aria-pressed={currentMode === 'animation'}
              aria-label="动画"
              onClick={() => hasAnimation && selectMode('animation')}
            >
              <Icon
                src="/images/common/sportsDetails/dh.svg"
                size={16}
                color={currentMode === 'animation' ? 'var(--ThemeColor-Main)' : 'var(--Text-700)'}
              />
            </button>
          )}
          <button
            type="button"
            disabled={!hasScoreboard}
            aria-pressed={currentMode === 'scoreboard'}
            aria-label="数据板"
            onClick={() => hasScoreboard && selectMode('scoreboard')}
          >
            <Icon
              src="/images/common/sportsDetails/sj.svg"
              size={16}
              color={currentMode === 'scoreboard' ? 'var(--ThemeColor-Main)' : 'var(--Text-700)'}
            />
          </button>
        </div>
      </div>
      <div
        className={`${styles.videoContainer}${
          currentMode === 'scoreboard' && hasScoreboard ? ` ${styles.videoContainerScrollable}` : ''
        }`}
      >
        {renderMain()}
      </div>
    </div>
  );
};

export default VideoPlayerWeb;
