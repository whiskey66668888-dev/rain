import type { CSSProperties, HTMLAttributes } from 'react';

import c2cIcon from './c2c.svg?raw';
import rmbIcon from './rmb.svg?raw';
import szbIcon from './szb.svg?raw';
import xnbIcon from './xnb.svg?raw';
import yhkIcon from './yhk.svg?raw';
import zfbIcon from './zfb.svg?raw';

export type WalletChannelIconType =
  | 'cny'
  | 'rmb'
  | 'usdt'
  | 'virtual'
  | 'digital'
  | 'aliwechat'
  | 'c2c'
  | 'bank'
  | 'bankCard'
  | 'alipay'
  | 'zfb';

export interface WalletChannelIconProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
  type: WalletChannelIconType;
  selected?: boolean;
  size?: number | string;
  withBackground?: boolean;
  backgroundSize?: number | string;
  backgroundFill?: string;
  selectedBackgroundFill?: string;
  color?: string;
  selectedColor?: string;
  backgroundColor?: string;
  selectedBackgroundColor?: string;
  iconColor?: string;
  selectedIconColor?: string;
}

const DEFAULT_BACKGROUND_COLOR = 'var(--Text-800)';
const SELECTED_BACKGROUND_COLOR = 'var(--White-100)';

const iconMap: Record<WalletChannelIconType, string> = {
  cny: rmbIcon,
  rmb: rmbIcon,
  usdt: xnbIcon,
  virtual: xnbIcon,
  digital: szbIcon,
  aliwechat: szbIcon,
  c2c: c2cIcon,
  bank: yhkIcon,
  bankCard: yhkIcon,
  alipay: zfbIcon,
  zfb: zfbIcon,
};

const toSizeValue = (size: number | string) => (typeof size === 'number' ? `${size}px` : size);

const normalizeSvgSize = (svg: string) =>
  svg.replace('<svg ', '<svg style="display:block;width:100%;height:100%;" ');

const WalletChannelIcon = ({
  type,
  selected = false,
  size = 16,
  withBackground = false,
  backgroundSize,
  backgroundFill = 'var(--White-100)',
  selectedBackgroundFill = 'var(--ThemeColor-Main)',
  color,
  selectedColor,
  backgroundColor = DEFAULT_BACKGROUND_COLOR,
  selectedBackgroundColor = SELECTED_BACKGROUND_COLOR,
  iconColor,
  selectedIconColor,
  style,
  ...props
}: WalletChannelIconProps) => {
  const icon = normalizeSvgSize(iconMap[type]);
  const iconSize = toSizeValue(size);
  const wrapSize = toSizeValue(backgroundSize ?? size);
  const iconFill = selected
    ? (selectedIconColor ?? selectedColor ?? selectedBackgroundColor)
    : (iconColor ?? color ?? backgroundColor);
  const bgFill = selected ? selectedBackgroundFill : backgroundFill;
  const iconStyle: CSSProperties = {
    color: iconFill,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: withBackground ? wrapSize : iconSize,
    height: withBackground ? wrapSize : iconSize,
    borderRadius: withBackground ? '50%' : undefined,
    backgroundColor: withBackground ? bgFill : undefined,
    lineHeight: 0,
    ...style,
  };

  return (
    <span aria-hidden="true" {...props} style={iconStyle}>
      <span
        style={{ display: 'inline-block', width: iconSize, height: iconSize, lineHeight: 0 }}
        dangerouslySetInnerHTML={{ __html: icon }}
      />
    </span>
  );
};

export default WalletChannelIcon;
