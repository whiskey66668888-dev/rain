/**
 * 专业版赔率：根据 OddsMap 展示玩法，匹配到接口 scoreId 则渲染该 score 的 list（赔率项），能一页显示完则单页，否则按 maxRows 分页（Swiper）
 */

import React, { useMemo, useRef, useState, useCallback } from 'react';
import clsx from 'clsx';
import _ from 'lodash';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';
import { FBCompetitionMap, FBSportIdValue } from '@/apis/fbSports/common/constants';
import type { TBaseBetItem, MatchMarket } from '@/apis/commonSports/types';
import styles from './OddListPro.module.scss';
import 'swiper/css';
import 'swiper/css/pagination';
import { OddBtn } from './OddBtn';
import { LocalHandicapItem } from '@/apis/fbSports/common/types';
import { EFbPeriod } from '@/apis/fbSports/common/constants/period';
import { EOddsStatus } from '@/apis/commonSports/constants';
import LazyImage from '@/common/components/LazyImage';
import { useAllBetItemIds } from '@/common/hooks/bet/useAllBetItemIds';
import { useAppSelector } from '@/core/store/hooks';

function chunk<T>(arr: T[], size: number): T[][] {
  if (size <= 0 || !arr.length) return arr.length ? [arr] : [];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export interface ProOddListProps {
  matchId: string | number;
  sportId?: number;
  /** 每页最多展示的列数（md=2，lg=4，xl+=8） */
  maxRows?: number;
  periodName?: string;
  matchMarket: MatchMarket[];
  isEnded: boolean;
  threeLineColumn?: boolean;
  onToggleOdds: (betItem: TBaseBetItem) => void;
  /** 可选的过滤市场类型列表，只显示这些类型的玩法 */
  filterMarketTypes?: number[];
}

const ProOddList: React.FC<ProOddListProps> = ({
  matchId,
  sportId,
  maxRows = 2,
  matchMarket,
  periodName,
  isEnded,
  threeLineColumn,
  onToggleOdds,
  filterMarketTypes,
}) => {
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const allBetItemIds = useAllBetItemIds(matchId);
  const swiperRef = useRef<SwiperRef>(null);
  const [nav, setNav] = useState({ canGoPrev: false, canGoNext: false });
  const colsPerPage = Math.max(1, maxRows ?? 2);

  const syncNav = useCallback((swiper: { isBeginning: boolean; isEnd: boolean }) => {
    setNav({ canGoPrev: !swiper.isBeginning, canGoNext: !swiper.isEnd });
  }, []);
  /** 按当前能显示的总数分页：能全部显示完则返回单页数组，否则按 maxRows 分多页 */
  const pages = useMemo(() => {
    let allOdds =
      Object.values(_.cloneDeep(FBCompetitionMap)).find((item) => item.id === sportId)?.list ?? [];
    if (!allOdds.length) return [];
    if (sportId === FBSportIdValue.Football && periodName === '下半场') {
      // RICO_TODO: 这里参考app暂时写死FB，后续兼容多个三方api做处理
      // 下半场不显示上半场赔率
      allOdds = allOdds.filter((item) => item.period !== EFbPeriod.soccerFirstHalf);
    }
    // pc端,3列的就不加占位列了
    if (allOdds.length === 3 && isMobile) {
      // 只有3个盘口的话，这里还原app占位第四个
      allOdds.push({ name: '占位', idList: [99999], period: EFbPeriod.basketballFullTime });
    }
    // 如果提供了过滤类型，只显示匹配的玩法
    if (filterMarketTypes && filterMarketTypes.length > 0) {
      const filterSet = new Set(filterMarketTypes.map(String));
      allOdds = allOdds.filter((item) => {
        const marketTypeId = item.idList[0];
        return marketTypeId && filterSet.has(String(marketTypeId));
      });
    }
    if (allOdds.length <= colsPerPage) return [allOdds];
    return chunk(allOdds, colsPerPage);
  }, [sportId, periodName, isMobile, filterMarketTypes, colsPerPage]);

  /** 根据传入 id 在接口 matchMarket 中找第一个 scoreId/playId 匹配的项，匹配则返回该 score，否则返回 undefined */
  const getOddsByCode = (id: number, _period: number): MatchMarket | undefined => {
    const idStr = String(id);
    return _.find(matchMarket, (item) => {
      const [type, period] = item.itemType.split('_');
      return type === idStr && (!_period || Number(period) === _period);
    });
  };

  /** 渲染单个玩法：匹配到接口数据则渲染 list（赔率项），否则渲染- */
  const renderRow = (item: LocalHandicapItem, index: number) => {
    const odds = getOddsByCode(item.idList[0] ?? 0, item.period ?? 0);
    const title = item.name;
    const list = odds?.children[0]?.lists ?? [];
    return (
      <div className={styles.row} key={`${item.idList[0]}-${index}`}>
        <div className={clsx(styles.title, title === '占位' && 'opacity-0')}>{title}</div>
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
                  />
                );
              })
            : Array.from({ length: item.row ?? 2 }, (_, idx) => (
                <OddBtn key={idx} isLocked={isEnded} />
              ))}
        </div>
      </div>
    );
  };

  const renderPage = (odds: LocalHandicapItem[]) => (
    <div className={styles.pageBlock}>{odds.map((item, index) => renderRow(item, index))}</div>
  );

  if (!pages.length) return null;

  const useSwiper = pages.length > 1;
  return (
    <div className={clsx(styles.wrap, '_tf[12]')}>
      {useSwiper ? (
        <div className={styles.swiperContainer}>
          <Swiper
            modules={[Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            pagination={{ clickable: true }}
            className={styles.swiper}
            ref={swiperRef}
            onSwiper={syncNav}
            onSlideChange={syncNav}
          >
            {pages.map((page, i) => (
              <SwiperSlide key={i}>{renderPage(page)}</SwiperSlide>
            ))}
          </Swiper>
          {nav.canGoPrev && (
            <LazyImage
              src={'/images/common/arrows.png'}
              className={styles.swiperPrev}
              lazy={false}
              width={16}
              height={16}
              onClick={() => swiperRef.current?.swiper?.slidePrev()}
            />
          )}
          {nav.canGoNext && (
            <LazyImage
              src={'/images/common/arrows.png'}
              className={styles.swiperNext}
              lazy={false}
              width={16}
              height={16}
              onClick={() => swiperRef.current?.swiper?.slideNext()}
            />
          )}
        </div>
      ) : (
        renderPage(pages[0] ?? [])
      )}
    </div>
  );
};

export default React.memo(ProOddList);
