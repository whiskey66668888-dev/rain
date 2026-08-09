// 银行账户类型
export enum BankAccountType {
  BANK_ACCOUNT = 'bank_account', // 银行卡
  DIGITAL_ACCOUNT = 'digital_account', // 数字货币
  VIRTUAL_ACCOUNT = 'virtual_account', // 虚拟币
  ZFB_ACCOUNT = 'zfb_account', // 支付宝
}

// 转换成安全中心的 accountBindType 枚举
export const getAccountBindType = (bankAccountType: BankAccountType): string => {
  if (bankAccountType === BankAccountType.BANK_ACCOUNT) {
    return 'BANK_ACCOUNT_BIND';
  } else if (bankAccountType === BankAccountType.VIRTUAL_ACCOUNT) {
    return 'VIRTUAL_ACCOUNT_BIND';
  } else if (bankAccountType === BankAccountType.DIGITAL_ACCOUNT) {
    return 'DIGITAL_ACCOUNT_BIND';
  } else if (bankAccountType === BankAccountType.ZFB_ACCOUNT) {
    return 'ZFB_ACCOUNT_BIND';
  }

  return '';
};
