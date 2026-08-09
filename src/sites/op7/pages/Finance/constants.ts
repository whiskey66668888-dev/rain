export enum WalletType {
  Deposit,
  Withdrawal,
  Transfer,
}

export enum DepositChannelType {
  virtual = 'virtual',
  bank = 'bank',
  aliwechat = 'aliwechat', // 数字币
}

export enum CurrencyType {
  cny = 'RMB',
  usdt = 'USDT',
}

// 虚拟币教程
export const VirutalGuides = [
  {
    icon: '/images/common/finance/ic_binance.svg',
    title: 'Binance教程',
    tips: '从我们推荐的交易所购买加密货币',
    link: '/help_center/detail?isVirtualCoin=true&virtualId=1',
  },
  // {
  //   icon: '/images/common/finance/ic_im.svg',
  //   title: 'ImToken教程',
  //   tips: '从我们推荐的钱包购买加密货币',
  //   link: '/help_center/detail?isVirtualCoin=true&virtualId=3',
  // },
  {
    icon: '/images/common/finance/ic_okex.svg',
    title: '欧易教程',
    tips: '从我们推荐的交易所购买加密货币',
    link: '/help_center/detail?isVirtualCoin=true&virtualId=4',
  },
  {
    icon: '/images/common/finance/ic_gate.svg',
    title: 'Gate.io教程',
    tips: '从我们推荐的交易所购买加密货币',
    link: '/help_center/detail?isVirtualCoin=true&virtualId=2',
  },
];

export const VirtualDepositActivities = [
  {
    id: '194',
    image: '/images/common/finance/deposit-activity/194.webp',
    title: '虚拟币存款加送0.5%',
  },
  {
    id: '286',
    image: '/images/common/finance/deposit-activity/286.webp',
    title: 'USDT 节节高升',
  },
];

export enum TransferDirection {
  toVenue,
  fromVenue,
}

/** 支付页禁止 iframe 嵌套，需新窗口打开（按 payName 识别） */
export const isExternalBrowserPayItem = (payName?: string): boolean => {
  if (!payName) return false;
  const lower = payName.toLowerCase();
  return lower.includes('ebpay') || lower.includes('微信gw');
};
