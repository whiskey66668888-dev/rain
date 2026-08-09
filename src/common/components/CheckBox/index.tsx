/**
 * Checkbox 组件
 */
import React from 'react';
import LazyImage from '../LazyImage';

// 1. 首先定义组件的属性接口（Props）
interface CheckBoxProps {
  value: boolean; // 值，必填
  onChange?: (val: boolean) => void; // 回调函数，必填
  size?: number; // 尺寸
}

const CheckBox: React.FC<CheckBoxProps> = ({ value, onChange, size = 16 }) => {
  return (
    <div
      style={{ width: size, height: size }}
      onClick={onChange ? () => onChange(!value) : undefined}
    >
      <LazyImage
        lazy={false}
        src={`/images/common/checkbox/${value ? 'ic_sel.svg' : 'ic_nor.svg'}`}
        width={size}
        height={size}
      />
    </div>
  );
};

export default CheckBox;
