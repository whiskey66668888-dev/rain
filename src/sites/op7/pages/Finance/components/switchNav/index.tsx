import React, { useState } from 'react';
// components
import clsx from 'clsx';
import Icon from '@/common/components/Icon';
import Switch from '@/common/components/Switch';
import Popover from '@/common/components/Popover';

// styles
import styles from './index.module.scss';

interface SwitchNavProps {
  className?: string;
  title: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  tooltip?: string | React.ReactNode;
  /** 透传给 Popover 根节点 */
  tooltipPopoverClassName?: string;
}

/**
 * switch nav 栏
 */
const SwitchNav: React.FC<SwitchNavProps> = ({
  className,
  title,
  checked,
  onChange,
  tooltip,
  tooltipPopoverClassName,
}) => {
  const [showQuestion, setShowQuestion] = useState(false);
  return (
    <div className={clsx(styles.switchNavItem, className)}>
      <div className={styles.title}>
        <span>{title}</span>
        {tooltip && (
          <Popover
            className={clsx(styles.tooltipPopover, tooltipPopoverClassName)}
            content={tooltip}
            visible={showQuestion}
            trigger="click"
            placement="top"
          >
            <Icon
              onMouseEnter={() => setShowQuestion(true)}
              onMouseLeave={() => setShowQuestion(false)}
              src="/images/common/question.svg"
              size="16px"
              color="var(--Text-700)"
            />
          </Popover>
        )}
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
};

export default SwitchNav;
