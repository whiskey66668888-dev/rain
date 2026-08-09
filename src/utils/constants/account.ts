export enum BindAccountType {
  bank, // 绑定银行卡
  virtual, // 虚拟币
  digital, // 数字货币
  otherBank, // 非本人银行卡
  alipay, // 支付宝
}

type AccountVerifyInfo = {
  title: string;
  info: string;
  verifyType: number;
};

type MapType = Record<BindAccountType, AccountVerifyInfo>;

export const AccountVerifyMap: MapType = {
  [BindAccountType.bank]: {
    title: '添加银行卡',
    info: '支付密码验证',
    verifyType: 14,
  },
  [BindAccountType.virtual]: {
    title: '虚拟币绑定',
    info: '支付密码验证',
    verifyType: 16,
  },
  [BindAccountType.digital]: {
    title: '数字币绑定',
    info: '支付密码验证',
    verifyType: 18,
  },
  [BindAccountType.alipay]: {
    title: '支付宝绑定',
    info: '支付密码验证',
    verifyType: 25,
  },
  [BindAccountType.otherBank]: {
    title: '非本人银行卡绑定',
    info: '支付密码验证',
    verifyType: 22,
  },
};
