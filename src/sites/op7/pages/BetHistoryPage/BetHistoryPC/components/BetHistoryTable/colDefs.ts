export enum EColTitle {
  /** 编号 */
  NO = 'NO',
  /** 注单信息（预约单） -- 单号、下单时间 */
  ORDER_INFO = 'ORDER_INFO',
  /** 投注类型 -- 单/串关、欧洲盘 */
  BET_TYPE = 'BET_TYPE',
  /** 比赛 -- 赛种、联赛名称、主客队、开赛时间 */
  MATCH = 'MATCH',
  /** 选项 -- 投注项信息（玩法【下注时比分】、投注项、赔率） */
  BET_ITEM = 'BET_ITEM',
  /** 赛果 -- 已结算才展示，per-leg */
  RESULT = 'RESULT',
  /** 投注额（预约本金） */
  BET_AMOUNT = 'BET_AMOUNT',
  /** 最高可赢（未结算/预约） */
  MAX_WIN = 'MAX_WIN',
  /** 输/赢（已结算才显示） */
  AMOUNT = 'AMOUNT',
  /** 状态 */
  STATUS_UNSETTLED = 'STATUS_UNSETTLED',
  STATUS_SETTLED = 'STATUS_SETTLED',
  STATUS_RESERVE = 'STATUS_RESERVE',
}

export type ColDef = {
  value: EColTitle;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
};

export const colMap: Record<EColTitle, ColDef> = {
  [EColTitle.NO]: { value: EColTitle.NO, label: '编号', width: '30px', align: 'center' },
  [EColTitle.ORDER_INFO]: { value: EColTitle.ORDER_INFO, label: '注单信息', width: '140px' },
  [EColTitle.BET_TYPE]: { value: EColTitle.BET_TYPE, label: '投注类型', width: '74px' },
  [EColTitle.MATCH]: { value: EColTitle.MATCH, label: '比赛', width: '150px' },
  [EColTitle.BET_ITEM]: { value: EColTitle.BET_ITEM, label: '选项', width: '100px' },
  [EColTitle.RESULT]: { value: EColTitle.RESULT, label: '赛果', width: '70px' },
  [EColTitle.BET_AMOUNT]: { value: EColTitle.BET_AMOUNT, label: '投注额', width: '70px' },
  [EColTitle.MAX_WIN]: { value: EColTitle.MAX_WIN, label: '可返还', width: '70px' },
  [EColTitle.AMOUNT]: { value: EColTitle.AMOUNT, label: '输/赢', width: '70px' },
  [EColTitle.STATUS_UNSETTLED]: {
    value: EColTitle.STATUS_UNSETTLED,
    label: '状态',
    width: '156px',
  },
  [EColTitle.STATUS_SETTLED]: { value: EColTitle.STATUS_SETTLED, label: '状态', width: '60px' },
  [EColTitle.STATUS_RESERVE]: { value: EColTitle.STATUS_RESERVE, label: '状态', width: '150px' },
};

const pickCols = (keys: EColTitle[]): ColDef[] => keys.map((k) => colMap[k]);

export const COLS_UNSETTLED = pickCols([
  EColTitle.NO,
  EColTitle.ORDER_INFO,
  EColTitle.BET_TYPE,
  EColTitle.MATCH,
  EColTitle.BET_ITEM,
  EColTitle.BET_AMOUNT,
  EColTitle.MAX_WIN,
  EColTitle.STATUS_UNSETTLED,
]);

export const COLS_SETTLED = pickCols([
  EColTitle.NO,
  EColTitle.ORDER_INFO,
  EColTitle.BET_TYPE,
  EColTitle.MATCH,
  EColTitle.BET_ITEM,
  EColTitle.RESULT,
  EColTitle.BET_AMOUNT,
  EColTitle.AMOUNT,
  EColTitle.STATUS_SETTLED,
]);

export const COLS_RESERVE: ColDef[] = pickCols([
  EColTitle.NO,
  EColTitle.ORDER_INFO,
  EColTitle.BET_TYPE,
  EColTitle.MATCH,
  EColTitle.BET_ITEM,
  EColTitle.BET_AMOUNT,
  EColTitle.MAX_WIN,
  EColTitle.STATUS_RESERVE,
]).map((col) => {
  if (col.value === EColTitle.ORDER_INFO) return { ...col, label: '预约单' };
  if (col.value === EColTitle.BET_AMOUNT) return { ...col, label: '预约本金' };
  return col;
});

export const PER_LEG_COL_SET = new Set([EColTitle.MATCH, EColTitle.BET_ITEM, EColTitle.RESULT]);
