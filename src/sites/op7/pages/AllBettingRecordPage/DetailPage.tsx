import clsx from 'clsx';
import React, { useCallback, useMemo } from 'react';
import H5Header from '@/sites/op7/components/H5Header';
import DateRangePicker from '@/common/components/DateRangePicker';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeftSvg, CircleQuestionSvg } from '../../components/SvgIcons';
import dayjs from 'dayjs';
import { useGetTotalList } from '@/apis/origin/allBettingRecord/totalList';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { setExpandedMenuId } from '@/core/store/slices/entertainmentSlice';
import { gameList, getGameData, netAmountFormat } from './data';
import TipsModal, { TipsModalType } from './components/TipsModal';
import { StatDivider } from './components/StatDivider';
import { generatePath, useParams, useSearchParams } from 'react-router-dom';
import Skeleton from '@/common/components/Skeleton';
import Empty from '@/common/components/Empty';
import { TDateRange } from '@/utils/dateHelper';
import { todayRange } from '@/utils/dateHelper';
import {
  useDiscountTypeQuery,
  useDiscountListQuery,
} from '@/apis/origin/promotion/getDiscountList';
import { useOpenDiscountActivity } from '@/common/hooks/useOpenDiscountActivity';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';
import {
  ENTERTAINMENT_HOME_PAGE_TYPE,
  ENTERTAINMENT_MENU_ID,
  HomeListId,
} from '@/utils/constants/entertainment';
import { bigNB } from '@/utils/bet/bigMath';

/**
 * 投注记录
 */
/** 投注统计 gameBigType → 娱乐首页横向菜单 homeId（与 useHomeList 一致） */
const GAME_BIG_TYPE_TO_MENU_ID: Record<string, HomeListId> = {
  '2': HomeListId.SPORTS,
  '6': HomeListId.ESPORTS,
  '1': HomeListId.LIVE,
  '3': HomeListId.SLOTS,
  '5': HomeListId.POKER,
  '4': HomeListId.LOTTERY,
};

const AllBettingRecordDetailPage: React.FC = () => {
  const navigate = useNavigateWithLanguage();
  const { openDiscountDetail, openPromotionCategory } = useOpenDiscountActivity();
  const dispatch = useAppDispatch();
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const [searchParams, setSearchParams] = useSearchParams();
  const type = useParams().type;
  const begin = searchParams.get('begin');
  const end = searchParams.get('end');
  const [dateRange, setDateRange] = useState<TDateRange>(
    begin && end ? [dayjs(+begin).toDate(), dayjs(+end).toDate()] : todayRange(),
  );
  const { t } = useTranslation();
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [tipsModalType, setTipsModalType] = useState<TipsModalType>();

  const { data, isLoading } = useGetTotalList(
    {
      type: 'all',
      begin: dayjs(dateRange[0]).format('YYYY-MM-DD'),
      end: dayjs(dateRange[1]).format('YYYY-MM-DD'),
    },
    { enabled: isLogin },
  );

  const currGame = useMemo(() => {
    return getGameData(gameList, data?.list ?? [], type ?? '');
  }, [data?.list, type]);

  // 根据当前游戏名匹配优惠分类 typeId
  const { data: discountTypes } = useDiscountTypeQuery();
  const promotionTypeId = useMemo(() => {
    return discountTypes?.find((item) => item.name === currGame.gameName)?.typeId;
  }, [discountTypes, currGame.gameName]);

  const { data: promotionList } = useDiscountListQuery(promotionTypeId);
  const firstPromotion = promotionList?.[0];

  const onChangeDate = (dateRange: TDateRange) => {
    setDateRange(dateRange);
    setSearchParams(
      { begin: dateRange[0].getTime().toString(), end: dateRange[1].getTime().toString() },
      { replace: true },
    );
  };

  const handleTipsModalOpen = useCallback((type: TipsModalType) => {
    setShowTipsModal(true);
    setTipsModalType(type);
  }, []);

  const handleTipsModalClose = useCallback(() => {
    setShowTipsModal(false);
    setTipsModalType(undefined);
  }, []);

  const navigateToEntertainmentBetTab = useCallback(() => {
    const menuId =
      GAME_BIG_TYPE_TO_MENU_ID[type ?? ''] ??
      GAME_BIG_TYPE_TO_MENU_ID[currGame.gameBigType] ??
      ENTERTAINMENT_MENU_ID;
    dispatch(setExpandedMenuId(menuId));
    navigate(
      generatePath(PATHS.entertainment, {
        pageType: ENTERTAINMENT_HOME_PAGE_TYPE.HOME,
        id: '',
      }),
    );
  }, [currGame.gameBigType, dispatch, navigate, type]);

  return (
    <div
      data-desc="betting-record-detail-page"
      className={clsx(
        'self-center w-full ',
        'flex-1 flex flex-col ',
        'overflow-hidden lg:overflow-initial',
        'lg:max-w-[1220px]',
      )}
    >
      <H5Header
        title={currGame.gameName}
        right={
          <DateRangePicker
            value={dateRange}
            onChange={onChangeDate}
            className={clsx('flex gap-4px items-center')}
          >
            {(label, open) => (
              <>
                <div className="_tf[14] font-medium leading-[1.14] text-[var(--Text-Main-10)]">
                  {t(label)}
                </div>
                <ArrowLeftSvg
                  className={clsx(
                    'w-12px h-12px text-[var(--Text-Main-10)]',
                    'transition-transform duration-200',
                    open ? 'rotate-90' : 'rotate-270',
                  )}
                />
              </>
            )}
          </DateRangePicker>
        }
      />
      <div
        className={clsx(
          'shrink-0 lg:flex lg:items-center lg:justify-between lg:gap-12px lg:px-12px lg:mt-12px',
        )}
      >
        <DateRangePicker
          value={dateRange}
          onChange={onChangeDate}
          className={clsx(
            'hidden lg:flex',
            'gap-20px items-center justify-between',
            'bg-[var(--Background-300)] rounded-full',
            'px-12px py-6px lg:self-start',
          )}
          closeButtonClassName="!right-0"
        >
          {(label, open) => (
            <>
              <div className="_tf[12] font-500 leading-[1.66] text-[var(--Text-Main-10)]">
                {t(label)}
              </div>
              <ArrowLeftSvg
                className={clsx(
                  'w-10px h-10px text-[var(--Text-Main-10)]',
                  'transition-transform duration-200',
                  open ? 'rotate-90' : 'rotate-270',
                )}
              />
            </>
          )}
        </DateRangePicker>
        <div
          className={clsx(
            'shrink-0 flex gap-12px overflow-x-auto whitespace-nowrap',
            'bg-[var(--Background-300)] lg:bg-[transparent] py-8px',
            '_tf[12] font-medium leading-[1.33] text-[var(--Text-800)]',
          )}
        >
          <div className="pl-12px shrink-0 flex items-center">
            <span>总计：</span>
            <span>{currGame.betCount}单</span>
          </div>
          <StatDivider />
          <div className="shrink-0 flex items-center">
            <span>投注：</span>
            <span>{currGame.betAmount}</span>
          </div>
          <StatDivider />
          <div
            className="shrink-0 flex items-center"
            onClick={() => handleTipsModalOpen(TipsModalType.WITHDRAW_VALID_FLOW)}
          >
            <span>取款：</span>
            <span>{currGame.validAmount}</span>
            <CircleQuestionSvg className="ml-4px w-14px h-14px cursor-pointer text-[var(--Text-700)]" />
          </div>
          <StatDivider />
          <div className="shrink-0 flex items-center">
            <span>输赢：</span>
            <span className={currGame.netAmountClassName}>{currGame.netAmount}</span>
          </div>
          <StatDivider />
          <div
            className="pr-12px shrink-0 flex items-center"
            onClick={() => handleTipsModalOpen(TipsModalType.BONUS_VALID_FLOW)}
          >
            <span>优惠有效：</span>
            <span>{currGame.bonusAmount}</span>
            <CircleQuestionSvg className="ml-4px w-14px h-14px cursor-pointer text-[var(--Text-700)]" />
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-12px overflow-y-auto lg:overflow-initial p-12px">
        {!isLoading && currGame.childList.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-24px">
            <Empty type="data" className="h-auto" />
            <p className="mt-8px _tf[14] leading-[1.43] text-[var(--Text-800)] text-center">
              {currGame.noDataText}
            </p>

            {firstPromotion && (
              <div className="mt-16px w-full flex flex-col items-center gap-14px">
                <div
                  className="w-full rounded-8px overflow-hidden cursor-pointer flex justify-center"
                  onClick={() => openDiscountDetail(firstPromotion.id)}
                >
                  <img
                    src={firstPromotion.imageUrl}
                    alt={firstPromotion.title}
                    className="h-120px max-w-full object-contain"
                  />
                </div>
                {!!promotionTypeId && (
                  <div
                    className="flex items-center gap-4px cursor-pointer text-[var(--ThemeColor-Main)] _tf[14] leading-[1.43]"
                    onClick={() => openPromotionCategory(promotionTypeId)}
                  >
                    <span>更多{currGame.gameName}活动</span>
                    <ArrowLeftSvg className="w-12px h-12px rotate-180" />
                  </div>
                )}
              </div>
            )}

            <button
              className={clsx(
                'mt-24px px-48px py-10px rounded-full cursor-pointer',
                'bg-[var(--ThemeColor-Main)] text-white _tf[14] font-600',
              )}
              onClick={navigateToEntertainmentBetTab}
            >
              立即去投注
            </button>
          </div>
        ) : isLoading ? (
          [...Array(3).keys()].map((index) => (
            <Skeleton key={index} type="base" baseClassName="h-120px" />
          ))
        ) : (
          currGame.childList.map((item) => {
            const netMoney = netAmountFormat(item.net);
            return (
              <ul
                key={item.gameId}
                className={clsx(
                  'p-12px rounded-12px bg-[var(--Background-300)]',
                  'flex flex-col gap-8px',
                )}
              >
                <li className="flex justify-between gap-8px">
                  <div className="_tf[12] leading-[1.33] text-[var(--Text-800)]">
                    {item.gameName}
                  </div>
                  <p className={clsx('_tf[12] font-500 leading-[1.33]', netMoney.className)}>
                    {netMoney.val}
                  </p>
                </li>
                <li className="flex justify-between gap-8px">
                  <div className="_tf[12] leading-[1.33] text-[var(--Text-800)]">投注金额：</div>
                  <p className="_tf[12] font-500 leading-[1.33] text-[var(--Text-Main-10)]">
                    {bigNB(item.bet).toFixed(2)}
                  </p>
                </li>
                <li className="flex justify-between gap-8px">
                  <div className="_tf[12] leading-[1.33] text-[var(--Text-800)]">取款流水：</div>
                  <p className="_tf[12] font-500 leading-[1.33] text-[var(--Text-Main-10)]">
                    {bigNB(item.validUnMoney).toFixed(2)}
                  </p>
                </li>
                <li className="flex justify-between gap-8px">
                  <div className="_tf[12] leading-[1.33] text-[var(--Text-800)]">优惠有效：</div>
                  <p className="_tf[12] font-500 leading-[1.33] text-[var(--Text-Main-10)]">
                    {bigNB(item.bonus).toFixed(2)}
                  </p>
                </li>
                <li className="flex justify-between gap-8px">
                  <div className="_tf[12] leading-[1.33] text-[var(--Text-800)]">投注笔数：</div>
                  <p className="_tf[12] font-500 leading-[1.33] text-[var(--Text-Main-10)]">
                    {item.num}
                  </p>
                </li>
              </ul>
            );
          })
        )}
      </div>
      <TipsModal show={showTipsModal} onClose={handleTipsModalClose} type={tipsModalType} />
    </div>
  );
};

export default AllBettingRecordDetailPage;
