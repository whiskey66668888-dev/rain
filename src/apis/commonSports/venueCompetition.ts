import { EVenue } from '@/apis/commonSports/constants';
import { FBCompetitionMap } from '@/apis/fbSports/common/constants';
import type { CompetitionItem as FBCompetitionItem } from '@/apis/fbSports/common/types';
import { OBCompetitionMap } from '@/apis/obSports/common/constants';
import type { CompetitionItem as OBCompetitionItem } from '@/apis/obSports/common/types';

/** OddList / 简洁 tab 共用的盘口列（兼容 FB number id / OB string id） */
export type VenueHandicapItem = {
  name: string;
  idList: Array<string | number>;
  row?: number;
  period?: number;
};

export type VenueCompetitionItem = {
  label: string;
  id: number;
  list: VenueHandicapItem[];
  simpleList: VenueHandicapItem[];
};

function toVenueCompetition(item: FBCompetitionItem | OBCompetitionItem): VenueCompetitionItem {
  return {
    label: item.label,
    id: item.id,
    list: item.list,
    simpleList: item.simpleList,
  };
}

/** 按场馆取赛种盘口配置 */
export function getVenueCompetitionMap(venue: EVenue): VenueCompetitionItem[] {
  const map = venue === EVenue.OB ? OBCompetitionMap : FBCompetitionMap;
  return Object.values(map).map(toVenueCompetition);
}

export function findVenueCompetition(
  venue: EVenue,
  sportId?: number,
): VenueCompetitionItem | undefined {
  if (sportId == null) return undefined;
  return getVenueCompetitionMap(venue).find((item) => item.id === sportId);
}
