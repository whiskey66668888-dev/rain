/** 晒单 / 跟单接口类型（POST /api/betshare/*） */

export interface SubmitShareParams {
  /** 实际晒单的注单号 */
  orderId: string;
  /** 晒单消息序号（仅后台展示用） */
  seq?: number;
  /** 体育场馆来源代码，如 FB / BTI / IM */
  venueCode?: string;
}

export interface SubmitFollowParams {
  /** 被跟单晒单对应的原始注单号 */
  shareOrderId: string;
  /** 当前会员跟单产生的注单号 */
  orderId: string;
  /** 跟单投注金额 */
  betAmount: number | string;
  /** 体育场馆来源代码 */
  venueCode?: string;
}

export interface BetShareSubmitResult {
  success: boolean;
  /** true=首次写入；false=已存在（幂等成功） */
  inserted: boolean;
  message: string;
}
