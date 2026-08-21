import { safeGetLocalJSON, safeRemoveLocal, safeSetLocalJSON } from '@/utils/storage/webStorage';

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
    const data = safeGetLocalJSON<unknown>(key, []);
    return Array.isArray(data)
      ? data.filter((item): item is string => typeof item === 'string')
      : [];
  }

  /**
   * 设置置顶数据
   * @param key 存储键名
   * @param data 置顶的盘口ID列表
   */
  static setTopData(key: string, data: string[]): void {
    safeSetLocalJSON(key, data);
  }

  /**
   * 移除指定键的数据
   * @param key 存储键名
   */
  static removeICode(key: string): void {
    safeRemoveLocal(key);
  }
}

export default SetTopStorage;
