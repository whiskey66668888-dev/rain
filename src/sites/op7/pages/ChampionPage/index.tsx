import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMemoizedFn } from 'ahooks';
import dayjs from 'dayjs';

import Icon from '@/common/components/Icon';
import LazyImage from '@/common/components/LazyImage';
import { useClickBetItem } from '@/common/hooks/bet/useClickBetItem';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { useVenueService } from '@/apis/commonSports';
import { MatchBaseInfo, TBaseBetItem } from '@/apis/commonSports/types';
import { useAppSelector } from '@/core/store/hooks';
import { useOddsDisplay } from '@/common/hooks/sports/useOddsDisplay';
import { PATHS } from '@/sites/op7/routes/paths';

import ChampionHeader from './components/ChampionHeader';
import styles from './index.module.scss';

const formatDateTime = (time?: number): string => {
  if (!time) return '';
  const date = dayjs(time);
  return date.isValid() ? date.format('YYYY年MM月DD日 HH:mm') : '';
};

/**
 * 赛事详情页面
 */
const Details: React.FC = () => {
  const { clickBetItem } = useClickBetItem();
  const { getOddsDisplay } = useOddsDisplay();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigateWithLanguage();
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = screenBreakpoint === 'md';
  const [hideList, setHideList] = useState<string[]>([]);

  const { sportId } = useAppSelector((state) => state.sport.mainList.settings);

  // 获取冠军详情
  const { useGetMatchChampionDetailQuery } = useVenueService();
  const { data: match } = useGetMatchChampionDetailQuery({
    matchId: id ?? '',
    sportId,
  });

  const markets = match?.children ?? [];

  const hiddenMarketTypes = useMemo(() => new Set(hideList), [hideList]);
  const isHideAll =
    markets.length > 0 && markets.every((market) => hiddenMarketTypes.has(market.name));

  // 处理返回：PC 回体育列表；H5 回上一页
  const handleBack = (): void => {
    if (isMobile) {
      navigate(-1);
    } else {
      navigate(PATHS.sports);
    }
  };

  // 打开注单
  const handleRecord = () => {
    navigate(PATHS.betHistoryH5);
  };

  // 去下注
  const onBet = useMemoizedFn((match: MatchBaseInfo, betItem: TBaseBetItem) => {
    clickBetItem({ baseMatch: match, baseBetItem: betItem });
  });

  // 展开或收起
  const handleExpandAll = (): void => {
    if (isHideAll) {
      setHideList([]);
    } else {
      setHideList([...new Set(markets.map((market) => market.name))]);
    }
  };

  const onExpandItem = (name: string): void => {
    setHideList((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name],
    );
  };

  return (
    <section className="base-main-background">
      <div className={styles.championDetails}>
        <ChampionHeader
          leagueName={match?.leagueName ?? ''}
          matchDate={formatDateTime(match?.bt)}
          onBack={handleBack}
          onRecord={handleRecord}
          isHideAll={isHideAll}
          onExpandAll={handleExpandAll}
        />
        <div className={styles.mainArea}>
          <div className={styles.mainList}>
            {markets.map((market) => {
              const isHide = hiddenMarketTypes.has(market.name);
              return (
                <div className={styles.wrapper} key={`${market.itemType}-${market.name}`}>
                  <div className={`${styles.wrapperTitle} ${isHide ? styles.hide : ''}`}>
                    <span className={`${styles.title} _tf[14]`}>{market.name}</span>
                    <button
                      type="button"
                      className={styles.button}
                      aria-label={isHide ? `展开${market.name}` : `收起${market.name}`}
                      aria-expanded={!isHide}
                      onClick={() => onExpandItem(market.name)}
                    >
                      <Icon
                        className={styles.iconExpand}
                        src="/images/common/arrow_sports.svg"
                        size={12}
                        color="var(--Text-800)"
                      />
                    </button>
                  </div>

                  <div className={`${styles.subList} ${isHide ? styles.hide : ''}`}>
                    {market.children.map((betTypeItem) => {
                      const lists = betTypeItem.lists;
                      if (lists && lists.length > 0) {
                        const betItem = lists[0];
                        return (
                          <div
                            className={styles.betItem}
                            key={betItem?.betItemId}
                            onClick={() => {
                              if (match && betItem?.betItemId) onBet(match, betItem);
                            }}
                          >
                            <div className={styles.left}>
                              <LazyImage
                                className={styles.icon}
                                src={betItem?.teamIcon ?? ''}
                                alt="icon"
                              />
                              <span className={`${styles.betTitle} _tf[14]`}>
                                {betItem?.betItemShortName}
                              </span>
                            </div>
                            <div className={`${styles.right} _tf[14]`}>
                              {
                                getOddsDisplay({
                                  baseOdds: betItem?.baseOdds,
                                  isSupportHK: betItem?.isSupportHK,
                                }).odds
                              }
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Details;
