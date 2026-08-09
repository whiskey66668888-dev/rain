/** OpenIM 消息配置（对齐 emc ImMessageResponse） */
export interface ImMessageResponse {
  imUserId: string;
  imWsUrl: string;
  imApiUrl: string;
  siteCodeThl: string;
  reqApiUrl: string;
  imIsOpen: boolean;
  imToken: string;
  reqToken: string;
  /** 球布斯禁言 WS 地址；空则禁言 WS 休眠 */
  reqWsUrl: string;
  imIsMaintain: boolean;
  sportData: string;
  /** 0=正常，1=禁言（登录 getImMessage 下发） */
  muteStatus: number;
  /** 禁言到期秒级时间戳：0=未禁言，-1=永久，>0=到期时间 */
  muteUntil: number;
  muteReason: string;
}

/** /api/im/getInfo 的 data JSON */
export interface ImInfoRaw {
  req_api_url?: string;
  site_code?: string;
  sport_data?: string;
  imIsMaintain?: boolean;
}

/** /api/im/getImMessage 的 data */
export interface ImMessageRaw {
  imUserId?: string;
  imWsUrl?: string;
  imApiUrl?: string;
  siteCodeThl?: string;
  reqApiUrl?: string;
  imIsOpen?: boolean;
  imToken?: string;
  reqToken?: string;
  reqWsUrl?: string;
  req_ws_url?: string;
  imIsMaintain?: boolean;
  sportData?: string;
  muteStatus?: number;
  mute_status?: number;
  muteUntil?: number;
  mute_until?: number;
  muteReason?: string;
  mute_reason?: string;
}

/** 聊天/发现配置（OpenIM /v1/emc/config/info） */
export interface ChatConfigInfo {
  discoverSwitch: number;
  chatSwitch: number;
  allMuted: number;
  sendMsgVipLevel: number;
  sendMsgBetAmount: number;
  bigBetAmount: number;
  bigWinAmount: number;
  bigCondition: number;
  specialVipLevel: number;
  showBetAmount: number;
  ruleTitle: string;
  ruleContent: string;
  textLength: number;
  groupChatInterval: number;
  groupChatMsgRepeatCount: number;
  groupChatMsgRepeatTime: number;
  groupChatMsgRepeatShowOrderCount: number;
}

const EMPTY_IM_MESSAGE: ImMessageResponse = {
  imUserId: '',
  imWsUrl: '',
  imApiUrl: '',
  siteCodeThl: '',
  reqApiUrl: '',
  imIsOpen: false,
  imToken: '',
  reqToken: '',
  reqWsUrl: '',
  imIsMaintain: false,
  sportData: '',
  muteStatus: 0,
  muteUntil: 0,
  muteReason: '',
};

/** 解析 /api/im/getInfo（data 为 JSON 字符串） */
export const normalizeImInfoData = (
  raw: string | ImInfoRaw | null | undefined,
): ImMessageResponse => {
  let json: ImInfoRaw = {};

  if (typeof raw === 'string') {
    try {
      json = JSON.parse(raw) as ImInfoRaw;
    } catch {
      return EMPTY_IM_MESSAGE;
    }
  } else if (raw) {
    json = raw;
  }

  return {
    ...EMPTY_IM_MESSAGE,
    siteCodeThl: json.site_code ?? '',
    reqApiUrl: json.req_api_url ?? '',
    sportData: json.sport_data ?? '',
    imIsMaintain: json.imIsMaintain ?? false,
  };
};

/** 解析 /api/im/getImMessage */
export const normalizeImMessageData = (raw: ImMessageRaw | null | undefined): ImMessageResponse => {
  if (!raw) return EMPTY_IM_MESSAGE;

  return {
    imUserId: raw.imUserId ?? '',
    imWsUrl: raw.imWsUrl ?? '',
    imApiUrl: raw.imApiUrl ?? '',
    siteCodeThl: raw.siteCodeThl ?? '',
    reqApiUrl: raw.reqApiUrl ?? '',
    imIsOpen: raw.imIsOpen ?? false,
    imToken: raw.imToken ?? '',
    reqToken: raw.reqToken ?? '',
    reqWsUrl: raw.reqWsUrl ?? raw.req_ws_url ?? '',
    imIsMaintain: raw.imIsMaintain ?? false,
    sportData: raw.sportData ?? '',
    muteStatus: Number(raw.muteStatus ?? raw.mute_status ?? 0),
    muteUntil: Number(raw.muteUntil ?? raw.mute_until ?? 0),
    muteReason: raw.muteReason ?? raw.mute_reason ?? '',
  };
};

export const normalizeChatConfigInfo = (
  data: ChatConfigInfo | Record<string, unknown>,
): ChatConfigInfo => {
  const json = data as Record<string, unknown>;
  return {
    discoverSwitch: Number(json.discover_switch ?? 1),
    chatSwitch: Number(json.chat_switch ?? 0),
    allMuted: Number(json.all_muted ?? 0),
    sendMsgVipLevel: Number(json.send_msg_vip_level ?? 0),
    sendMsgBetAmount: Number(json.send_msg_bet_amount ?? 0),
    bigBetAmount: Number(json.big_bet_amount ?? 0),
    bigWinAmount: Number(json.big_win_amount ?? 0),
    bigCondition: Number(json.big_condition ?? 1),
    specialVipLevel: Number(json.special_vip_level ?? 0),
    showBetAmount: Number(json.show_bet_amount ?? 0),
    ruleTitle: typeof json.rule_title === 'string' ? json.rule_title : '',
    ruleContent: typeof json.rule_content === 'string' ? json.rule_content : '',
    textLength: Number(json.text_length ?? 200),
    groupChatInterval: Number(json.group_chat_interval ?? 0),
    groupChatMsgRepeatCount: Number(json.group_chat_msg_repeat_count ?? 3),
    groupChatMsgRepeatTime: Number(json.group_chat_msg_repeat_time ?? 3),
    groupChatMsgRepeatShowOrderCount: Number(json.group_chat_msg_repeat_show_order_count ?? 3),
  };
};

/** 解析 /v2/sport/match/tab 的 data */
export const normalizeMatchDiscoverTabs = (
  raw: Record<string, unknown> | null | undefined,
): string[] => {
  if (!raw) return [];
  return Object.values(raw)
    .filter((item): item is string | number => typeof item === 'string' || typeof item === 'number')
    .map((item) => String(item).trim())
    .filter(Boolean);
};

export interface DiscoverIndexOddsRowRaw {
  up?: string;
  down?: string;
  goal?: string;
  score?: string;
  stop?: string;
  prob_str?: string;
  time_str?: string;
  up_color?: string;
  down_color?: string;
  goal_color?: string;
  away_color?: string;
  return_rate?: string;
}

export interface DiscoverIndexOddsAgencyRaw {
  id?: string | number;
  name?: string;
  list?: DiscoverIndexOddsRowRaw[];
}

export interface DiscoverIndexOddsDetailRaw {
  standard_detail?: DiscoverIndexOddsAgencyRaw[];
  let_goal_detail?: DiscoverIndexOddsAgencyRaw[];
  total_score_detail?: DiscoverIndexOddsAgencyRaw[];
  corner_kick_detail?: DiscoverIndexOddsAgencyRaw[];
}

export interface DiscoverIndexOddsResponse {
  detail?: DiscoverIndexOddsDetailRaw;
}

export const isDiscoverEnabled = (config: ChatConfigInfo | null | undefined): boolean =>
  config?.discoverSwitch === 1;

export const isChatEnabled = (config: ChatConfigInfo | null | undefined): boolean =>
  config?.chatSwitch === 1;
