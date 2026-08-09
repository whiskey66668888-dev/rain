import clsx from 'clsx';
import { useSearchParams } from 'react-router-dom';
import { Popover } from 'antd-mobile';
import styles from './list.module.scss';
import { ArrowRightIcon, HbIcon, TipIcon } from './icons';
import { useNavigateWithLanguage } from '@common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';
import { appendPathSearch } from '@/utils/appendPathSearch';
import type { RebateTop10Item } from '@/apis/origin/rebate';
import Empty from '@common/components/Empty';
import SkeletonCard from './SkeletonCard';

interface ListProps {
  hideTitle?: boolean;
  radius?: boolean;
  rows?: RebateTop10Item[];
  loading?: boolean;
  mx?: boolean;
  grow?: boolean;
}

export default function List({
  hideTitle,
  radius,
  rows = [],
  loading = false,
  mx = false,
  grow = false,
}: ListProps) {
  const navigate = useNavigateWithLanguage();
  const [searchParams] = useSearchParams();

  return (
    <div
      className={clsx(styles.wrap, radius && styles.radius, mx && styles.mx, grow && styles.grow)}
      style={{
        background: grow && rows.length === 0 ? 'transparent' : 'var(--Background-300)',
      }}
    >
      {!hideTitle && (
        <div className={styles.header}>
          <div className={styles.headerRow}>
            <div className={clsx(styles.title, '_tf[14]')}>返水记录</div>
            <div className={clsx(styles.more, styles.isClickable)}>
              <div
                className={clsx(styles.moreText, '_tf[12]')}
                onClick={() =>
                  navigate(appendPathSearch(PATHS.mineRealtimeRebateRecord, searchParams))
                }
              >
                查看更多
              </div>
              <div className={styles.moreIcon}>
                <ArrowRightIcon color="var(--ThemeColor-Main)" />
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && rows.length === 0 ? (
        Array.from({ length: 6 }).map((_, idx) => <SkeletonCard key={idx} />)
      ) : rows.length === 0 ? (
        <div className="flex flex-1 w-full items-center justify-center">
          <Empty imgWrapClassName={!hideTitle ? 'bg-[var(--Background-500)] b' : ''} />
        </div>
      ) : (
        rows.map((row, idx) => (
          <div
            key={row.id ?? idx}
            data-已领取={row.statusName === '已领取' ? 'on' : 'off'}
            className={styles.row}
          >
            <div className={styles.leftIconWrap}>
              <div className={styles.leftIcon}>
                <HbIcon />
              </div>
            </div>

            <div className={styles.rowMain}>
              <div className={styles.leftText}>
                <div className={styles.nameRow}>
                  <div className={clsx(styles.name, '_tf[14]')}>{row.bonusName ?? '实时返水'}</div>
                </div>
                <div className={clsx(styles.time, '_tf[12]')}>{row.addTime ?? '--'}</div>
              </div>

              <div className={styles.rightText}>
                <div className={clsx(styles.amount, '_tf[14]')}>{row.cash ?? '0.00'}</div>
                {row.statusName === '未领取' ? (
                  <Popover
                    content="当日返水未领取，自动转入福利中心合并领取。"
                    placement="top-start"
                    trigger="click"
                  >
                    <div
                      className={clsx(
                        styles.status,
                        '_tf[12]',
                        row.statusName === '未领取' && styles.noReceive,
                      )}
                    >
                      {row.statusName ?? '--'}
                      <TipIcon />
                    </div>
                  </Popover>
                ) : (
                  <div className={clsx(styles.status, '_tf[12]')}>{row.statusName ?? '--'}</div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
