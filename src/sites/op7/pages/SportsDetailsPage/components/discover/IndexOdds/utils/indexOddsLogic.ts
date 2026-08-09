import type { MarketOddsEntryItem, MarketOddsInfo } from '@/apis/origin/discover/marketOddsTypes';

import { COMPANY_ORDER_BY_VENUE, INDEX_COMPANIES, type CompanyId } from '../constants';
import type { EntryCompanyRow, EntryOddRowType, OddCellData, OddsTabKey } from '../types';

export const companyIdToApiPlatform = (id: string): string => {
  switch (id) {
    case 'OP':
      return 'FB';
    case 'EB':
      return 'OB';
    case 'CME':
      return 'BTI';
    default:
      return id;
  }
};

export const venueToApiPlatform = (venue: string): string => {
  if (venue === 'ob') return 'OB';
  if (venue === 'bti') return 'BTI';
  return 'FB';
};

export const buildDisplayRowTypes = (
  isLive: boolean,
  initialSelected: boolean,
  preMatchSelected: boolean,
): EntryOddRowType[] => {
  if (!isLive) return ['initial', 'preMatch'];
  const rows: EntryOddRowType[] = [];
  if (initialSelected) rows.push('initial');
  if (preMatchSelected) rows.push('preMatch');
  rows.push('live');
  return rows;
};

export const getHeaderTitles = (sportId: number, tabKey: OddsTabKey): [string, string, string] => {
  if (sportId === 1) {
    switch (tabKey) {
      case 'standard':
        return ['主胜', '和局', '客胜'];
      case 'let':
        return ['主让', '盘口', '客让'];
      case 'total':
      case 'corner':
        return ['大', '盘口', '小'];
      default:
        return ['主胜', '和局', '客胜'];
    }
  }
  switch (tabKey) {
    case 'standard':
      return ['主胜', '返还', '客胜'];
    case 'let':
      return ['主让', '盘口', '客让'];
    case 'total':
      return ['大', '盘口', '小'];
    default:
      return ['主胜', '返还', '客胜'];
  }
};

const emptyCells = (): OddCellData[] => [
  { text: '-', change: 0, locked: false },
  { text: '-', change: 0, locked: false },
  { text: '-', change: 0, locked: false },
];

const cellsFromOdds = (
  odds: MarketOddsInfo | null | undefined,
  middleIsOdds: boolean,
): OddCellData[] => {
  if (!odds) return emptyCells();
  return [
    {
      text: odds.odds1.toFixed(2),
      change: odds.oddsChange1,
      locked: odds.odds1 < 0,
    },
    {
      text: odds.odds2.toFixed(2),
      change: odds.oddsChange2,
      locked: middleIsOdds && odds.odds2 < 0,
    },
    {
      text: odds.odds3.toFixed(2),
      change: odds.oddsChange3,
      locked: odds.odds3 < 0,
    },
  ];
};

const pickOdds = (
  item: MarketOddsEntryItem | undefined,
  type: EntryOddRowType,
): MarketOddsInfo | null => {
  if (!item) return null;
  if (type === 'initial') return item.initialOdds ?? null;
  if (type === 'preMatch') return item.preMatchOdds ?? null;
  return item.inPlayOdds ?? null;
};

export const buildVisibleCompanyRows = ({
  list,
  venue,
  selectedCompanyIds,
  sportId,
  tabKey,
}: {
  list: MarketOddsEntryItem[];
  venue: string;
  selectedCompanyIds: string[];
  sportId: number;
  tabKey: OddsTabKey;
}): EntryCompanyRow[] => {
  const order = COMPANY_ORDER_BY_VENUE[venue] ?? COMPANY_ORDER_BY_VENUE.fb!;
  const returnedPlatforms = new Set(list.map((item) => item.platform));
  const middleIsOdds = sportId === 1 && tabKey === 'standard';

  return order
    .map((id) => INDEX_COMPANIES.find((c) => c.id === id)!)
    .filter((company) => {
      return returnedPlatforms.has(company.apiPlatform) && selectedCompanyIds.includes(company.id);
    })
    .map((company) => {
      const item = list.find((row) => row.platform === company.apiPlatform);
      const cellsByType: Record<EntryOddRowType, OddCellData[]> = {
        initial: cellsFromOdds(pickOdds(item, 'initial'), middleIsOdds),
        preMatch: cellsFromOdds(pickOdds(item, 'preMatch'), middleIsOdds),
        live: cellsFromOdds(pickOdds(item, 'live'), middleIsOdds),
      };
      return {
        companyId: company.id,
        name: company.name,
        image: company.image,
        apiPlatform: company.apiPlatform,
        matchId: item?.matchId ?? '',
        cellsByType,
      };
    });
};

export const getOddRowLabel = (type: EntryOddRowType): string => {
  switch (type) {
    case 'initial':
      return '初始赔率';
    case 'preMatch':
      return '赛前赔率';
    case 'live':
      return '赛中赔率';
  }
};

/** 暂时只展示 OP体育 */
export const defaultSelectedCompanyIds = (): CompanyId[] => ['OP'];
