import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { useAppSelector } from '@/core/store/hooks';
import { PATHS } from '@/sites/op7/routes/paths';
import { useClickBetItem } from '@/common/hooks/bet/useClickBetItem';
import Icon from '@/common/components/Icon';
import { useMemoizedFn } from 'ahooks';
// components
import LazyImage from '@/common/components/LazyImage';
import ChampionHeader from './components/ChampionHeader';

import dayjs from 'dayjs';
import { MatchBaseInfo, TBaseBetItem } from '@/apis/commonSports/types';

// apis
import { useGetMatchChampionDetailQuery } from '@/apis/fbSports/getMatchDetail';
import styles from './index.module.scss';

/**
 * 赛事详情页面
 */
const Details: React.FC = () => {
  const { clickBetItem } = useClickBetItem();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigateWithLanguage();
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = screenBreakpoint === 'md';
  const [hideList, setHideList] = useState<string[]>([]);
  // 是否全部收起
  const [isHideAll, setHideAll] = useState<boolean>(false);

  // 获取冠军详情
  const { data: match } = useGetMatchChampionDetailQuery({
    matchId: id ? Number(id) : 0,
  });

  useEffect(() => {
    const children = match?.children || [];
    setHideAll(hideList.length == children.length);
  }, [hideList, match]);

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
      setHideList(match?.children.map((market) => market.itemType) ?? []);
    }
  };

  const onExpandItem = (itemType: string): void => {
    if (hideList.includes(itemType)) {
      setHideList(hideList.filter((item) => item !== itemType));
    } else {
      setHideList([...hideList, itemType]);
    }
  };

  const formatDateTime = (time: number): string => {
    try {
      return dayjs(time).format('YYYY年MM月DD日 HH:mm');
    } catch (e) {
      console.error(e, 'Failed to format FB time');
      return '';
    }
  };

  return (
    <section className="base-main-background">
      <div className={styles.championDetails}>
        <ChampionHeader
          leagueName={match?.leagueName ?? ''}
          matchDate={formatDateTime(match?.bt || 0)}
          onBack={handleBack}
          onRecord={handleRecord}
          isHideAll={isHideAll}
          onExpandAll={handleExpandAll}
        />
        <div className={styles.mainArea}>
          <div className={styles.mainList}>
            {match?.children.map((market) => {
              const isHide = isHideAll || hideList.includes(market.itemType);
              return (
                <div className={styles.wrapper} key={market.name}>
                  <div className={`${styles.wrapperTitle} ${isHide ? styles.hide : ''}`}>
                    <span className={`${styles.title} _tf[14]`}>{market.name}</span>
                    <span className={styles.button} onClick={() => onExpandItem(market.itemType)}>
                      <Icon
                        className={styles.iconExpand}
                        src="/images/common/arrow_sports.svg"
                        size={12}
                        color="var(--Text-800)"
                      />
                    </span>
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
                            onClick={() => (betItem?.betItemId ? onBet(match, betItem) : null)}
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
                            <div className={`${styles.right} _tf[14]`}>{betItem?.baseOdds}</div>
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
