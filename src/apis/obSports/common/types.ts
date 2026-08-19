import { SportIdForView } from '@/apis/commonSports/constants';

/** 本地玩法配置（列表盘口列） */
export interface LocalHandicapItem {
  name: string;
  /** OB 玩法 id（hpid） */
  idList: string[];
  row?: number;
}

/** 赛种配置 */
export interface CompetitionItem {
  label: string;
  id: number;
  viewId: SportIdForView;
  list: LocalHandicapItem[];
  simpleList: LocalHandicapItem[];
}

export interface OLRes {
  cds: string;
  oid: string;
  on: string;
  onb: string;
  os: number;
  ot: string;
  otd: number;
  ots: string;
  otv: string;
  ov: number;
}

export interface HLRes {
  hid: string;
  hmt: number;
  hon: string;
  hs: number;
  hn: number;
  hv: string;
  ol?: OLRes[];
}

export interface HPSItem {
  hids: number;
  hlid: string;
  hmm: number;
  chpid: string;
  hpid: string;
  hpn: string;
  hpnb: string;
  hpon: number;
  hpt: number;
  hshow: string;
  hsw: string;
  hton: string;
  mid: string;
  title: { osn: string; otd: number }[];
  hl: HLRes[];
  ol: OLRes[];
  hid: string;
  hps: string;
  hmed: string;
}

/** OB 赛事原始结构（getMatchBaseInfoByMidsPB / 列表接口） */
export interface MatchRecord {
  mcid: string;
  csna: string;
  csid: string;
  tid: string;
  tn: string;
  tlev: number;
  mhid: string;
  mid: string;
  mst: string;
  mcg: number;
  mmp: string;
  mms: number;
  mhlu: string[];
  malut: string;
  mgt: string;
  man: string;
  maid: string;
  mct: string;
  mhlut: string;
  mat: string;
  mo: number;
  mp: number;
  ms: number;
  mng: number;
  mle: number;
  mvs: number;
  malu: string[];
  mhn: string;
  mfo: string;
  mhs: number;
  mft: number;
  msc: string[];
  hps: HPSItem[];
  hpsBold?: HPSItem[];
  mlet: string;
  srid: number;
  cmec: string;
  seid: string;
  frman: string[];
  lurl: string;
  cds: string;
  frmhn: string[];
  mess: number;
  th: number;
  mc: number;
  mearlys: number;
  onTn?: string;
  hn?: number;
}

/** OB 菜单 initPB 原始节点 */
export interface OBMenuListResponse {
  count: number;
  /** 二级菜单为球种 ID */
  field1: string;
  field2: string;
  grade: number;
  menuId: number;
  menuName: string;
  /** 一级：玩法类型；二级：球种类等 */
  menuType: number;
  parentId: number;
  subList: OBMenuListResponse[];
  topMenuList: OBMenuListResponse[];
}

/** getFilterMatchListPB 联赛项 */
export interface OBFilterTournamentItem {
  id: string | number;
  nameText: string;
  picUrlthumb?: string;
  sportId: string | number;
  hotStatus?: number;
  num?: number;
  regionId?: string | number;
  tournamentLevel?: number;
  tournamentId?: string | number;
}

export interface OBFilterSportVO {
  id?: string | number;
  nameText?: string;
  tournamentList?: OBFilterTournamentItem[];
}

/** getFilterMatchListPB 地区/热门分组 */
export interface OBFilterMatchGroup {
  spell?: string;
  introduction?: string;
  sportVOs?: OBFilterSportVO[];
}
