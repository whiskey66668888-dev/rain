/**
 * 简洁版赔率：无分页，只显示当前 simpleActiveItem 选中的玩法
 */

import React, { useMemo } from 'react';
import clsx from 'clsx';
import _ from 'lodash';
import { FBCompetitionMap } from '@/apis/fbSports/common/constants';
import type { TBaseBetItem, MatchMarket, MatchBaseInfo } from '@/apis/commonSports/types';
import styles from './OddListSimple.module.scss';
import { OddBtn } from './OddBtn';
import { LocalHandicapItem } from '@/apis/fbSports/common/types';
import { EOddsStatus } from '@/apis/commonSports/constants';
import { useAllBetItemIds } from '@/common/hooks/bet/useAllBetItemIds';
import { useAppSelector } from '@/core/store/hooks';
import Icon from '@/common/components/Icon';
import useSportsMainListControl from '@/common/hooks/useSportsMainListControl';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { generatePath } from 'react-router-dom';
import { PATHS } from '@/sites/op7/routes/paths';
import { buildMatchData } from '@/common/hooks/follow';

export interface SimpleOddListProps {
  sportId?: number;
  periodName?: string;
  matchMarket: MatchMarket[];
  isEnded: boolean;
  match: MatchBaseInfo;
  threeLineColumn?: boolean;
  hideMatchNum?: boolean;
  onToggleOdds: (betItem: TBaseBetItem) => void;
}

const SimpleOddList: React.FC<SimpleOddListProps> = ({
  sportId,
  matchMarket,
  isEnded,
  match,
  threeLineColumn,
  hideMatchNum,
  onToggleOdds,
}) => {
  const simpleActiveItem = useAppSelector(
    (state) => state.sport.mainList.settings.simpleActiveItem,
  );
  const allBetItemIds = useAllBetItemIds(match.matchId);
  const { changeFollowMatchStatus } = useSportsMainListControl();
  const navigate = useNavigateWithLanguage();
  /** 只显示当前简洁版 simpleActiveItem 选中的玩法（无分页，单玩法） */
  const activeHandicapItem = useMemo<LocalHandicapItem | null>(() => {
    let simpleActiveItemName = simpleActiveItem?.name;
    if (!simpleActiveItemName) {
      simpleActiveItemName =
        Object.values(FBCompetitionMap).find((item) => item.id === sportId)?.simpleList[0]?.name ??
        '';
    }
    return (
      Object.values(FBCompetitionMap)
        .find((item) => item.id === sportId)
        ?.simpleList.find((item) => item.name === simpleActiveItemName) ?? null
    );
  }, [sportId, simpleActiveItem?.name]);

  /** 根据传入 id 在接口 matchMarket 中找第一个 scoreId/playId 匹配的项 */
  const getOddsByCode = (id: number, _period: number): MatchMarket | undefined => {
    const idStr = String(id);
    return _.find(matchMarket, (item) => {
      const [type, period] = item.itemType.split('_');
      return type === idStr && (!_period || Number(period) === _period);
    });
  };

  /** 渲染当前选中的单行玩法 */
  const renderRow = (item: LocalHandicapItem) => {
    const odds = getOddsByCode(item.idList[0] ?? 0, item.period ?? 0);
    const list = odds?.children[0]?.lists ?? [];
    return (
      <div className={styles.row} key={`${item.idList[0]}-${item.name}`}>
        <div className={styles.title}>
          {!hideMatchNum && (
            <div
              className="flex items-center cursor-pointer"
              onClick={() =>
                navigate(generatePath(PATHS.sportsDetail, { matchId: String(match.matchId) }))
              }
            >
              <span className={styles.matchNum}>{match.matchNum}</span>
              <Icon
                src={'/images/common/arrow_right.svg'}
                size="8px"
                color={'var(--Text-800)'}
                className="mr-10px"
              />
            </div>
          )}
          <Icon
            src={match.isFollow ? '/images/common/followed.svg' : '/images/common/follow.svg'}
            size="16px"
            color={match.isFollow ? 'var(--Warning-200)' : 'var(--Icon-star)'}
            className={styles.titleIcon}
            onClick={() => {
              changeFollowMatchStatus(
                { matchId: match.matchId, sportId: match.viewId, bt: match.bt },
                match.isFollow ? 'remove' : 'add',
                buildMatchData(match),
              );
            }}
          />
        </div>
        <div className={styles.oddBtns}>
          {list.length > 0
            ? list.map((o, idx) => {
                const isLocked = !o || o.oddsStatus !== EOddsStatus.Open || isEnded;
                const isActive = allBetItemIds.includes(o.betItemId);

                return (
                  <OddBtn
                    key={o.betItemId ?? idx}
                    betItem={o}
                    isLocked={isLocked}
                    threeLine={item.row === 3}
                    threeLineColumn={threeLineColumn}
                    onClick={onToggleOdds}
                    active={isActive}
                    isProMode={false}
                    className={styles.oddBtn}
                  />
                );
              })
            : Array.from({ length: item.row ?? 2 }, (_, idx) => (
                <OddBtn key={idx} isLocked={isEnded} isProMode={false} className={styles.oddBtn} />
              ))}
        </div>
      </div>
    );
  };

  if (!activeHandicapItem) return null;

  return (
    <div className={clsx(styles.wrap, '_tf[12]')}>
      <div className={styles.pageBlock}>{renderRow(activeHandicapItem)}</div>
    </div>
  );
};

export default React.memo(SimpleOddList);
