import { WithdrawType, AccountItem } from '@/apis/origin/finance/withdrawal';

// 获取账户名称显示
export const getAccountName = ({ type, item }: { type: WithdrawType; item: AccountItem }) => {
  if (type == WithdrawType.zfb) {
    return `${item.username} (${item.memberCardNum})`;
  } else if (type == WithdrawType.virtual) {
    return `USDT (${item.memberCardNum})`;
  }

  return `${item.cardName} (${item.memberCardNum})`;
};

// 获取账户名称描述
export const getAccountTip = ({ type, item }: { type: WithdrawType; item: AccountItem }) => {
  if (type == WithdrawType.bank) {
    return `${item.isOwn == 0 ? '(非本人)' : ''}${item.username}`;
  }
  return item.remark;
};

// 手续费接口按后端约定使用数字类型标识提现渠道。
export const getWithdrawFeeType = (type?: WithdrawType): 1 | 2 | 3 => {
  if (type === WithdrawType.virtual) return 2;
  if (type === WithdrawType.digital) return 3;
  return 1;
};

interface CalcHandlingFeeOptions {
  amount: number;
  feeRate: number;
  feeCash: number;
  feeCode?: string;
}

export const calcHandlingFee = ({
  amount,
  feeRate,
  feeCash,
  feeCode = '0000',
}: CalcHandlingFeeOptions): number => {
  if (!amount || amount <= 0 || feeRate <= 0) return 0;

  // 6003 场景下 feeCash 代表“还需完成金额”，不再视为免费提现额度。
  const freeCash = feeCode === '6003' ? 0 : feeCash;
  const freeBalance = Math.max(freeCash, 0);
  const chargeAmount = Math.max(amount - freeBalance, 0);
  if (chargeAmount <= 0) return 0;

  // 产品要求：手续费向下取整，且只要收费最低收 1 元。
  const rawFee = chargeAmount * (feeRate / 100);
  const feeInt = Math.floor(rawFee);
  return Math.max(feeInt, 1);
};

/**
 * 安全的除法运算
 */
export function safeDivide(dividend: number, divisor: number, precision: number = 2): number {
  if (!divisor || divisor === 0) return 0;
  if (!dividend || dividend === 0) return 0;
  return toFixed(dividend / divisor, precision);
}

/**
 * 安全的浮点数运算，避免精度问题
 * @param num - 数字
 * @param precision - 保留小数位数
 */
export function toFixed(num: number, precision: number = 2): number {
  // 确保 num 是有效的数字
  if (num === null || num === undefined || isNaN(num)) return 0;

  // 转换为数字类型（防止字符串传入）
  const numValue = Number(num);
  if (isNaN(numValue)) return 0;

  // 👇 截取而非四舍五入
  const multiplier = Math.pow(10, precision);
  return Math.floor(numValue * multiplier) / multiplier;
}

// 格式化值的函数，支持 number 和 string 类型
export const formatValue = (value: number | string): string => {
  // 如果输入为空或无效，返回空字符串
  if (!value || isNaN(Number(value))) return '0.00';

  // 将输入值转换为数字并确保最多两位小数
  return parseFloat(value.toString()).toFixed(2);
};
