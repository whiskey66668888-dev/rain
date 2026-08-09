import React from 'react';
import clsx from 'clsx';

import Empty from '@/common/components/Empty';

import type { EntryOddRowType, OddCellData } from '../types';
import { getOddRowLabel } from '../utils/indexOddsLogic';
import styles from '../index.module.scss';

const LOCK_ICON = '/images/common/sportsDetails/indexOdds/index-lock.png.webp';
const ARROW_UP = '/images/common/sportsDetails/indexOdds/ic_red_arrow_up.png.webp';
const ARROW_DOWN = '/images/common/sportsDetails/indexOdds/ic_green_arrow_down.png.webp';
const INDEX_ARROW = '/images/common/sportsDetails/indexOdds/index_arrow.png.webp';
const SETTING_ICON = '/images/common/sportsDetails/indexOdds/blue_setting.png.webp';

export const OddCell: React.FC<{ cell: OddCellData }> = ({ cell }) => {
  if (cell.locked) {
    return (
      <span className={styles.oddCell}>
        <img src={LOCK_ICON} alt="" className={styles.lockIcon} />
      </span>
    );
  }

  const changeClass =
    cell.change === 2 ? styles.valueRed : cell.change === 3 ? styles.valueGreen : styles.valueMain;
  const arrow = cell.change === 2 ? ARROW_UP : cell.change === 3 ? ARROW_DOWN : null;

  return (
    <span className={clsx(styles.oddCell, changeClass)}>
      <span>{cell.text}</span>
      {arrow ? <img src={arrow} alt="" className={styles.changeArrow} /> : null}
    </span>
  );
};

export const OddsLegend: React.FC<{ rowTypes: EntryOddRowType[] }> = ({ rowTypes }) => (
  <div className={styles.legend}>
    {rowTypes.map((type) => (
      <div key={type} className={styles.legendItem}>
        <span className={clsx(styles.legendDot, styles[`legend_${type}`])} />
        <span>{getOddRowLabel(type)}</span>
      </div>
    ))}
  </div>
);

interface EntryListProps {
  headerTitles: [string, string, string];
  rowTypes: EntryOddRowType[];
  companies: Array<{
    companyId: string;
    name: string;
    image: string;
    cellsByType: Record<EntryOddRowType, OddCellData[]>;
  }>;
  onOpenSettings: () => void;
  onOpenHistory: (companyId: string) => void;
}

export const IndexOddsEntryList: React.FC<EntryListProps> = ({
  headerTitles,
  rowTypes,
  companies,
  onOpenSettings,
  onOpenHistory,
}) => {
  if (!companies.length) {
    return <Empty type="data" variant="card" className="min-h-180px py-24px" />;
  }

  return (
    <div className={styles.entryCard}>
      <div className={styles.entryHeader}>
        <div className={styles.companyCol} />
        {/* 与数据行 rowLine(2px) 对齐 */}
        <div className={styles.headerLineSpacer} />
        {headerTitles.map((title) => (
          <div key={title} className={styles.entryHeaderCell}>
            {title}
          </div>
        ))}
        {/* 与数据行 enterBtn(28px) 对齐 */}
        <button type="button" className={styles.settingBtn} onClick={onOpenSettings}>
          <img src={SETTING_ICON} alt="" />
        </button>
      </div>

      {companies.map((company) => (
        <div key={company.companyId} className={styles.companyGroup}>
          <div className={styles.companyCol}>
            <div
              className={styles.companyBadge}
              style={{ backgroundImage: `url(${company.image})` }}
            >
              <span>{company.name}</span>
            </div>
          </div>

          <div className={styles.companyOdds}>
            {rowTypes.map((type) => (
              <button
                key={type}
                type="button"
                className={styles.oddsRow}
                onClick={() => onOpenHistory(company.companyId)}
              >
                <span className={clsx(styles.rowLine, styles[`legend_${type}`])} />
                {(company.cellsByType[type] ?? []).map((cell, idx) => (
                  <OddCell key={`${type}-${idx}`} cell={cell} />
                ))}
              </button>
            ))}
          </div>

          <button
            type="button"
            className={styles.enterBtn}
            onClick={() => onOpenHistory(company.companyId)}
          >
            <img src={INDEX_ARROW} alt="" />
          </button>
        </div>
      ))}

      <OddsLegend rowTypes={rowTypes} />
    </div>
  );
};
