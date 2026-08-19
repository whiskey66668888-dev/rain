/**
 * OB 投注相关常量，字段口径对齐 Flutter `pages/homeSport/bet/services.ob.dart`
 */

/**
 * 设备类型 1：H5，2：PC，3：Android，4：IOS，5：其他设备
 * Web 端没有原生设备号，先固定按 H5 上报（后续接入指纹时再按端区分）
 */
export const OB_DEVICE_TYPE = 1;

/**
 * 设备号，当设备类型 = 1/3/4 时必传。
 * 暂时写死一个固定值，等接入设备指纹后替换。
 */
export const OB_DEVICE_IMEI = 'f3edf9731f857687';

/**
 * 赛事类型标识，传错会直接导致投注失败。
 * 取值逻辑（对齐 Flutter obMatchType）：早盘/滚球看赛事是否滚球，冠军=3，虚拟=4，电竞=5
 */
export enum EObMatchType {
  /** 早盘赛事 */
  Early = 1,
  /** 滚球盘赛事 */
  Live = 2,
  /** 冠军盘赛事 */
  Champion = 3,
  /** 虚拟(VR)赛事 */
  Virtual = 4,
  /** 电竞赛事 */
  ESport = 5,
}

/** OB 电竞球种 id（对齐 Flutter isOBESport） */
export const OB_ESPORT_SPORT_IDS = ['100', '101', '102', '103'];

/** 最终盘口类型，投注参数 marketTypeFinally */
export enum EObMarketTypeFinally {
  EU = 'EU',
  HK = 'HK',
}

/**
 * 是否自动接受赔率变化（投注参数 useAcceptOdds）
 * 1：自动接收更好的赔率，2：自动接受任何赔率变动，3：不自动接受赔率变动
 */
export enum EObAcceptOdds {
  Better = 1,
  Any = 2,
  No = 3,
}

/** 下注接口返回的注单状态 orderStatusCode */
export enum EObBetOrderStatusCode {
  Fail = 0,
  Success = 1,
  Confirming = 2,
}

/** 注单状态查询接口(queryOrderStatus)返回的 status */
export enum EObQueryOrderStatus {
  Success = 1,
  Fail = 2,
  Confirming = 3,
  Cancel = 4,
}

/** 盘口/赛事级别开关：0-开盘 1-封盘 2-关盘 11-锁盘 */
export const OB_LOCKED_HANDICAP_STATUS = [1, 2, 11];

/** 投注项状态：1-开盘 2-封盘 */
export const OB_ODDS_STATUS_SUSPENDED = 2;

/** 单关模式：是否开启多单关投注模式，1：是，0：否（串关传 0） */
export enum EObOpenMiltSingle {
  No = 0,
  Yes = 1,
}
