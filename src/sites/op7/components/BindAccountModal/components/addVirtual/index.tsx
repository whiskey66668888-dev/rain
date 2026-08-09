import React, { useMemo, useState, useEffect } from 'react';
// components
import Icon from '@/common/components/Icon';
import Button from '@/common/components/Button';
import Input from '../input';
import PickerModal from '../../../PickerModal';
import { toast } from '@/common/components/Toast';
import { PickerColumnItem, PickerValue } from 'antd-mobile/es/components/picker-view';

// hooks
import {
  addVirtualReq,
  useVirtuaChainListQuery,
  useVirtuaExchangeListQuery,
} from '@/apis/origin/bank';
import { ChainItem, ExchangeItem } from '@/apis/origin/bank';

// styles
import styles from './index.module.scss';
import LazyImage from '@/common/components/LazyImage';

interface AddVirtualProps {
  token: string;
  onClose: (refresh?: boolean) => void;
}

enum PickerType {
  chain,
  exchange,
}

const AddVirtual: React.FC<AddVirtualProps> = ({ token, onClose }) => {
  // 选中币种
  const [selectChain, setSelectChain] = useState<ChainItem | null>();
  // 选中交易所
  const [selectExchange, setSelectExchange] = useState<ExchangeItem | null>();
  // 账户地址
  const [cardNumber, setCardNumber] = useState('');
  // 确认账户地址
  const [rcardNumber, setRcardNumber] = useState('');
  // 备注
  const [remark, setRemark] = useState('');
  // 显示筛选器
  const [showPickerType, setShowPickerType] = useState<PickerType | null>(null);
  // loading
  const [loading, setLoading] = useState(false);

  // 币种列表
  const { data: chainList = [] } = useVirtuaChainListQuery();
  // 交易所列表
  const { data: exchangeList = [] } = useVirtuaExchangeListQuery();
  // 设置默认币种
  useEffect(() => {
    if (chainList.length == 0) return;

    const defaultValue = chainList.find((r) => r.chainCode == 'usdttrc20') || chainList[0];
    setSelectChain(defaultValue);
  }, [chainList]);

  // 设置默认交易所
  useEffect(() => {
    if (exchangeList.length == 0) return;

    const defaultValue = exchangeList.find((r) => r.isDefault) || exchangeList[0];
    setSelectExchange(defaultValue);
  }, [exchangeList]);

  // 币种Picker数据
  const chainOption = useMemo(() => {
    return [chainList.map((obj) => ({ label: obj.chainName, value: obj.chainCode }))];
  }, [chainList]);

  // 交易所
  const exchangeOption = useMemo(
    () => [exchangeList.map((obj) => ({ label: obj.virtualTypeName, value: obj.id }))],
    [exchangeList],
  );

  // 按钮是否可点击
  const disabled = useMemo(() => {
    return cardNumber && rcardNumber && selectChain && selectExchange ? false : true;
  }, [cardNumber, rcardNumber, selectChain, selectExchange]);

  // 选择币种
  const onChainPickerConfirm = (value: PickerValue[]) => {
    const id = value[0];
    const item = chainList.find((obj) => obj.chainCode === id);
    setSelectChain(item);

    setShowPickerType(null);
  };

  // 选择交易所
  const onExchangePickerConfirm = (value: PickerValue[]) => {
    const id = value[0];
    const item = exchangeList.find((obj) => obj.id === id);
    setSelectExchange(item);
    setShowPickerType(null);
  };

  // 提交
  const handleSubmit = async () => {
    if (!selectChain) {
      toast({ type: 'warning', description: '请选择币种' });
      return;
    }

    if (!selectExchange) {
      toast({ type: 'warning', description: '请选择交易所' });
      return;
    }

    if (cardNumber != rcardNumber) {
      toast({ type: 'warning', description: '账户地址输入不一致' });
      return;
    }

    if (selectExchange.isRiskControl) {
      toast({
        type: 'warning',
        description: '风控原因暂时无法使用该交易所，请您更换其它交易所钱包',
      });
      return;
    }

    const payload = {
      chainCode: selectChain.chainCode,
      cardNumber,
      remark,
      token,
      virtualTypeId: selectExchange.id,
    };

    try {
      setLoading(true);
      await addVirtualReq(payload);
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
          <div className={styles.list_title}>币种选择</div>
          <div className={styles.list_chose} onClick={() => setShowPickerType(PickerType.chain)}>
            <div className={styles.list_label}>
              {selectChain ? (
                <LazyImage src={selectChain.chainImage} width={24} height={24} />
              ) : null}
              <span className={!selectChain ? styles.placeholder : ''}>
                {selectChain?.chainName ?? '请选择币种'}
              </span>
            </div>

            <div className={styles.icon}>
              <Icon src="/images/common/arrow_down.svg" size={8} color="var(--Text-700)" />
            </div>
          </div>
        </div>

        <div className={styles.list_content}>
          <div className={styles.list_title}>钱包所属交易所</div>
          <div className={styles.list_chose} onClick={() => setShowPickerType(PickerType.exchange)}>
            <div className={styles.list_label}>
              {selectExchange && selectExchange.virtualTypeLogo ? (
                <LazyImage src={selectExchange.virtualTypeLogo} width={24} height={24} />
              ) : null}
              <span className={!selectExchange ? styles.placeholder : ''}>
                {selectExchange?.virtualTypeName ?? '请选择交易所'}
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
          placeholder="请输入账户地址"
          autoComplete="set-cardNumber"
          maxLength={42}
          allowClear
          allowPaste
        />

        <Input
          className={styles.input}
          value={rcardNumber}
          onChange={setRcardNumber}
          placeholder="请再次输入账户地址"
          autoComplete="set-rcardNumber"
          maxLength={42}
          allowClear
          allowPaste
        />

        <Input
          className={styles.textarea}
          type="textarea"
          value={remark}
          onChange={(value) => {
            const text = value.trim().replace(/^(.{30}).*/, '$1');
            setRemark(text);
          }}
          placeholder="请输入备注信息"
          autoComplete="set-remark"
          maxLength={30}
          showLimitWord
          rows={4}
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
          提交
        </Button>
      </div>

      {/* 选择币种 */}
      <PickerModal
        columns={chainOption}
        visible={showPickerType == PickerType.chain}
        onClose={() => {
          setShowPickerType(null);
        }}
        onConfirm={onChainPickerConfirm}
        value={selectChain ? [selectChain.chainCode] : []}
        title="请选择币种"
        cancelText="取消"
        confirmText="完成"
        renderLabel={renderPickerLabel}
      />

      {/* 选择交易所 */}
      <PickerModal
        columns={exchangeOption}
        visible={showPickerType == PickerType.exchange}
        onClose={() => {
          setShowPickerType(null);
        }}
        onConfirm={onExchangePickerConfirm}
        title="请选择钱包所属交易所"
        cancelText="取消"
        confirmText="完成"
        renderLabel={renderPickerLabel}
      />
    </div>
  );
};

export default AddVirtual;
