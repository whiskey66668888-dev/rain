import type { PlayerOption } from './types';

import ageIcon from '@/sites/op7/images/common/discover/lineup/age.png';
import ageActiveIcon from '@/sites/op7/images/common/discover/lineup/age_active.png';
import countryIcon from '@/sites/op7/images/common/discover/lineup/country.png';
import countryActiveIcon from '@/sites/op7/images/common/discover/lineup/country_active.png';
import heightIcon from '@/sites/op7/images/common/discover/lineup/height.png';
import heightActiveIcon from '@/sites/op7/images/common/discover/lineup/height_active.png';
import performanceIcon from '@/sites/op7/images/common/discover/lineup/comport.png';
import performanceActiveIcon from '@/sites/op7/images/common/discover/lineup/comport_active.png';
import worthIcon from '@/sites/op7/images/common/discover/lineup/worth.png';
import worthActiveIcon from '@/sites/op7/images/common/discover/lineup/worth_active.png';

export const optionTabs: Array<{
  key: PlayerOption;
  label: string;
  icon: string;
  activeIcon: string;
}> = [
  { key: 'rating', label: '表现', icon: performanceIcon, activeIcon: performanceActiveIcon },
  { key: 'national_logo', label: '国籍/俱乐部', icon: countryIcon, activeIcon: countryActiveIcon },
  { key: 'age', label: '年龄', icon: ageIcon, activeIcon: ageActiveIcon },
  { key: 'market_value', label: '身价', icon: worthIcon, activeIcon: worthActiveIcon },
  { key: 'height', label: '身高', icon: heightIcon, activeIcon: heightActiveIcon },
];
