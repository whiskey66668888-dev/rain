import { Popover as AntdPopover } from 'antd-mobile';
import type { PopoverProps as AntdPopoverProps } from 'antd-mobile';
import React, { useState } from 'react';

interface PopoverProps extends AntdPopoverProps {
  children: React.ReactElement;
  content: React.ReactNode;
}

/**
 * 弹出层
 * @param props
 * @returns
 */
const Popover = (props: PopoverProps) => {
  const [innerVisible, setInnerVisible] = useState(false);
  const isControlled = typeof props.visible === 'boolean';
  const visible = isControlled ? props.visible : innerVisible;
  const setVisible = (next: boolean) => {
    if (!isControlled) {
      setInnerVisible(next);
    }
    props.onVisibleChange?.(next);
  };
  const child = props.children;
  const prevProps = child.props as {
    onMouseEnter?: React.MouseEventHandler;
    onMouseLeave?: React.MouseEventHandler;
  };
  const { content, ...rest } = props;
  const shouldUseLegacyHover = !props.trigger;

  return (
    <AntdPopover {...rest} content={content} visible={visible} onVisibleChange={setVisible}>
      {shouldUseLegacyHover
        ? React.cloneElement(child, {
            onMouseEnter: (e: React.MouseEvent) => {
              prevProps.onMouseEnter?.(e);
              setVisible(true);
            },
            onMouseLeave: (e: React.MouseEvent) => {
              prevProps.onMouseLeave?.(e);
              setVisible(false);
            },
          })
        : child}
    </AntdPopover>
  );
};

export default Popover;
