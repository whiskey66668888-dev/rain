import React, { useMemo, useState } from 'react';
// components
import PickerModal from '../../../PickerModal';
import Button from '@/common/components/Button';
import Icon from '@/common/components/Icon';
import Input from '../input';
import { toast } from '@/common/components/Toast';
import { PickerColumnItem, PickerValue } from 'antd-mobile/es/components/picker-view';

// hooks
import { useDigitalTypeListQuery, addDigitalReq, DigitalItem } from '@/apis/origin/bank';

// style
import styles from './index.module.scss';

interface AddDigitalProps {
  token: string;
  onClose: (refresh?: boolean) => void;
}

const AddDigital: React.FC<AddDigitalProps> = ({ token, onClose }) => {
  // 收币地址
  const [cardNumber, setCardNumber] = useState('');
  // 确认收币地址
  const [rcardNumber, setRcardNumber] = useState('');
  // 备注
  const [remark, setRemark] = useState('');
  // loading
  const [loading, setLoading] = useState(false);
  // 选中币商
  const [selectDigital, setSelectDigital] = useState<DigitalItem | null>();
  // 是否显示币商选择弹框
  const [pickerVisible, setPickerVisible] = useState(false);

  const { data: digitalTypeList = [] } = useDigitalTypeListQuery();

  // 币商Picker数据
  const digitalTypeOption = useMemo(() => {
    return [digitalTypeList.map((obj) => ({ label: obj.name, value: obj.id }))];
  }, [digitalTypeList]);

  // 选择币商
  const onPickerConfirm = (value: PickerValue[]) => {
    const id = value[0];
    const item = digitalTypeList.find((obj) => obj.id === id);
    setSelectDigital(item);
    setPickerVisible(false);
  };

  // 按钮是否可点击
  const disabled = useMemo(() => {
    return cardNumber && rcardNumber && selectDigital ? false : true;
  }, [cardNumber, rcardNumber, selectDigital]);

  // 提交
  const handleSubmit = async () => {
    if (!selectDigital) {
      toast({ type: 'warning', description: '请选择币商' });
      return;
    }

    if (cardNumber != rcardNumber) {
      toast({ type: 'warning', description: '账户地址输入不一致' });
      return;
    }

    const payload = {
      sysVirtualId: selectDigital.id,
      cardNumber,
      remark,
      token,
    };

    try {
      setLoading(true);
      await addDigitalReq(payload);
      toast({ type: 'success', description: '添加成功' });
      // 关闭并刷新
      onClose(true);
    } finally {
      setLoading(false);
    }
  };

  // 渲染 picker item
  const renderPickerLabel = (item: PickerColumnItem) => {
    return <div className={styles.pickerRowItem}>{item.label}</div>;
  };

  return (
    <div className={styles.content}>
      <div className={styles.addBox}>
        <div className={styles.list_content}>
          <div className={styles.list_title}>所属币商</div>
          <div className={styles.list_chose} onClick={() => setPickerVisible(true)}>
            <div className={styles.list_label}>
              <span className={!selectDigital ? styles.placeholder : ''}>
                {selectDigital ? selectDigital.name : '请选择所属币商'}
              </span>
            </div>

            <div className={styles.icon}>
              <Icon src="/images/common/arrow_down.svg" size={8} color="var(--Text-700)" />
            </div>
          </div>
        </div>

        <Input
          className={styles.input}
          value={cardNumber}
          onChange={setCardNumber}
          placeholder="请输入收币地址"
          autoComplete="set-cardNumber"
          maxLength={42}
          allowClear
          allowPaste
        />

        <Input
          className={styles.input}
          value={rcardNumber}
          onChange={setRcardNumber}
          placeholder="请再次输入收币地址"
          autoComplete="set-rcardNumber"
          maxLength={42}
          allowClear
          allowPaste
        />

        <Input
          className={styles.input}
          value={remark}
          onChange={setRemark}
          placeholder="请输入备注信息"
          autoComplete="set-remark"
          allowClear
        />
      </div>
      <div className={styles.buttonWrap}>
        <Button
          className={styles.button}
          type="primary"
          onClick={() => {
            handleSubmit();
          }}
          disabled={disabled}
          loading={loading}
        >
          完成
        </Button>
      </div>

      {/* 选择币商 */}
      <PickerModal
        columns={digitalTypeOption}
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onConfirm={onPickerConfirm}
        title="请选择所属币商"
        cancelText="取消"
        confirmText="完成"
        renderLabel={renderPickerLabel}
      />
    </div>
  );
};

export default AddDigital;
