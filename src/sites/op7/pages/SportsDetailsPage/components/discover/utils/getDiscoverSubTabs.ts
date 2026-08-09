import { FBSportIdValue } from '@/apis/fbSports/common/constants';

/** 发现子 tab 默认顺序，与 App DiscoverContent._subTabs 一致 */
export const DISCOVER_SUB_TAB_ORDER = [
  '聊天',
  '直播',
  '赛况',
  '阵容',
  '指数',
  '分析',
  '角球',
  '进球',
  '情报',
  '历史',
] as const;

export type DiscoverSubTabTitle = (typeof DISCOVER_SUB_TAB_ORDER)[number];

interface GetDiscoverSubTabsOptions {
  enabledSubTabTitles: string[] | null;
  sportId?: number;
  resultMatchId?: string | null;
}

/**
 * 计算发现页展示的子 tab 列表
 * 对齐 App DiscoverContent._computeDisplayTabs
 */
export const getDiscoverSubTabs = ({
  enabledSubTabTitles,
  sportId,
  resultMatchId,
}: GetDiscoverSubTabsOptions): string[] => {
  const isBasketball = sportId === Number(FBSportIdValue.Basketball);

  if (enabledSubTabTitles === null) {
    return ['聊天'];
  }

  const enabledTitles = new Set(enabledSubTabTitles);

  if (isBasketball && resultMatchId) {
    enabledTitles.add('分析');
    enabledTitles.add('直播');
  }

  if (enabledTitles.size === 0) {
    return ['聊天'];
  }

  let tabs = DISCOVER_SUB_TAB_ORDER.filter(
    (title) => title === '聊天' || enabledTitles.has(title),
  ).filter((title) => !isBasketball || (title !== '赛况' && title !== '历史'));

  if (isBasketball) {
    tabs = tabs.map((title) => (title === '直播' ? '赛况' : title));
  }

  return tabs;
};

/** 默认选中第一个非「聊天」的子 tab */
export const getDefaultDiscoverSubTabIndex = (tabs: string[]): number => {
  const firstNonChat = tabs.findIndex((title) => title !== '聊天');
  return firstNonChat >= 0 ? firstNonChat : 0;
};
