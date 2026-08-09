/**
 * 体育赛事关注（v2 三端同步）业务逻辑层
 *
 * 接口相关内容见 @/apis/origin/follow，这里只放：
 *  - 数据映射（web MatchBaseInfo / 投注项 ↔ 后端 matchData）
 *  - 登录同步编排 Hook（useFavorites）
 *  - 投注自动关注的服务器镜像
 */
export * from './favoriteMapper';
export * from './useFavorites';
export * from './betAutoFollow';
