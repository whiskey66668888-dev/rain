import { DepositPayTypeV2, PayItemV2 } from '@/apis/origin/finance/depositV2';
import { type WalletChannelIconType } from '@/sites/op7/components/WalletChannelIcon';

const currencyIconMap: Record<string, WalletChannelIconType> = {
  [DepositPayTypeV2.Cny]: 'rmb',
  [DepositPayTypeV2.Usdt]: 'virtual',
  [DepositPayTypeV2.Digital]: 'digital',
  [DepositPayTypeV2.DigitalCny]: 'digital',
  [DepositPayTypeV2.Alipay]: 'rmb',
  [DepositPayTypeV2.AliWechat]: 'digital',
  [DepositPayTypeV2.WeChat]: 'rmb',
};

export interface FooterText {
  label: string;
  isError: boolean;
}

export const formatMoney = (value: number): string => {
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const filterAmount = (value: string): string => {
  let next = value.replace(/[^0-9.]/g, '');
  if (next.startsWith('.')) next = `0${next}`;
  const parts = next.split('.');
  if (parts.length > 2) {
    next = `${parts[0]}.${parts.slice(1).join('')}`;
  }
  if (next.includes('.')) {
    const [integer = '', decimal = ''] = next.split('.');
    next = `${integer}.${decimal.slice(0, 2)}`;
  }
  return next;
};

export const isCnyGroup = (code: string): boolean => code === DepositPayTypeV2.Cny;
export const isUsdtGroup = (code: string): boolean => code === DepositPayTypeV2.Usdt;
export const getDefaultGroupId = (list: PayItemV2[], code?: string): number => {
  if (list.length === 0) return -1;
  if (code) {
    const match = list.find((item) => item.code === code);
    if (match) return match.groupId;
  }
  const usdt = list.find((item) => item.code === DepositPayTypeV2.Usdt);
  return (usdt ?? list[0])?.groupId ?? -1;
};

export const getIconType = (code: string): WalletChannelIconType => {
  return currencyIconMap[code] ?? 'virtual';
};
