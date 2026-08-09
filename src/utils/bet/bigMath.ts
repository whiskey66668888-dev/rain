import Big from 'big.js';

// Big.DP = 20;

/**
 * @roundDown -0 Rounds towards zero.I.e. truncate, no rounding.
 * @roundHalfUp -1 Rounds towards nearest neighbour.If equidistant, rounds away from zero.
 * @roundHalfEven -2 Rounds towards nearest neighbour.If equidistant, rounds towards even neighbour.
 * @roundUp -3 Rounds away from zero.
 */
Big.RM = Big.roundDown; // toFixed,round,方法的第二个参数，全局配置成，向下取整。即，截断，不进行舍入

type NumberType = number | string;

const bigMath = {
  /** 加法，可传多个数字 */
  add: (...nums: NumberType[]) => {
    try {
      return nums
        .reduce((acc, num) => {
          return acc.plus(num || 0); // 累加所有数字
        }, new Big(0))
        .toNumber();
    } catch (error) {
      console.error('js---bigMath.add error', error);
      return 0;
    }
  },

  /** 减法，A - B */
  subtract: (num1: NumberType, num2: NumberType) => {
    try {
      return new Big(num1 || 0).minus(num2 || 0).toNumber();
    } catch (error) {
      console.error('js---bigMath.subtract error', error);
      return 0;
    }
  },

  /** 乘法，可传多个数字 */
  multiply: (...nums: NumberType[]) => {
    try {
      return nums
        .reduce((acc, num) => {
          return acc.times(num || 0);
        }, new Big(1))
        .toNumber();
    } catch (error) {
      console.error('js---bigMath.multiply error', error);
      return 0;
    }
  },

  /** 除法，A / B */
  divide: (num1: NumberType, num2: NumberType) => {
    try {
      return new Big(num1 || 0).div(num2 || 0).toNumber();
    } catch (error) {
      console.error('js---bigMath.divide error', error);
      return 0;
    }
  },

  /** 检查是否为 NaN (无效数字) */
  isNaN: (num: NumberType) => {
    try {
      new Big(num);
      return false;
    } catch (error) {
      console.error('js---bigMath.isNaN error', error);
      return true;
    }
  },

  /** 小数点后保留n位数 */
  decimals: (
    val: string | number,
    options?: {
      /** 小数点位数 */
      decimalPlaces?: number;
      /** 是否需要填充 “0” */
      padZero?: boolean;
      /** 是否需要转换为本地字符串 */
      toLocalString?: boolean;
    },
  ) => {
    try {
      const num = new Big(val);
      const { decimalPlaces = 2, padZero, toLocalString } = options ?? {};

      if (toLocalString) {
        return num.toNumber().toLocaleString();
      }

      // 使用 Big.js 自带方法
      if (padZero) {
        // toFixed 会自动填充 0，使用 roundingMode 0 向下取整（截断）
        return num.toFixed(decimalPlaces, Big.roundDown);
      } else {
        // round 截取到指定位数（向下取整），然后转字符串
        return num.round(decimalPlaces, Big.roundDown).toString();
      }
    } catch (error) {
      console.error('js---bigMath.decimals error', error);
      return '';
    }
  },
};

/** 返回新的 Big 实例，随你操作 */
export const bigNB = (num: NumberType) => {
  try {
    return new Big(num || 0);
  } catch (error) {
    console.error('js---bigMath.big error', error);
    return new Big(0);
  }
};

// 导出对象
export default bigMath;
