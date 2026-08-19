import type { OddsTab } from './types';

/** playType 对齐 App：1胜平负 2让球 3大小球 4角球 */
export const FOOTBALL_TABS: OddsTab[] = [
  { label: '胜平负', playType: 1, key: 'standard' },
  { label: '让球', playType: 2, key: 'let' },
  { label: '大小球', playType: 3, key: 'total' },
  { label: '角球', playType: 4, key: 'corner' },
];

export const BASKETBALL_TABS: OddsTab[] = [
  { label: '胜负', playType: 1, key: 'standard' },
  { label: '让分', playType: 2, key: 'let' },
  { label: '总分', playType: 3, key: 'total' },
];

export type CompanyId = 'OP' | 'EB';

export const INDEX_COMPANIES: Array<{
  id: CompanyId;
  name: string;
  image: string;
  apiPlatform: 'FB' | 'OB';
}> = [
  {
    id: 'OP',
    name: 'OP体育',
    image: '/images/common/sportsDetails/indexOdds/op_sports.png.webp',
    apiPlatform: 'FB',
  },
  {
    id: 'EB',
    name: 'EB体育',
    image: '/images/common/sportsDetails/indexOdds/eb_sports.png.webp',
    apiPlatform: 'OB',
  },
];

/** 场馆展示顺序（已过滤 CME/EMC） */
export const COMPANY_ORDER_BY_VENUE: Record<string, CompanyId[]> = {
  fb: ['OP', 'EB'],
  ob: ['EB', 'OP'],
};
