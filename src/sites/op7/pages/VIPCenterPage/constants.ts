// ✅ 定义返水数据类型
export interface DiscountDataItem {
  title: string;
  fonts: string;
}

// ✅ 定义额度数据类型
export interface QuotaDataItem {
  title: string;
  icon: string;
  iconDark: string;
  fonts: string;
  groupId?: string | number; // ✅ 添加 groupId
  receive?: boolean;
  iconDisabled?: string;
  iconDisabledDark?: string;
  promotionStatus?: string;
  birthdayCashStatus?: string;
  weekBonusStatus?: string;
}

export const discountData: DiscountDataItem[] = [
  {
    title: '0',
    fonts: '真人返水',
  },
  {
    title: '0',
    fonts: '体育返水',
  },
  {
    title: '0',
    fonts: '足球返水',
  },
  {
    title: '0',
    fonts: '电竞返水',
  },
  {
    title: '0',
    fonts: '棋牌返水',
  },
  {
    title: '0',
    fonts: '电子返水',
  },
];

export const quotaData: QuotaDataItem[] = [
  {
    title: '0',
    icon: '/images/common/vip/vip_gift_icon_1.png',
    iconDark: '/images/common/vip/vip_gift_icon_1_dark.png',
    fonts: '每日提款次数',
    groupId: 1, // ✅ 添加 groupId
  },
  {
    title: '0',
    icon: '/images/common/vip/vip_gift_icon_2.png',
    iconDark: '/images/common/vip/vip_gift_icon_2_dark.png',
    fonts: '每日提款额度',
    groupId: 2, // ✅ 添加 groupId
  },
  {
    title: '0',
    icon: '/images/common/vip/vip_gift_icon_3.png',
    iconDark: '/images/common/vip/vip_gift_icon_3_dark.png',
    fonts: '升级礼金',
    groupId: 3, // ✅ 添加 groupId
  },
  {
    title: '0',
    icon: '/images/common/vip/vip_gift.png',
    iconDark: '/images/common/vip/vip_gift_dark.png',
    fonts: '升级助力金',
    groupId: 4, // ✅ 添加 groupId
    receive: true,
  },
  {
    title: '0',
    icon: '/images/common/vip/vip_gift_icon_5.png',
    iconDark: '/images/common/vip/vip_gift_icon_5_dark.png',
    iconDisabled: '/images/common/vip/vip_gift_icon_5_disable.png',
    iconDisabledDark: '/images/common/vip/vip_gift_icon_5_disable_dark.png',
    fonts: '生日礼金',
    groupId: 5, // ✅ 添加 groupId
  },
  {
    title: '0',
    icon: '/images/common/vip/vip_gift_icon_4.png',
    iconDark: '/images/common/vip/vip_gift_icon_4_dark.png',
    fonts: '每周红包',
    groupId: 6, // ✅ 添加 groupId
  },
];
export const DEFAULT_AVATAR = '/images/common/mine/avatar/avatar_default.webp';

// ✅ 定义礼金状态类型
export type GiftStatus = 'available' | 'received' | 'locked' | null;

// ✅ 礼金状态配置
export const GIFT_STATUS_CONFIG = {
  available: {
    icon: '/images/common/vip/level_up_click.png',
    text: '可领取',
  },
  received: {
    icon: '/images/common/vip/level_up_click2.png',
    text: '已领取',
  },
  locked: {
    icon: '/images/common/vip/level_up_click3.png',
    text: '未达成',
  },
};
