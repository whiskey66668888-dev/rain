'use client';

import styles from './index.module.scss';
import { useEffect, useMemo, useRef, useState } from 'react';
import LazyImage from '@/common/components/LazyImage';
import { useVipRule, VipInfo, VipLevelInfo } from '@/apis/origin/vip/getVipinfo';
import clsx from 'clsx';
import { useAppSelector } from '@/core/store/hooks';
import { getSystemTheme } from '@/utils';
import ModalCloseButton from '@/sites/op7/components/themeIcon/ModalCloseButton';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';
import { getRebate } from '@/apis/origin/rebate';

// ✅ 定义表头类型
interface VipTableHeader {
  level: string;
  sportsRebates: string;
  footballRebates: string;
  videoRebates: string;
  esportRebates: string;
  pokerRebates: string;
  slotRebates: string;
}

interface WithdrawTableHeader {
  level: string;
  outNumsMax: string;
  outMoneyMax: string;
}

// ✅ 定义联合类型
type VipTableRow = VipTableHeader | VipLevelInfo;
type WithdrawTableRow = WithdrawTableHeader | VipLevelInfo;

const withdrawData: WithdrawTableHeader[] = [
  {
    level: '等级',
    outNumsMax: '日提款次数',
    outMoneyMax: '每日提款款额',
  },
];

interface VipDetailProps {
  vipInfo: VipInfo;
  handleClose: () => void;
}

const VipDetail = ({ vipInfo, handleClose }: VipDetailProps) => {
  const { data: vipRuleData = [] } = useVipRule();

  const navigate = useNavigateWithLanguage();
  const rule = useMemo(() => {
    return [...vipRuleData].sort((a, b) => a.sort - b.sort);
  }, [vipRuleData]);

  const [vipInfoData, setVipInfoData] = useState<VipTableRow[]>([]);
  const [tikuanData, setTikuanData] = useState<WithdrawTableRow[]>([]);
  const [hasFootballRate, setFootballRate] = useState(false);
  const [hasDateFlag, setHasDateFlag] = useState(false);
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const theme = themeMode === 'system' ? getSystemTheme() : themeMode;
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };
  const getHasDate = async () => {
    try {
      const data = await getRebate();
      const reate = data?.data ?? 0;
      if (Number(reate) > 0) {
        setHasDateFlag(true);
      } else {
        setHasDateFlag(false);
      }
    } catch (_error) {
      setHasDateFlag(false);
    }
  };
  useEffect(() => {
    const showFootball = vipInfo?.levelList?.some((item) => Number(item?.footballRebates) > 0);
    setFootballRate(showFootball);

    const headerData: VipTableHeader[] = [
      {
        level: '等级',
        sportsRebates: '体育',
        footballRebates: '足球',
        videoRebates: '真人',
        esportRebates: '电竞',
        pokerRebates: '棋牌',
        slotRebates: '电子',
      },
    ];

    setVipInfoData([...headerData, ...(vipInfo?.levelList || [])]);
    setTikuanData([...withdrawData, ...(vipInfo?.levelList || [])]);
  }, [vipInfo]);
  useEffect(() => {
    getHasDate();
  }, []);
  const renderTitle = (title: string) => {
    return (
      <div className={styles.title}>
        <LazyImage
          src={'/images/common/vip/vip_title_line.png'}
          alt={'icon'}
          width={2}
          height={16}
        />
        <div className={styles.text}>{title}</div>
      </div>
    );
  };

  // ✅ 类型守卫函数
  const isHeaderRow = (row: VipTableRow): row is VipTableHeader => {
    return typeof row.level === 'string' && row.level === '等级';
  };

  const isWithdrawHeaderRow = (row: WithdrawTableRow): row is WithdrawTableHeader => {
    return typeof row.level === 'string' && row.level === '等级';
  };

  // ✅ 生成稳定的 key
  const getVipTableKey = (item: VipTableRow): string => {
    if (isHeaderRow(item)) {
      return 'vip-table-header';
    }
    // 使用 level 作为唯一标识（VIP0-VIP10）
    return `vip-level-${item.level}`;
  };

  const getWithdrawTableKey = (item: WithdrawTableRow): string => {
    if (isWithdrawHeaderRow(item)) {
      return 'withdraw-table-header';
    }
    return `withdraw-level-${item.level}`;
  };

  // ✅ 生成规则的 key（假设 rule 有 id 或唯一字段）
  const getRuleKey = (item: (typeof rule)[0]): string => {
    // 方案1: 如果有 id 字段
    if ('id' in item && item.id) {
      return `rule-${item.id}`;
    }
    // 方案2: 使用 sort + title 组合（确保唯一性）
    return `rule-${item.sort}-${item.title}`;
  };

  return (
    <div className={styles.vipDetail}>
      <header className={`${styles.detailHeader} _tf[16] font-500 text-[var(--Text-Main-10)]`}>
        VIP详情
        <ModalCloseButton className={styles.closeButton} onClick={handleClose} />
      </header>

      <div className={styles.scrollBody} ref={containerRef}>
        <div className={styles.userContent}>
          {/* VIP返水比例 */}
          <div className={clsx(styles.quotaBox)}>
            <div className={styles.quotaBoxTop1}>
              {renderTitle('VIP返水比例')}
              <div
                className={styles.quotaBoxTop1Right}
                onClick={() => {
                  navigate(PATHS.mineRealtimeRebate);
                }}
              >
                <p>实时返水</p>
                {hasDateFlag ? <div className={styles.hasDateView}></div> : null}
                <img src={'/images/common/vip/single_arrow.png'} alt="" />
              </div>
            </div>
            <div className={styles.vipProportion}>
              {vipInfoData.map((item) => {
                const isHeader = isHeaderRow(item);
                // ✅
                const key = getVipTableKey(item);

                return (
                  <div
                    key={key}
                    className={clsx(styles.list_item, !hasFootballRate ? styles.noFooterBall : '')}
                  >
                    <div>VIP{item.level}</div>
                    <div>
                      {item.sportsRebates}
                      {isHeader ? '' : '%'}
                    </div>
                    {hasFootballRate && (
                      <div>
                        {item.footballRebates}
                        {isHeader ? '' : '%'}
                      </div>
                    )}
                    <div>
                      {item.videoRebates}
                      {isHeader ? '' : '%'}
                    </div>
                    <div>
                      {item.esportRebates}
                      {isHeader ? '' : '%'}
                    </div>
                    <div>
                      {item.pokerRebates}
                      {isHeader ? '' : '%'}
                    </div>
                    <div>
                      {item.slotRebates}
                      {isHeader ? '' : '%'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* VIP提款额度 */}
          <div className={clsx(styles.quotaBox, styles.quotaBo2)}>
            {renderTitle('VIP提款额度')}
            <div className={clsx(styles.vipProportion, styles.withdrawVip)}>
              {tikuanData.map((item) => {
                // ✅
                const key = getWithdrawTableKey(item);

                return (
                  <div key={key} className={styles.list_item}>
                    <div>VIP{item.level}</div>
                    <div>{item.outNumsMax}</div>
                    <div>{item.outMoneyMax}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 活动规则 */}
          <div className={clsx(styles.quotaBox, styles.quotaBo2)}>
            {renderTitle('活动的一般条款与规则')}
            <div className={styles.quoContetn}>
              {rule.map((item) => {
                const key = getRuleKey(item);

                return (
                  <div key={key} className={styles.queItem}>
                    <div className={styles.itemTitle}>
                      <span>{item.sort}</span>
                      {item.title}
                    </div>
                    <div className={styles.itemContentBox}>
                      <div className={styles.itemContent}>{item.content}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 回到顶部 */}
        <div className={styles.goTopVip}>
          <div className={styles.goTopIconBox}>
            <LazyImage
              className={styles.goTopIcon}
              src={`/images/common/vip/go_top${theme === 'dark' ? '_dark' : ''}.png`}
              alt={'icon'}
            />
          </div>
          <div className={styles.goTopText} onClick={scrollToTop}>
            回到顶部
          </div>
        </div>
      </div>
    </div>
  );
};

export default VipDetail;
