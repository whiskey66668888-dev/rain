import type { WelfareCenterItem } from '@/apis/origin/welfareCenter';

export interface WelfareReceiveSuccessModalData {
  title: string;
  cash: string;
  content: string;
}

/** 与 emc-h5 giftCenter 领取成功弹窗文案一致 */
export function buildWelfareReceiveSuccessModalData(
  item: WelfareCenterItem,
): WelfareReceiveSuccessModalData {
  const platformType = String(item.platformType ?? '');
  const walletTypeCode = Number(item.walletType);
  const isRebateVal = Number(item.isRebate);
  const isAllPlatformOrLottery = platformType === '全平台' || platformType.includes('彩票');

  let content: string;
  if (isAllPlatformOrLottery) {
    const excludeLottery =
      walletTypeCode === 10 ||
      walletTypeCode === 11 ||
      isRebateVal === 0 ||
      platformType.includes('彩票');
    content = excludeLottery
      ? `除彩票外可用，需${item.turnoverAmount}元有效流水`
      : `不限场馆，需${item.turnoverAmount}元有效流水`;
  } else {
    content = `仅限${platformType}场馆，需${item.turnoverAmount}元有效流水`;
  }

  return {
    title: '领取福利',
    cash: `已领取 ${item.cashStr ?? ''} 礼金`,
    content,
  };
}
