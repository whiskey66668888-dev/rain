import img0 from '@/sites/op7/images/common/discover/lineup/0.png';
import img1 from '@/sites/op7/images/common/discover/lineup/1.png';
import img2 from '@/sites/op7/images/common/discover/lineup/2.png';
import img3 from '@/sites/op7/images/common/discover/lineup/3.png';
import img4 from '@/sites/op7/images/common/discover/lineup/4.png';
import img5 from '@/sites/op7/images/common/discover/lineup/5.png';
import img8 from '@/sites/op7/images/common/discover/lineup/8.png';
import img9 from '@/sites/op7/images/common/discover/lineup/9.png';
import img10 from '@/sites/op7/images/common/discover/lineup/10.png';
import img15 from '@/sites/op7/images/common/discover/lineup/15.png';
import img16 from '@/sites/op7/images/common/discover/lineup/16.png';
import img17 from '@/sites/op7/images/common/discover/lineup/17.png';
import img18 from '@/sites/op7/images/common/discover/lineup/18.png';
import img21 from '@/sites/op7/images/common/discover/lineup/21.png';
import img22 from '@/sites/op7/images/common/discover/lineup/22.png';
import img28 from '@/sites/op7/images/common/discover/lineup/28.png';
import img69 from '@/sites/op7/images/common/discover/lineup/69.png';
import img1000 from '@/sites/op7/images/common/discover/lineup/1000.png';
import img1001 from '@/sites/op7/images/common/discover/lineup/1001.png';

import type { SituationTab } from './types';

export const situationTabs: Array<{ key: SituationTab; label: string }> = [
  { key: 'live', label: '文字直播' },
  { key: 'events', label: '重要事件' },
  { key: 'team', label: '球队统计' },
  { key: 'player', label: '球员统计' },
];

export const stateNames = new Set(['进攻', '危险进攻', '控球率', '射门', '射正']);

export const match_evn_img_map: Record<number, string> = {
  0: img0,
  1: img1,
  2: img2,
  3: img3,
  4: img4,
  5: img5,
  8: img8,
  9: img9,
  10: img10,
  11: img10,
  12: img10,
  15: img15,
  16: img16,
  17: img17,
  18: img18,
  21: img21,
  22: img22,
  26: img0,
  27: img0,
  28: img28,
  29: img8,
  30: img16,
  69: img69,
  1000: img1000,
  1001: img1001,
};
