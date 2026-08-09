/**
 * SSR 服务器配置
 */
export const ssrConfig = {
  /**
   * Redux state 缓存刷新间隔（毫秒）
   * 默认：1小时
   */
  stateCacheRefreshInterval: 60 * 60 * 1000,

  /**
   * 不需要 SSR 渲染的路由路径列表
   * 这些路径将直接返回客户端 HTML，不进行服务端渲染
   */
  noSSRPaths: [
    'exampleNoSSR',
    'SportsDetailsPage',
    'mine/deposit',
    'mine/withdrawal',
    'mine/transfer',
    'mine/memberTransfer',
  ],
};
