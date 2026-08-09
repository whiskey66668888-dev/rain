import clsx from 'clsx';
import React, { useCallback, useMemo } from 'react';
import H5Header from '@/sites/op7/components/H5Header';
import DateRangePicker from '@/common/components/DateRangePicker';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeftSvg, CircleQuestionSvg } from '../../components/SvgIcons';
import dayjs from 'dayjs';
import { useGetTotalList } from '@/apis/origin/allBettingRecord/totalList';
import { useAppSelector } from '@/core/store/hooks';
import bigMath from '@/utils/bet/bigMath';
import { formatGameList, gameList, netAmountFormat } from './data';
import TipsModal, { TipsModalType } from './components/TipsModal';
import { StatDividerAbsolute } from './components/StatDivider';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { generatePath, useSearchParams } from 'react-router-dom';
import { PATHS } from '@/sites/op7/routes/paths';
import { TDateRange } from '@/utils/dateHelper';
import { todayRange } from '@/utils/dateHelper';

/**
 * 投注记录
 */
const AllBettingRecordPage: React.FC = () => {
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const [searchParams, setSearchParams] = useSearchParams();
  const begin = searchParams.get('begin');
  const end = searchParams.get('end');
  const [dateRange, setDateRange] = useState<TDateRange>(
    begin && end ? [dayjs(+begin).toDate(), dayjs(+end).toDate()] : todayRange(),
  );
  const { t } = useTranslation();
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [tipsModalType, setTipsModalType] = useState<TipsModalType>();

  const navigate = useNavigateWithLanguage();

  const { data } = useGetTotalList(
    {
      type: 'all',
      begin: dayjs(dateRange[0]).format('YYYY-MM-DD'),
      end: dayjs(dateRange[1]).format('YYYY-MM-DD'),
    },
    { enabled: isLogin },
  );

  const { total, list } = useMemo(() => {
    return {
      total: data?.total,
      list: data?.list,
    };
  }, [data]);

  const netMoney = useMemo(() => {
    return netAmountFormat(total?.net || 0);
  }, [total?.net]);

  const displayList = useMemo(() => {
    return formatGameList(gameList, list ?? []);
  }, [list]);

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

  const handleDetail = useCallback(
    (type: string) => {
      const begin = dateRange[0].getTime();
      const end = dateRange[1].getTime();
      navigate(`${generatePath(PATHS.allBettingRecordDetail, { type })}?begin=${begin}&end=${end}`);
    },
    [navigate, dateRange],
  );

  return (
    <div
      data-desc="all-betting-record-page"
      className={clsx(
        'self-center w-full ',
        'flex-1 flex flex-col ',
        'overflow-hidden lg:overflow-initial',
        'lg:max-w-[1220px]',
      )}
    >
      <H5Header
        title="投注记录"
        right={
          <DateRangePicker
            value={dateRange}
            onChange={onChangeDate}
            closeButtonClassName="!right-0"
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
          closeButtonClassName="!right-0"
          className={clsx(
            'hidden lg:flex',
            'gap-20px items-center justify-between',
            'bg-[var(--Background-300)] rounded-full',
            'px-12px py-6px lg:self-start',
          )}
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
            'shrink-0 flex overflow-x-auto whitespace-nowrap',
            'bg-[var(--Background-300)] lg:bg-[transparent] py-8px',
            '_tf[12] font-medium leading-[1.33] text-[var(--Text-800)]',
          )}
        >
          <div className="shrink-0 px-12px relative min-w-[25%] text-center">
            <span>投注：</span>
            <span>{bigMath.decimals(total?.bet || 0, { padZero: true })}</span>
            <StatDividerAbsolute />
          </div>
          <div className="shrink-0 px-12px relative min-w-[25%] text-center">
            <span>取款：</span>
            <span>{bigMath.decimals(total?.validUnMoney || 0, { padZero: true })}</span>
            <StatDividerAbsolute />
          </div>
          <div className="shrink-0 px-12px relative min-w-[25%] text-center">
            <span>优惠：</span>
            <span>{bigMath.decimals(total?.bonus || 0, { padZero: true })}</span>
            <StatDividerAbsolute />
          </div>
          <div className="shrink-0 px-12px min-w-[25%] text-center">
            <span>输赢：</span>
            <span className={netMoney.className}>{netMoney.val}</span>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-12px overflow-y-auto lg:overflow-y-initial p-12px">
        {displayList?.map((item) => (
          <div
            key={item.gameBigType}
            className={clsx(
              'p-12px rounded-12px bg-[var(--Background-300)] shadow-[0_1px_4px_0_var(--Shadow-900)]',
            )}
          >
            <div
              className="flex items-center justify-between"
              onClick={() => handleDetail(item.gameBigType)}
            >
              <div className="flex items-center gap-12px">
                <div
                  className="rounded-6px"
                  style={{ boxShadow: `0 3px 6px 0 ${item.shadowColor}` }}
                >
                  <img src={item.gameIcon} alt={item.gameName} className="h-32px w-32px" />
                </div>
                <div>
                  <p className="_tf[14] leading-[1.14] text-[var(--Text-Main-10)]">
                    {item.gameName}
                  </p>
                  <p className="mt-2px _tf[12] leading-[1.16] text-[var(--ThemeColor-Main)]">
                    {item.betCount}单
                  </p>
                </div>
              </div>
              <ArrowLeftSvg className="w-10px h-10px text-[var(--Text-700)] rotate-180" />
            </div>
            <ul className="mt-12px grid grid-cols-4">
              <li className="shrink-0 overflow-hidden flex flex-col gap-8px">
                <div className="_tf[12] leading-[1.33] text-[var(--Text-800)]">投注金额</div>
                <p className="_tf[12] font-500 leading-[1.33] text-[var(--Text-Main-10)]">
                  {item.betAmount}
                </p>
              </li>
              <li className="shrink-0 overflow-hidden flex flex-col gap-8px">
                <div
                  className={clsx(
                    '_tf[12] leading-[1.33] text-[var(--Text-800)]',
                    'flex items-center gap-2px',
                  )}
                  onClick={() => handleTipsModalOpen(TipsModalType.WITHDRAW_VALID_FLOW)}
                >
                  <p>取款流水</p>
                  <CircleQuestionSvg className="w-14px h-14px cursor-pointer text-[var(--Text-700)]" />
                </div>
                <p className="_tf[12] font-500 leading-[1.33] text-[var(--Text-Main-10)]">
                  {item.validAmount}
                </p>
              </li>
              <li className="shrink-0 overflow-hidden flex flex-col gap-8px">
                <div
                  className={clsx(
                    '_tf[12] leading-[1.33] text-[var(--Text-800)]',
                    'flex items-center gap-2px',
                  )}
                  onClick={() => handleTipsModalOpen(TipsModalType.BONUS_VALID_FLOW)}
                >
                  <p>有效优惠</p>
                  <CircleQuestionSvg className="w-14px h-14px cursor-pointer text-[var(--Text-700)]" />
                </div>
                <p className="_tf[12] font-500 leading-[1.33] text-[var(--Text-Main-10)]">
                  {item.bonusAmount}
                </p>
              </li>
              <li className="shrink-0 overflow-hidden flex flex-col gap-8px">
                <div className="_tf[12] leading-[1.33] text-[var(--Text-800)]">输赢金额</div>
                <p className={clsx('_tf[12] font-500 leading-[1.33]', item.netAmountClassName)}>
                  {item.netAmount}
                </p>
              </li>
            </ul>
          </div>
        ))}
      </div>
      <TipsModal show={showTipsModal} onClose={handleTipsModalClose} type={tipsModalType} />
    </div>
  );
};

export default AllBettingRecordPage;
