import clsx from 'clsx';
import styles from './content.module.scss';
import List from './list';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Overlay from '@/common/components/Overlay';
import { useAppSelector } from '@core/store/hooks';
import { ArrowRightIcon } from '@/sites/op7/pages/MinePage/RealtimeRebatePage/components/icons';
import type { RebateTop10Item } from '@/apis/origin/rebate';
import { useNavigateWithLanguage } from '@common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';
import { appendPathSearch } from '@/utils/appendPathSearch';
import H5Header from '@/sites/op7/components/H5Header';
import Button from '@/common/components/Button';

interface ContentProps {
  rebateAmount: string;
  btnText: string;
  onReceive: () => void;
  rows: RebateTop10Item[];
  loading?: boolean;
}

export default function Content({
  rebateAmount,
  btnText,
  onReceive,
  rows,
  loading = false,
}: ContentProps) {
  const navigate = useNavigateWithLanguage();
  const [searchParams] = useSearchParams();
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = screenBreakpoint === 'md';
  // 返水规则
  const [ruleVisible, setRuleVisible] = useState(false);

  return (
    <div className={styles.wrap}>
      <div className={styles.hero}>
        <H5Header title="实时返水" style={{ background: 'transparent' }} />
        <div className={styles.rightActions}>
          <div className={styles.actionPill}>
            <div
              className={styles.actionRow}
              onClick={() => {
                navigate(appendPathSearch(PATHS.vipCenter, searchParams));
              }}
            >
              <div className={clsx(styles.actionText, '_tf[12]')}>VIP详情</div>
              <ArrowRightIcon />
            </div>
          </div>
          <div className={styles.actionPill}>
            <div className={styles.actionRow} onClick={() => setRuleVisible(true)}>
              <div className={clsx(styles.actionText, '_tf[12]')}>返水规则</div>
              <ArrowRightIcon />
            </div>
          </div>
        </div>

        <div className={styles.centerArea}>
          <div className={styles.ring}>
            <div className={styles.ringText}>
              <div className={clsx(styles.title, '_tf[14]')}>可结算返水</div>
              <div className={clsx(styles.amount, '_tf[34]')}>{rebateAmount}</div>
              <div className={clsx(styles.subTitle, '_tf[12]')}>VIP等级越高返水比例越高</div>
            </div>
          </div>
        </div>
      </div>

      <Button
        type="primary"
        className={clsx(styles.cta, isMobile && styles.ctaMobile)}
        onClick={onReceive}
      >
        <div className={clsx(styles.ctaText, '_tf[16]')}>{btnText}</div>
      </Button>

      <div className={clsx('flex flex-col min-h-0 pb-5', rows.length === 0 && 'flex-1')}>
        <List rows={rows} loading={loading} mx />
      </div>

      <Overlay show={ruleVisible} close={() => setRuleVisible(false)} position="center">
        <div className={clsx(styles.ruleModal, !isMobile && styles.ruleModalPc)}>
          <div className={styles.ruleHeader}>
            <div className={clsx(styles.ruleTitle, '_tf[16]')}>返水规则</div>
            {/* <button
              type="button"
              className={styles.ruleClose}
              onClick={() => setRuleVisible(false)}
              aria-label="关闭"
            >
              <CloseIcon />
            </button> */}
          </div>

          <div className={styles.ruleBody}>
            <p className={clsx(styles.ruleLine, '_tf[14]')}>
              1.实时返水支持全场馆，不返水游戏无实时返水;
            </p>
            <p className={clsx(styles.ruleLine, '_tf[14]')}>
              2.因注单数据更新，实时返水金额可能会有延迟(约<span>10</span>分钟);
            </p>
            <p className={clsx(styles.ruleLine, '_tf[14]')}>
              3.场馆维护期间，该场馆游戏产生的实时返水需要等场馆维护结束才能结算;
            </p>
            <p className={clsx(styles.ruleLine, '_tf[14]')}>
              4.实时返水每次领取时间间隔为<span>10</span>分钟，每日最多可领取<span>20</span>次;
            </p>
            <p className={clsx(styles.ruleLine, '_tf[14]')}>
              5.实时返水业绩暂时间计算，当天流水如在次日12:00前未领取，系统将在次日14:00统一派发到福利中心;
            </p>
            <p className={clsx(styles.ruleLine, '_tf[14]')}>
              6.实时返水=（有效优惠投注-返水本金额）*返水百分比;
            </p>
          </div>

          <button
            type="button"
            className={styles.ruleConfirm}
            onClick={() => setRuleVisible(false)}
          >
            <span className="_tf[16]">我知道了</span>
          </button>
        </div>
      </Overlay>
    </div>
  );
}
