/**
 * 置顶盘口存储工具类
 * 用于管理用户置顶的盘口ID列表
 */
class SetTopStorage {
  /**
   * 获取置顶数据
   * @param key 存储键名
   * @returns 置顶的盘口ID列表
   */
  static getTopData(key: string): string[] {
    try {
      if (typeof window === 'undefined') {
        return [];
      }
      const data = localStorage.getItem(key);
      if (!data) {
        return [];
      }
      return JSON.parse(data) as string[];
    } catch (_e) {
      return [];
    }
  }

  /**
   * 设置置顶数据
   * @param key 存储键名
   * @param data 置顶的盘口ID列表
   */
  static setTopData(key: string, data: string[]): void {
    try {
      if (typeof window === 'undefined') {
        return;
      }
      localStorage.setItem(key, JSON.stringify(data));
    } catch (_e) {
      // 不处理错误
    }
  }

  /**
   * 移除指定键的数据
   * @param key 存储键名
   */
  static removeICode(key: string): void {
    try {
      if (typeof window === 'undefined') {
        return;
      }
      localStorage.removeItem(key);
    } catch (_e) {
      // 不处理错误
    }
  }
}

export default SetTopStorage;
