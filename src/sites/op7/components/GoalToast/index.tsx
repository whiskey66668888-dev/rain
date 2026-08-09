/**
 * 进球提示 Toast 组件
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { MatchBaseInfo } from '@/apis/commonSports/types';
import { getListReq } from '@/apis/fbSports/getList';
import { FBSportIdValue } from '@/apis/fbSports/common/constants';
import { useAppSelector } from '@/core/store/hooks';
import goalSoundUrl from './goal_default.mp3';
import styles from './GoalToast.module.scss';
import clsx from 'clsx';

const GOAL_POLL_INTERVAL = 10 * 1000;
const TOAST_VISIBLE_DURATION = 3000;
const TOAST_FADE_DURATION = 300;

type MatchScoreSnapshot = Pick<
  MatchBaseInfo,
  'matchId' | 'homeScore' | 'awayScore' | 'homeName' | 'awayName' | 'matchTime'
>;

interface GoalToastItem {
  minuteText: string | number;
  homeName: string;
  awayName: string;
  homeScore: number;
  awayScore: number;
  scoringSide: 'home' | 'away';
}

const GoalToast: React.FC = () => {
  const followMatch = useAppSelector((state) => state.sport.mainList.settings.followMatch);
  const scoreSnapshotRef = useRef<Map<number, MatchScoreSnapshot>>(new Map());
  const goalAudioRef = useRef<HTMLAudioElement | null>(null);
  const toastQueueRef = useRef<GoalToastItem[]>([]);
  const toastTimerRef = useRef<number | null>(null);
  const toastFadeTimerRef = useRef<number | null>(null);
  const [activeToast, setActiveToast] = useState<GoalToastItem | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const isOpenGoalSound = useAppSelector((state) => state.sport.isOpenGoalSound);
  const footballFollowMatchIds = useMemo(
    () =>
      followMatch
        .filter((item) => Number(item.sportId) === Number(FBSportIdValue.Football))
        .map((item) => item.matchId),
    [followMatch],
  );

  useEffect(() => {
    goalAudioRef.current = new Audio(goalSoundUrl);
    goalAudioRef.current.preload = 'auto';
    return () => {
      goalAudioRef.current?.pause();
      goalAudioRef.current = null;
    };
  }, []);

  const playGoalSound = useCallback(() => {
    const audio = goalAudioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  }, []);

  const clearToastTimers = useCallback(() => {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    if (toastFadeTimerRef.current !== null) {
      window.clearTimeout(toastFadeTimerRef.current);
      toastFadeTimerRef.current = null;
    }
  }, []);

  const processNextToast = useCallback(() => {
    if (toastQueueRef.current.length === 0) return;
    const next = toastQueueRef.current.shift();
    if (!next) return;
    setActiveToast(next);
    setToastVisible(true);
  }, []);

  useEffect(() => {
    if (!activeToast) {
      if (toastQueueRef.current.length > 0) {
        processNextToast();
      }
      return;
    }
    clearToastTimers();
    toastTimerRef.current = window.setTimeout(() => {
      setToastVisible(false);
      toastFadeTimerRef.current = window.setTimeout(() => {
        setActiveToast(null);
      }, TOAST_FADE_DURATION);
    }, TOAST_VISIBLE_DURATION);

    return clearToastTimers;
  }, [activeToast, clearToastTimers, processNextToast]);

  useEffect(() => clearToastTimers, [clearToastTimers]);

  const enqueueGoalToast = useCallback(
    (toast: GoalToastItem) => {
      setActiveToast((current) => {
        if (current) {
          toastQueueRef.current.push(toast);
          return current;
        }
        setToastVisible(true);
        return toast;
      });
    },
    [setActiveToast],
  );

  useEffect(() => {
    if (footballFollowMatchIds.length === 0 || !isOpenGoalSound) {
      scoreSnapshotRef.current.clear();
      toastQueueRef.current = [];
      setActiveToast(null);
      setToastVisible(false);
      return;
    }

    let cancelled = false;
    let fetching = false;

    const pollFollowFootballMatches = async () => {
      if (fetching) return;
      fetching = true;

      try {
        const result = await getListReq({
          size: 50,
          matchIds: footballFollowMatchIds,
          sportIds: [FBSportIdValue.Football],
          isPC: true,
        });
        if (cancelled) return;

        const latestMatches = result.data ?? [];
        const nextSnapshot = new Map<number, MatchScoreSnapshot>();

        latestMatches.forEach((match) => {
          const previous = scoreSnapshotRef.current.get(match.matchId);
          const hasPrevious = previous !== undefined;
          const homeScored = hasPrevious && match.homeScore > previous.homeScore;
          const awayScored = hasPrevious && match.awayScore > previous.awayScore;
          // 分钟时间
          const minuteText = Number.isFinite(Number(match.matchTime))
            ? Math.floor(match.matchTime / 60)
            : '-';

          if (homeScored) {
            playGoalSound();
            enqueueGoalToast({
              minuteText,
              homeName: match.homeName,
              awayName: match.awayName,
              homeScore: match.homeScore,
              awayScore: match.awayScore,
              scoringSide: 'home',
            });
          }
          if (awayScored) {
            playGoalSound();
            enqueueGoalToast({
              minuteText,
              homeName: match.homeName,
              awayName: match.awayName,
              homeScore: match.homeScore,
              awayScore: match.awayScore,
              scoringSide: 'away',
            });
          }

          nextSnapshot.set(match.matchId, {
            matchId: match.matchId,
            homeScore: match.homeScore,
            awayScore: match.awayScore,
            homeName: match.homeName,
            awayName: match.awayName,
            matchTime: match.matchTime,
          });
        });

        scoreSnapshotRef.current = nextSnapshot;
      } finally {
        fetching = false;
      }
    };

    void pollFollowFootballMatches();
    const timer = window.setInterval(() => {
      void pollFollowFootballMatches();
    }, GOAL_POLL_INTERVAL);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [enqueueGoalToast, footballFollowMatchIds, playGoalSound, isOpenGoalSound]);

  return (
    <div className={styles.goalToastPortal}>
      {activeToast && (
        <div
          className={clsx(
            styles.goalToast,
            toastVisible ? styles.enter : styles.leave,
            activeToast.scoringSide === 'away' && styles.awayToast,
          )}
        >
          <div className={styles.left}>
            <span className={styles.minute}>{activeToast.minuteText}&#39;</span>
            <img className={styles.ballIcon} src="/images/common/goal.png" alt="football" />
            <div className={styles.teamBox}>
              <span
                className={`${styles.teamName} ${
                  activeToast.scoringSide === 'home' ? styles.scorer : styles.normal
                }`}
              >
                {activeToast.homeName}
              </span>
              <span
                className={`${styles.teamName} ${
                  activeToast.scoringSide === 'away' ? styles.scorer : styles.normal
                }`}
              >
                {activeToast.awayName}
              </span>
            </div>
          </div>

          <div className={styles.right}>
            <span className={styles.goalText}>进球</span>
            <span className={styles.divider} />
            <div className={styles.scoreColumn}>
              <span className={styles.score}>{activeToast.homeScore}</span>
              <span className={styles.score}>{activeToast.awayScore}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalToast;
