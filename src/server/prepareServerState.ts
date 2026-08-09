import Koa from 'koa';

import { FBTokenResponse, OBTokenResponse } from '@/apis/origin/system';

import { Locale } from '../core/i18n';
import { RootState } from '../core/store';

// 初始化缓存，目前只缓存三方api配置
const cachedServerState: {
  thirdApiConfig: {
    ob: { isMaintenance: boolean; config: OBTokenResponse | null };
    fb: { isMaintenance: boolean; config: FBTokenResponse | null };
  };
} = {
  thirdApiConfig: {
    ob: { isMaintenance: false, config: null },
    fb: { isMaintenance: false, config: null },
  },
};

/**
 * 准备服务redux state数据
 */
export function prepareServerState(
  _ctx: Koa.Context,
  _siteConfig: SiteConfig,
  _detectedLocale: Locale,
): Partial<RootState> {
  return JSON.parse(
    JSON.stringify({
      config: {
        isSSRRedered: true,
      },
      thirdApiConfig: {
        ob: cachedServerState.thirdApiConfig.ob,
        fb: cachedServerState.thirdApiConfig.fb,
      },
    }),
  ) as Partial<RootState>;
}

// 更新三方api缓存
export function updateCacheState(state: RootState): void {
  cachedServerState.thirdApiConfig = {
    ob: state.thirdApiConfig.ob,
    fb: state.thirdApiConfig.fb,
  };
}

/** 下发给客户端的 state 类型：只包含需要注水的部分字段 */
export type StateForClient = {
  config: Partial<RootState['config']>;
  sport: Partial<RootState['sport']>;
};

// 将api配置清空，由客户端自己获取对应的三方token，返回清洗后的state（仅部分字段）
export function stateForClient(state: RootState): StateForClient {
  return {
    config: {
      isSSRRedered: true,
    },
    sport: {
      mainList: {
        datas: {
          menuInfo: state.sport.mainList.datas.menuInfo,
        },
      },
    },
  } as StateForClient;
}
