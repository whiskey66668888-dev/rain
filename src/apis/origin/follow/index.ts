/**
 * 体育赛事关注（v2 三端同步）接口
 *
 * 基础路径：/api/game，均需登录，参数为表单参数（form-urlencoded）。
 * 与旧接口 /api/game/match/follow/* 相互独立，新端只对接 v2。
 * 详见 .claude/api.md
 */
export * from './types';
export * from './queryKeys';
export * from './list';
export * from './add';
export * from './del';
export * from './sync';
