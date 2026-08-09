import React, { useMemo, useState } from 'react';
import clsx from 'clsx';
import { EBetSettleResult } from '@/apis/commonSports/constants';
import { useClickBetItem } from '@/common/hooks/bet/useClickBetItem';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { openLoginModal } from '@/core/store/slices/authUISlice';
import type { BetShareCard, BetShareTeamItem, ChatMessage } from '@/core/sdk/IMManager';
import { getSystemTheme } from '@/utils';
import { SETTLED_RESULT_CONFIG } from '@/sites/op7/pages/BetHistoryPage/BetHistoryH5/constants';
import MessageHeader from '../MessageHeader';
import { handleFollowBet } from '../../../utils/followBetHandler';
import styles from './BetShareMessageItem.module.scss';
import Icon from '@/common/components/Icon';

interface BetShareMessageItemProps {
  message: ChatMessage;
  showHeader?: boolean;
}

const SUB_BETS_SHOW_MAX = 3;

/** 是否单关（勿用 seriesType<=1，2串1 的 bn 也是 1） */
const resolveIsSingle = (bet: BetShareCard): boolean => {
  if (typeof bet.isSingle === 'boolean') return bet.isSingle;
  return (bet.teamList?.length ?? 0) <= 1;
};

const asText = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return fallback;
};

/** 是否展示跟单按钮（对齐 emc actionBtn._renderFollowBet） */
const canShowFollowBtn = (bet: BetShareCard): boolean => {
  if (!resolveIsSingle(bet)) return false;
  const team = bet.teamList?.[0];
  if (!team) return false;
  // App：有赛果比分时不展示；其余单关始终展示（点后由 handleFollowBet 校验）
  if (team.score && String(team.score).trim()) return false;
  if (team.isSingleSettled) return false;
  return true;
};

/** 开赛时间展示（对齐 emc formatBetStartTime） */
const formatStartTime = (team?: BetShareTeamItem): string => {
  if (!team) return '';
  const raw = asText(team.startTime) || asText(team.matchDate);
  if (raw) {
    if (/^\d+$/.test(raw)) {
      const n = Number(raw);
      const ms = n < 1e12 ? n * 1000 : n;
      const d = new Date(ms);
      if (!Number.isNaN(d.getTime())) {
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const mi = String(d.getMinutes()).padStart(2, '0');
        return `${mm}-${dd} ${hh}:${mi}`;
      }
    }
    return raw;
  }
  if (typeof team.bt === 'number' && team.bt > 0) {
    const ms = team.bt < 1e12 ? team.bt * 1000 : team.bt;
    const d = new Date(ms);
    if (!Number.isNaN(d.getTime())) {
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const mi = String(d.getMinutes()).padStart(2, '0');
      return `${mm}-${dd} ${hh}:${mi}`;
    }
  }
  return '';
};

const formatMoney = (value: unknown): string => asText(value);

const isBetSettleResult = (value: number): value is EBetSettleResult =>
  value in SETTLED_RESULT_CONFIG;

/**
 * 结算结果 → 注单历史 SVG（复用 BetHistory SETTLED_RESULT_CONFIG）
 * 额外兼容 Flutter 聊天侧偶发码：15/17 失败、32 提前结算
 */
const resolveSrIconSrc = (betResult: string, isSettlement: boolean): string => {
  if (isSettlement || betResult === '32' || betResult === String(EBetSettleResult.EarlySettled)) {
    return SETTLED_RESULT_CONFIG[EBetSettleResult.EarlySettled].icon;
  }
  // Flutter share_order 失败码 15 / getSrIcon 17
  if (betResult === '15' || betResult === '17') {
    return SETTLED_RESULT_CONFIG[EBetSettleResult.BetFail].icon;
  }
  const code = Number(betResult);
  if (Number.isFinite(code) && isBetSettleResult(code)) {
    return SETTLED_RESULT_CONFIG[code].icon;
  }
  return SETTLED_RESULT_CONFIG[EBetSettleResult.BetFail].icon;
};

/** 票根齿轮条：正 + 翻转拼接（串关场次之间连接） */
const TicketJoin: React.FC<{ src: string }> = ({ src }) => (
  <div className={styles.ticketJoin} aria-hidden>
    <img className={styles.ticketEdge} src={src} alt="" height={5} />
    <img className={clsx(styles.ticketEdge, styles.ticketEdgeFlip)} src={src} alt="" height={5} />
  </div>
);

/**
 * 晒单/大单卡片（对齐 Figma 注单-未结算 + emc BetListItem isChatList）
 */
const BetShareMessageItem: React.FC<BetShareMessageItemProps> = ({
  message,
  showHeader = true,
}) => {
  const dispatch = useAppDispatch();
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const { clickBetItem } = useClickBetItem();
  const [following, setFollowing] = useState(false);
  /** 串关子注单展开（对齐 emc ExpandContent._subBetsExpanded） */
  const [subExpanded, setSubExpanded] = useState(false);

  const bet = useMemo(() => message.betInfo ?? {}, [message.betInfo]);
  // 聊天列表：单关=完整明细；串关固定紧凑态（对齐 itemHeader isChatList 强制 isExpand=false）
  const isSingle = resolveIsSingle(bet);
  const showFullDetail = isSingle;
  const teams = useMemo(() => bet.teamList ?? [], [bet.teamList]);
  const title = asText(bet.title, asText(message.content, '晒单'));
  const amount = formatMoney(bet.remainingAmt || bet.amount);
  const backAmount = formatMoney(bet.backAmount);
  const seriesOdds = asText(bet.oddFinally);
  const showFollow = canShowFollowBtn(bet);
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const theme = (themeMode === 'system' ? getSystemTheme() : themeMode) || 'light';
  const ticketSrc = `/images/${theme}/chat/bet_record_bottom.png`;
  const amountPrefix = bet.remainingAmt ? '剩余本金' : '投注';
  const backLabel = bet.isSettled ? '返还' : '可返还';

  /** 对齐 emc BetShareMessageItem._betType：全部队 betStatus 才视为已结算(2) */
  const isHeaderSettled = useMemo(() => {
    if (teams.length === 0) return !!bet.isSettled;
    return teams.every((team) => !!team.betStatus);
  }, [teams, bet.isSettled]);

  const resultIconSrc = useMemo(() => {
    if (!isHeaderSettled) return null;
    const betResult = asText(bet.betResult) || asText(teams[0]?.betResult);
    return resolveSrIconSrc(betResult, !!bet.isSettlement);
  }, [isHeaderSettled, bet.betResult, bet.isSettlement, teams]);

  /** Flutter ExpandContent：聊天串关 >3 条时默认只展示 3 条，可展开剩余 */
  const shouldCollapseSubs = !isSingle && teams.length > SUB_BETS_SHOW_MAX;
  const collapsedTeams = useMemo(() => {
    if (!shouldCollapseSubs || subExpanded) return teams;
    return teams.slice(0, SUB_BETS_SHOW_MAX);
  }, [shouldCollapseSubs, subExpanded, teams]);

  const handleFollow = () => {
    if (!isLogin) {
      dispatch(openLoginModal());
      return;
    }
    if (following) return;
    setFollowing(true);
    void handleFollowBet(bet, { clickBetItem }).finally(() => setFollowing(false));
  };

  const renderTeamBlock = (team: BetShareTeamItem, index: number) => {
    const league = asText(team.matchName) || asText(team.leagueName);
    const startTime = formatStartTime(team);
    const marketValue = asText(team.marketValue);
    const odds = asText(team.oddFinally) || asText(team.decimalOdds);
    const playName = asText(team.playName) || asText(team.scoreName);
    const handicap = asText(team.handicap);
    const betScoreRaw = asText(team.betScore);
    const betScore = betScoreRaw ? `[${betScoreRaw}]` : '';
    const playLine = [playName, handicap, betScore].filter(Boolean).join(' ');
    const score = asText(team.score);
    const isCorner = playName.includes('角球');

    return (
      <div key={`${team.matchId || index}-${marketValue}`} className={styles.teamBlock}>
        {!isSingle && team.matchInfo ? (
          <div className={styles.matchInfo}>{asText(team.matchInfo)}</div>
        ) : null}
        {(league || startTime) && (
          <div className={styles.leagueRow}>
            <span className={styles.leagueName}>{league}</span>
            {startTime ? <span className={styles.startTime}>{startTime}</span> : null}
          </div>
        )}
        <div className={styles.marketBox}>
          <div className={styles.marketTop}>
            <span className={styles.marketValue}>{marketValue}</span>
            {odds ? <span className={styles.odds}>@{odds}</span> : null}
          </div>
          {(playLine || score) && (
            <div className={styles.playRow}>
              <span className={styles.playLine}>{playLine}</span>
              {score ? (
                <span className={styles.scoreSide}>
                  {isCorner ? (
                    <img
                      className={styles.cornerIcon}
                      src="/images/common/discover/footer/corner_kick.png"
                      alt=""
                      width={10}
                      height={10}
                    />
                  ) : null}
                  <span className={styles.scoreText}>{score}</span>
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>
    );
  };

  /** 收起态摘要（对齐 emc ExpandContent） */
  const renderCollapsed = () => (
    <div className={styles.collapsedList}>
      {collapsedTeams.map((team, index) => {
        const marketValue = asText(team.marketValue);
        const odds = asText(team.oddFinally) || asText(team.decimalOdds);
        const isLast = index === collapsedTeams.length - 1;
        return (
          <React.Fragment key={`c-${team.matchId || index}`}>
            <div className={styles.collapsedItem}>
              {!isSingle && team.matchInfo ? (
                <div className={styles.collapsedMatch}>{asText(team.matchInfo)}</div>
              ) : null}
              <div className={styles.collapsedRow}>
                <span className={styles.collapsedMarket}>
                  {marketValue}
                  {odds ? ` @${odds}` : ''}
                </span>
                {isSingle && amount ? (
                  <span className={styles.collapsedAmount}>{amount}</span>
                ) : null}
              </div>
            </div>
            {!isLast ? <TicketJoin src={ticketSrc} /> : null}
          </React.Fragment>
        );
      })}
      {shouldCollapseSubs ? (
        <div className={styles.expandToggleWrap}>
          <button
            type="button"
            className={styles.expandToggle}
            onClick={() => setSubExpanded((value) => !value)}
          >
            {subExpanded ? '收起' : '展开'}
            <Icon
              src={subExpanded ? '/images/common/arrows_up.svg' : '/images/common/arrows_down.svg'}
              size="12px"
              color="var(--Text-800)"
            />
          </button>
        </div>
      ) : null}
      {!isSingle && (amount || backAmount) ? (
        <div className={clsx(styles.amountRow, styles.collapsedAmountRow)}>
          {amount ? (
            <div className={styles.amountItem}>
              <span className={styles.amountLabel}>{amountPrefix}: </span>
              <span className={styles.amountValue}>{amount}</span>
            </div>
          ) : (
            <span />
          )}
          {backAmount ? (
            <div className={clsx(styles.amountItem, styles.amountRightAlign)}>
              <span className={styles.amountLabel}>{backLabel}: </span>
              <span className={clsx(styles.amountValue, styles.backValue)}>{backAmount}</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  return (
    <div className={clsx(styles.wrap, message.isMine && styles.mine)}>
      <MessageHeader message={message} showHeader={showHeader} />
      {/* 外层不裁剪：底部齿轮可略微探出；上圆角只作用在 cardBody */}
      <article className={styles.betCard}>
        <div className={styles.cardBody}>
          <div className={styles.cardHead} aria-expanded={showFullDetail}>
            <span className={styles.headAccent} aria-hidden />
            {isSingle ? (
              <div className={styles.headTitle}>{title}</div>
            ) : (
              <div className={styles.headSeries}>
                <span className={styles.seriesLabel}>串关投注</span>
                <span className={styles.seriesTitle}>{title}</span>
                {seriesOdds ? (
                  <span className={styles.seriesOdds}>
                    <span className={styles.at}>@</span>
                    {seriesOdds}
                  </span>
                ) : null}
              </div>
            )}
            {resultIconSrc ? (
              <img className={styles.resultIcon} src={resultIconSrc} alt="" />
            ) : null}
          </div>

          {showFullDetail ? (
            <>
              <div className={styles.teamList}>
                {teams.map((team, index) => (
                  <React.Fragment key={`${team.matchId || index}`}>
                    {index > 0 ? <TicketJoin src={ticketSrc} /> : null}
                    {renderTeamBlock(team, index)}
                  </React.Fragment>
                ))}
              </div>

              {(amount || backAmount) && (
                <div className={styles.amountRow}>
                  {amount ? (
                    <div className={styles.amountItem}>
                      <span className={styles.amountLabel}>{amountPrefix}: </span>
                      <span className={styles.amountValue}>{amount}</span>
                    </div>
                  ) : (
                    <span />
                  )}
                  {backAmount ? (
                    <div className={clsx(styles.amountItem, styles.amountRightAlign)}>
                      <span className={styles.amountLabel}>{backLabel}: </span>
                      <span className={clsx(styles.amountValue, styles.backValue)}>
                        {backAmount}
                      </span>
                    </div>
                  ) : null}
                </div>
              )}

              {showFollow ? (
                <div className={styles.followWrap}>
                  <button
                    type="button"
                    className={styles.followBtn}
                    disabled={following}
                    onClick={handleFollow}
                  >
                    {following ? '跟单中…' : '跟单'}
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            renderCollapsed()
          )}
        </div>

        {/* 底部齿轮：在圆角主体之外，可向下探出半透明齿 */}
        <img className={styles.ticketEdgeBottom} src={ticketSrc} alt="" height={5} />
      </article>
    </div>
  );
};

export default BetShareMessageItem;
