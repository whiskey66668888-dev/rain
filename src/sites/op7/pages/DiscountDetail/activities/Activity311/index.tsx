import React, { useState } from 'react';

import styles from './index.module.scss';
import type { DiscountActivityProps } from '../../activityRegistry';
import ActivityBanner from '../../components/ActivityBanner';
import ActivitySection from '../../components/ActivitySection';
import ActivityTable, { type HeaderCell } from '../../components/ActivityTable';
import ActivityTextCard from '../../components/ActivityTextCard';
import Button from '@/common/components/Button';
import LazyImage from '@/common/components/LazyImage';
import clsx from 'clsx';
import { activityTextSections, rules } from './content';
import RulesPopup from '../../components/RulesPopup';
type RewardDetailRow = {
  key: string;
  vipLevel: string;
  rebateLimit: number;
  action: string;
};

type RecordDetailRow = {
  key: string;
  timer: string;
  bonus: number;
  state: string;
};

const rewardDetailColumns: HeaderCell<RewardDetailRow>[] = [
  {
    title: 'VIP等级',
    key: 'vipLevel',
    color: 'var(--Text-800)',
    className: '',
  },
  {
    title: '返还上限',
    key: 'rebateLimit',
    color: 'var(--Text-Main-10)',
    render: (value) => value,
    className: '',
  },
  {
    title: '申请入口',
    key: 'action',
    render: (_, record) => <Button size="small">{record.action}</Button>,
  },
];

const rewardDetailData: RewardDetailRow[] = [
  { key: '0', vipLevel: 'VIP0', rebateLimit: 88, action: '立即申请' },
  { key: '1', vipLevel: 'VIP1', rebateLimit: 158, action: '立即申请' },
  { key: '2', vipLevel: 'VIP2', rebateLimit: 188, action: '立即申请' },
  { key: '3', vipLevel: 'VIP3', rebateLimit: 288, action: '立即申请' },
  { key: '4', vipLevel: 'VIP4', rebateLimit: 388, action: '立即申请' },
  { key: '5', vipLevel: 'VIP5', rebateLimit: 458, action: '立即申请' },
  { key: '6', vipLevel: 'VIP6', rebateLimit: 488, action: '立即申请' },
  { key: '7', vipLevel: 'VIP7', rebateLimit: 588, action: '立即申请' },
  { key: '8', vipLevel: 'VIP8', rebateLimit: 888, action: '立即申请' },
  { key: '9', vipLevel: 'VIP9', rebateLimit: 988, action: '立即申请' },
  { key: '10', vipLevel: 'VIP10', rebateLimit: 1288, action: '立即申请' },
];

const recordDetailColumns: HeaderCell<RecordDetailRow>[] = [
  {
    title: '时间',
    key: 'timer',
    color: 'var(--Text-800)',
    className: '',
  },
  {
    title: '红利',
    key: 'bonus',
    color: 'var(--Text-Main-10)',
    render: (value) => value,
    className: '',
  },
  {
    title: '状态',
    key: 'state',
  },
];

const Activity: React.FC<DiscountActivityProps> = ({ discountInfo }) => {
  const [showRules, setShowRules] = useState(false);

  return (
    <div className={styles.activityPage}>
      <ActivityBanner discountInfo={discountInfo} />

      {/* 嘉奖明细 */}
      <ActivitySection
        title={
          <div className={styles.sectionTitle}>
            <div>
              <LazyImage src={'/images/common/promotion/gift.png'} alt="" width={20} height={20} />
            </div>
            <div>嘉奖明细</div>
          </div>
        }
        titleClassName={styles.sectionTitleWrap}
      >
        <ActivityTable<RewardDetailRow>
          columns={rewardDetailColumns}
          dataSource={rewardDetailData}
        />
      </ActivitySection>

      {/* 申请记录 */}
      <ActivitySection
        title={
          <div className={styles.sectionTitle}>
            <div>
              <LazyImage
                src={'/images/common/promotion/record.png'}
                alt=""
                width={20}
                height={20}
              />
            </div>
            <div>申请记录</div>
          </div>
        }
        extra={
          <div
            className={clsx(styles.rules, 'flex items-center gap-2px cursor-pointer flex-shrink-0')}
            onClick={() => setShowRules(true)}
          >
            <div className="color-[var(--ThemeColor-Main)] font-[14px]">活动规则</div>
            <LazyImage
              src={'/images/common/promotion/direction.png'}
              alt=""
              width={20}
              height={20}
            />
          </div>
        }
      >
        <ActivityTable<RecordDetailRow> columns={recordDetailColumns} dataSource={[]} />
      </ActivitySection>

      <ActivityTextCard sections={activityTextSections} />

      <RulesPopup visible={showRules} onClose={() => setShowRules(false)} items={rules} />
    </div>
  );
};

export default Activity;
