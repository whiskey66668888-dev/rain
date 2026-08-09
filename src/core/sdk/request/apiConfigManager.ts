import Cookies from 'js-cookie';

import { FBTokenResponse, OBTokenResponse } from '@/apis/origin/system';
import {
  setThirdPartyApiConfig,
  ThirdApiConfigState,
} from '@/core/store/slices/thirdApiConfigSlice';
import { getGlobalStoreForApiRequest } from '@/core/store/util';
import { API_CODE_ORIGIN_SUCCESS } from '@/utils/constants/apiCodeOrigin';

import { ResponseData, ResponseError } from './model';

type ApiType = 'fb' | 'ob';
interface GetConfigFn {
  (isLogin: boolean): Promise<ResponseData<FBTokenResponse | OBTokenResponse>>;
}

/**
 * API配置管理器
 * 负责管理三方api配置 url token刷新和请求重试
 */
class ApiConfigManager {
  // token刷新状态：防止并发刷新
  private refreshPromises: {
    fb: Promise<void> | null;
    ob: Promise<void> | null;
  } = {
    fb: null,
    ob: null,
  };

  /**
   * 检查是否有token和url配置
   */
  private hasConfig(apiType: ApiType): boolean {
    const state = getGlobalStoreForApiRequest().getState();
    return !!state.thirdApiConfig[apiType].config;
  }

  /**
   * 刷新token
   */
  private async refreshToken(apiType: ApiType, getConfigFn: GetConfigFn): Promise<void> {
    // 如果正在刷新，等待现有的刷新完成
    const existingRefresh = this.refreshPromises[apiType];
    if (existingRefresh) {
      return existingRefresh;
    }

    // 创建新的刷新Promise
    const refreshPromise = (async () => {
      try {
        const isLogin = Cookies.get('isLogin') === '1';
        const thirdPartyApiConfig = await getConfigFn(isLogin);
        console.log('thirdPartyApiConfig', thirdPartyApiConfig);
        if (thirdPartyApiConfig.code === API_CODE_ORIGIN_SUCCESS) {
          const store = getGlobalStoreForApiRequest();
          store.dispatch(
            setThirdPartyApiConfig({
              apiType,
              config: {
                isMaintenance: false,
                config: thirdPartyApiConfig.data,
              } as ThirdApiConfigState[keyof ThirdApiConfigState],
            }),
          );
        } else {
          throw new ResponseError(
            thirdPartyApiConfig.code,
            thirdPartyApiConfig.message,
            thirdPartyApiConfig.data,
            '',
          );
        }
      } catch (error) {
        console.error(`刷新${apiType.toUpperCase()} token失败:`, error);
        throw error;
      } finally {
        // 清除刷新Promise，允许下次刷新
        this.refreshPromises[apiType] = null;
      }
    })();

    this.refreshPromises[apiType] = refreshPromise;
    return refreshPromise;
  }

  /**
   * 确保有配置（token和url），如果没有则先获取
   */
  async ensureConfig(apiType: ApiType, getConfigFn: GetConfigFn): Promise<void> {
    if (this.hasConfig(apiType)) {
      return;
    }

    // 如果没有配置，先获取三方的配置
    await this.refreshToken(apiType, getConfigFn);
  }

  /**
   * 等待token刷新完成（如果正在刷新）或触发刷新
   * @returns Promise<void> token刷新完成
   */
  async waitForTokenRefresh(apiType: ApiType, getConfigFn: GetConfigFn): Promise<void> {
    // 如果正在刷新，等待完成
    if (this.refreshPromises[apiType]) {
      await this.refreshPromises[apiType];
      return;
    }

    // 否则触发刷新
    await this.refreshToken(apiType, getConfigFn);
  }
}

export const apiConfigManager = new ApiConfigManager();
