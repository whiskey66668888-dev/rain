/**
 * EMC 自定义消息 description / extension（对齐 emc chat_extension_type.dart）
 *
 * 注意：晒单发送时 Flutter 用的是 **label「晒单消息」**，不是 value「Emc1」；
 * 接收端需同时兼容 value / label / 「大单消息」/ 空 description。
 *
 * 使用 const 对象而非 enum，避免 string 与 enum 比较触发 no-unsafe-enum-comparison。
 */

export const EmcMsgDescription = {
  Emc1: 'Emc1',
  MatchShare: 'MatchShare',
  HotWord: 'HotWord',
  ConfigEdit: 'ConfigEdit',
  VipMemberEnter: 'VipMemberEnter',
  RetractMessage: 'RetractMessage',
} as const;

export type EmcMsgDescription = (typeof EmcMsgDescription)[keyof typeof EmcMsgDescription];

/** Flutter 发送晒单时用的中文 label */
export const EMC_MSG_DESCRIPTION_LABEL = {
  Emc1: '晒单消息',
  MatchShare: '本场比赛',
  HotWord: '热词消息',
  ConfigEdit: 'OP配置变更',
  VipMemberEnter: 'VIP进入聊天室',
  RetractMessage: '软撤回消息',
  BigOrder: '大单消息',
} as const;

export const EmcMsgExtension = {
  DB: 'DB',
  FB: 'FB',
  BTI: 'BTI',
} as const;

export type EmcMsgExtension = (typeof EmcMsgExtension)[keyof typeof EmcMsgExtension];

/** 是否为晒单类 description（含兼容旧值） */
export const isBetShareDescription = (description?: string): boolean => {
  const desc = (description ?? '').trim();
  if (!desc) return true; // 空 description 兼容为晒单
  return (
    desc === EmcMsgDescription.Emc1 ||
    desc === EMC_MSG_DESCRIPTION_LABEL.Emc1 ||
    desc === EMC_MSG_DESCRIPTION_LABEL.BigOrder
  );
};

/** 是否为本场比赛 description（value / label） */
export const isMatchShareDescription = (description?: string): boolean => {
  const desc = (description ?? '').trim();
  return desc === EmcMsgDescription.MatchShare || desc === EMC_MSG_DESCRIPTION_LABEL.MatchShare;
};

/** 是否为热词 description（value / label） */
export const isHotWordDescription = (description?: string): boolean => {
  const desc = (description ?? '').trim();
  return desc === EmcMsgDescription.HotWord || desc === EMC_MSG_DESCRIPTION_LABEL.HotWord;
};

/** 是否为配置变更信令（不展示） */
export const isConfigEditDescription = (description?: string): boolean => {
  const desc = (description ?? '').trim();
  return (
    desc === EmcMsgDescription.ConfigEdit ||
    desc.includes(EMC_MSG_DESCRIPTION_LABEL.ConfigEdit) ||
    desc.includes('配置变更')
  );
};

/** 是否为软撤回信令（不展示，用于删除目标消息） */
export const isRetractDescription = (description?: string): boolean => {
  const desc = (description ?? '').trim();
  return (
    desc === EmcMsgDescription.RetractMessage || desc === EMC_MSG_DESCRIPTION_LABEL.RetractMessage
  );
};
