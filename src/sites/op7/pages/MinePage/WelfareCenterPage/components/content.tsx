import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import { Calendar } from 'antd-mobile';
import dayjs from 'dayjs';
import SegmentedControl from '@/common/components/SegmentedControl';
import Overlay from '@/common/components/Overlay';
import ModalHeader from '@/sites/op7/components/ModalHeader';
import QuickTimeSelectSheet from '@/common/components/QuickTimeSelectSheet';
import styles from './content.module.scss';
import { HuobiIcon, ArrowRightIcon, ArrowBtmIcon } from './icons';
import type { WelfareCenterItem } from '@/apis/origin/welfareCenter';
import { DATE_RANGE_OPTIONS, type DateRangeKey } from '../index';
import Empty from '@common/components/Empty';
import { useNavigateWithLanguage } from '@common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';
import { appendPathSearch } from '@/utils/appendPathSearch';
import SkeletonCard from './SkeletonCard';

function renderCardBadgeText(bonusTagName: string | undefined | null) {
  const text = bonusTagName?.trim();
  console.log(text);
  if (!text) {
    return (
      <>
        存送
        <br />
        优惠
      </>
    );
  }
  if (text.length <= 2) {
    return text;
  }
  return (
    <>
      {text.slice(0, 2)}
      <br />
      {text.slice(2)}
    </>
  );
}

function getTips(item: WelfareCenterItem): string {
  switch (item.status) {
    case 0:
      return item.validTime ? `有效期: ${item.validTime}` : '';
    case -2:
      return item.validDate ? `过期时间: ${item.validDate}` : (item.statusName ?? '');
    case 9:
      return item.confirmTime ? `领取时间: ${item.confirmTime}` : (item.statusName ?? '');
    default:
      return item.statusName ?? '';
  }
}

export interface WelfareCenterContentProps {
  isMobile: boolean;
  status: string;
  showBannerDot: boolean;
  dateRangeKey: DateRangeKey;
  customRange: { start: string; end: string };
  onChangeDateRangeKey: (next: DateRangeKey) => void;
  onChangeCustomRange: (next: { start: string; end: string }) => void;
  list: WelfareCenterItem[];
  summary: { totalSize: number; totalCash: string };
  loading: boolean;
  submittingId: number | null;
  onReceive: (item: WelfareCenterItem) => void | Promise<void>;
}

export default function Content({
  isMobile,
  showBannerDot,
  dateRangeKey,
  customRange,
  onChangeDateRangeKey,
  onChangeCustomRange,
  list,
  summary,
  loading,
  submittingId,
  onReceive,
}: WelfareCenterContentProps) {
  const navigate = useNavigateWithLanguage();
  const [searchParams] = useSearchParams();
  const [showDateRangeOverlay, setShowDateRangeOverlay] = useState(false);
  const [showCustomOverlay, setShowCustomOverlay] = useState(false);

  type DateTuple = [Date, Date];
  const [tempRange, setTempRange] = useState<DateTuple>(() => {
    return [new Date(customRange.start), new Date(customRange.end)];
  });

  const stats = useMemo(() => {
    return {
      totalSize: summary.totalSize ?? 0,
      totalCash: summary.totalCash ?? '0.00',
    };
  }, [summary.totalCash, summary.totalSize]);

  const dateKeyLabel = useMemo(() => {
    return dateRangeKey;
    // if (dateRangeKey !== '自定义') return dateRangeKey;
    // return `${customRange.start} ~ ${customRange.end}`;
    // }, [customRange.end, customRange.start, dateRangeKey]);
  }, [dateRangeKey]);

  return (
    <div className={clsx(styles.wrap, isMobile && styles.wrapMobile)}>
      <div
        className={styles.banner}
        onClick={() => navigate(appendPathSearch(PATHS.mineRealtimeRebate, searchParams))}
      >
        <div className={styles.bannerMain}>
          <div className={styles.bannerIcon}>
            <HuobiIcon />
          </div>
          <div className={styles.bannerTitleWrap}>
            <div className={clsx(styles.bannerTitle, '_tf[14]')}>实时返水</div>
          </div>
        </div>
        <div className={styles.bannerStatus}>
          {showBannerDot && <div className={styles.bannerDot} />}
          <div className={styles.bannerArrow}>
            <ArrowRightIcon />
          </div>
        </div>
      </div>

      <div className={styles.stats}>
        {isMobile ? (
          <div
            className={styles.statsFilter}
            role="button"
            tabIndex={0}
            onClick={() => setShowDateRangeOverlay(true)}
            onKeyDown={(e) => e.key === 'Enter' && setShowDateRangeOverlay(true)}
          >
            <div className={clsx(styles.statsFilterText, '_tf[14]')}>{dateKeyLabel}</div>
            <div className={styles.statsFilterIcon}>
              <div
                className={clsx(
                  styles.statsFilterIconShape,
                  showDateRangeOverlay && styles.statsFilterIconOpen,
                )}
              >
                <ArrowBtmIcon />
              </div>
            </div>
          </div>
        ) : (
          <SegmentedControl
            className={styles.statsFilterTabs}
            height={32}
            tabButtonClassName="_tf[14]"
            options={DATE_RANGE_OPTIONS.map((label) => ({
              value: label,
              label,
            }))}
            value={dateRangeKey}
            onChange={(key) => {
              if (key === '自定义') {
                setTempRange([new Date(customRange.start), new Date(customRange.end)]);
                setShowCustomOverlay(true);
                return;
              }
              onChangeDateRangeKey(key);
            }}
          />
        )}
        <div className={styles.statsRight}>
          <div className={styles.statsGroup}>
            <div className={styles.statsItem}>
              <div className={clsx(styles.statsLabel, '_tf[14]')}>笔数</div>
              <div className={clsx(styles.statsValue, '_tf[14]')}>{stats.totalSize}</div>
            </div>
          </div>
          <div className={styles.statsGroup}>
            <div className={styles.statsItem}>
              <div className={clsx(styles.statsLabel, '_tf[14]')}>总金额</div>
              <div className={clsx(styles.statsValue, '_tf[14]')}>{stats.totalCash}</div>
            </div>
          </div>
        </div>
      </div>

      <QuickTimeSelectSheet
        show={showDateRangeOverlay}
        onClose={() => setShowDateRangeOverlay(false)}
        options={DATE_RANGE_OPTIONS}
        value={dateRangeKey}
        title="选择时间"
        onConfirmSelection={(key) => {
          onChangeDateRangeKey(key as DateRangeKey);
        }}
        onPickCustom={() => {
          setTempRange([new Date(customRange.start), new Date(customRange.end)]);
          setShowCustomOverlay(true);
        }}
      />

      <Overlay
        show={showCustomOverlay}
        close={() => setShowCustomOverlay(false)}
        position={isMobile ? 'bottom' : 'center'}
        className="[--global-overlay-body-max-height:95%]"
        bodyClassname={clsx(
          'flex flex-col gap-8px overflow-hidden bg-[var(--Background-300)]',
          isMobile ? 'rounded-t-10px safe-b' : 'rounded-12px w-300px',
        )}
        bodyStyle={{ width: isMobile ? '100%' : '400px' }}
      >
        <ModalHeader title="自定义时间" onClose={() => setShowCustomOverlay(false)} />
        <div className={clsx('px-12px pb-12px flex-1-col-hidden')}>
          <div className="text-[12px] text-[var(--Text-800)] mb-8px">* 仅支持最近90天</div>
          <div className={clsx('bg-[var(--Background-300)] rounded-12px p-8px')}>
            <Calendar
              className={clsx('antd-mobile-calendar-custom')}
              selectionMode="range"
              min={dayjs().subtract(89, 'day').toDate()}
              max={new Date()}
              value={tempRange}
              onChange={(val) => {
                if (!val || !val[0]) return;
                setTempRange([val[0], val[1] ?? val[0]]);
              }}
            />
          </div>
          <button
            type="button"
            className="shrink-0 mt-12px h-40px rounded-full bg-[var(--ThemeColor-Main)] text-[var(--White-100)] font-600"
            onClick={() => {
              const start = dayjs(tempRange[0]).format('YYYY-MM-DD');
              const end = dayjs(tempRange[1]).format('YYYY-MM-DD');
              onChangeCustomRange({ start, end });
              setShowCustomOverlay(false);
            }}
          >
            确定
          </button>
        </div>
      </Overlay>

      <div className={styles.cardList}>
        {loading && list.length === 0 ? (
          Array.from({ length: 6 }).map((_, idx) => <SkeletonCard key={idx} />)
        ) : list.length === 0 ? (
          <div className="flex flex-1 w-full items-center justify-center">
            <Empty />
          </div>
        ) : (
          list.map((item) => {
            const active = item.status === 0;
            const disabled = !active || (submittingId !== null && submittingId !== item.id);
            return (
              <div key={item.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardHeaderMain}>
                    <div
                      data-property-1={active ? 'on' : 'off'}
                      className={active ? styles.cardBadgeOn : styles.cardBadgeOff}
                    >
                      <div className={clsx(styles.cardBadgeText, '_tf[14]')}>
                        {renderCardBadgeText(item.bonusTagName)}
                      </div>
                    </div>
                    <div className={styles.cardTextGroup}>
                      <div className={clsx(styles.cardTitle, '_tf[14]')}>
                        活动名称: {item.bonusType || '--'}
                      </div>
                      <div className={styles.cardMeta}>
                        <div className={clsx(styles.cardMetaText, '_tf[12]')}>
                          适用场馆: {item.platformType || '全平台'}
                        </div>
                        <div>
                          <span className={clsx(styles.cardMetaFlowLabel, '_tf[12]')}>
                            取款流水:{' '}
                          </span>
                          <span className={clsx(styles.cardMetaFlowValue, '_tf[12]')}>
                            {item.multiple ?? 1}
                          </span>
                          <span className={clsx(styles.cardMetaFlowUnit, '_tf[12]')}>倍</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={clsx(styles.cardAmount, '_tf[20]')}>{item.cashStr ?? '0.00'}</div>
                </div>

                <div className={styles.cardDivider} />

                <div className={styles.cardFooter}>
                  <div className={clsx(styles.cardExpire, '_tf[12]')}>{getTips(item)}</div>
                  <button
                    type="button"
                    className={clsx(styles.cardBtn, disabled ? styles.cardBtnTextDisabled : '')}
                    disabled={disabled}
                    onClick={() => {
                      if (!active) return;
                      if (submittingId !== null) return;
                      onReceive(item);
                    }}
                  >
                    <div
                      className={clsx(
                        styles.cardBtnText,

                        '_tf[12]',
                      )}
                    >
                      {submittingId === item.id
                        ? '领取中...'
                        : active
                          ? '领取'
                          : item.statusName || '已领取'}
                    </div>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
