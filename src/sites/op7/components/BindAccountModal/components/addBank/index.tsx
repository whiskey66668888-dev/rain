import React, { useMemo, useState } from 'react';
import clsx from 'clsx';
// components
import LazyImage from '@/common/components/LazyImage';
import Icon from '@/common/components/Icon';
import Button from '@/common/components/Button';
import Input from '../input';
import PickerModal from '../../../PickerModal';
import { toast } from '@/common/components/Toast';
import { PickerColumnItem, PickerValue } from 'antd-mobile/es/components/picker-view';

// hooks
import { useAppSelector } from '@/core/store/hooks';
import {
  useSysbankListQuery,
  SysBankItem,
  addOtherBankAccountReq,
  addBankReq,
} from '@/apis/origin/bank';
import { useRegionDataQuery } from '@/apis/origin/getRegionData';
import type { TRegionProvince, TRegionCity } from '@/apis/origin/getRegionData';

// styles
import styles from './index.module.scss';

interface AddBankProps {
  token?: string;
  onClose: (refresh?: boolean) => void;
}

enum PickerType {
  bank,
  province,
  city,
}

const AddBank: React.FC<AddBankProps> = ({ token, onClose }) => {
  // 非本人姓名
  const [userName, setUserName] = useState('');
  // 选中银行
  const [selectBank, setSelectBank] = useState<SysBankItem | null>();
  // 选中省份
  const [selectProvince, setSelectProvince] = useState<TRegionProvince | null>();
  // 选中市
  const [selectCity, setSelectCity] = useState<TRegionCity | null>();
  // 开户地址
  const [bankAddress, setBankAddress] = useState('');
  // 银行卡号
  const [cardNumber, setCardNumber] = useState('');
  // 确认卡号
  const [rcardNumber, setRcardNumber] = useState('');
  // 显示筛选器
  const [showPickerType, setShowPickerType] = useState<PickerType | null>(null);
  // loading
  const [loading, setLoading] = useState(false);
  // 用户信息
  const { realName } = useAppSelector((state) => state.user.memberInfo);
  // 银行列表
  const { data: sysBankList = [] } = useSysbankListQuery();
  // 省份城市
  const { data: regionData = [] } = useRegionDataQuery();

  // 银行Picker数据
  const sysBankOption = useMemo(() => {
    return [sysBankList.map((obj) => ({ label: obj.bankName, value: obj.sysBankId }))];
  }, [sysBankList]);

  // 省份Picker数据
  const provinceOption = useMemo(
    () => [regionData.map((obj) => ({ label: obj.name, value: obj.id }))],
    [regionData],
  );

  // 城市Picker数据
  const cityOption = useMemo(
    () => [(selectProvince?.cities ?? []).map((c) => ({ label: c.name, value: c.id }))],
    [selectProvince?.cities],
  );

  // 按钮是否可点击
  const disabled = useMemo(() => {
    return bankAddress && cardNumber && rcardNumber && selectProvince && selectCity && selectBank
      ? false
      : true;
  }, [bankAddress, cardNumber, rcardNumber, selectProvince, selectCity, selectBank]);

  // 是否添加非本人银行卡
  const isAddOtherCard = useMemo(() => {
    return token ? true : false;
  }, [token]);

  // 选择银行
  const onBankPickerConfirm = (value: PickerValue[]) => {
    const id = value[0];
    const list = sysBankList ?? [];
    const item = list.find((obj) => obj.sysBankId === id);
    setSelectBank(item);

    setShowPickerType(null);
  };

  // 选择省份
  const onProvinceConfirm = (value: PickerValue[]) => {
    const id = value[0];
    const list = regionData ?? [];
    const item = list.find((obj) => obj.id === id);
    setSelectProvince(item);
    setShowPickerType(null);
  };

  // 选择城市
  const onCityConfirm = (value: PickerValue[]) => {
    const id = value[0];
    const list = selectProvince?.cities ?? [];
    const item = list.find((obj) => obj.id === id);
    setSelectCity(item);
    setShowPickerType(null);
  };

  // 提交
  const handleSubmit = async () => {
    if (!selectBank) {
      toast({ type: 'warning', description: '请选择银行' });
      return;
    }

    if (!selectProvince) {
      toast({ type: 'warning', description: '请选择省份' });
      return;
    }

    if (!selectCity) {
      toast({ type: 'warning', description: '请选择城市' });
      return;
    }

    const reg = new RegExp('^[0-9]*[1-9][0-9]*$');
    if (!reg.test(cardNumber) || cardNumber.length < 12) {
      toast({ type: 'warning', description: '请检查银行卡号是否有误' });
      return;
    }

    if (cardNumber != rcardNumber) {
      toast({ type: 'warning', description: '两次输入的银行卡号不相同' });
      return;
    }

    const payload = {
      realName: realName || '',
      province: selectProvince.name,
      city: selectCity.name,
      cardNumber: cardNumber,
      rcardNumber: rcardNumber,
      bankAddress: bankAddress,
      sysBankId: selectBank.sysBankId,
      cardRealName: '',
      token: '',
    };

    let action = addBankReq;
    if (isAddOtherCard) {
      payload['cardRealName'] = userName;
      payload['token'] = token ?? '';
      action = addOtherBankAccountReq;
    }

    try {
      setLoading(true);
      await action(payload);
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
      {isAddOtherCard ? null : (
        <div className={styles.info_tip}>
          <LazyImage
            className={styles.icon}
            src="/images/common/toast/warn_y.svg"
            width={16}
            height={16}
            alt="icon"
          />
          <span>注：为了您的资金能够迅速到账，请确认姓名与银行卡的开户姓名一致。</span>
        </div>
      )}

      <div className={styles.addBox}>
        <div className={styles.form}>
          <span className={styles.left}>{isAddOtherCard ? '开户姓名' : '姓名'}</span>
          {isAddOtherCard ? (
            <Input
              className={styles.right}
              value={userName}
              placeholder="请输入开户姓名"
              onChange={(v) => setUserName(v)}
              allowClear
            />
          ) : (
            <span className={clsx(styles.right, styles.placeholder)}>{realName}</span>
          )}
        </div>
        <div
          className={clsx(styles.form, 'cursor-pointer')}
          onClick={() => setShowPickerType(PickerType.bank)}
        >
          <span className={styles.left}>所属银行</span>
          <div className={styles.right}>
            {selectBank && (
              <LazyImage
                className={styles.logo}
                src={selectBank.bankImage}
                width={16}
                height={16}
                alt={'logo'}
              />
            )}
            <div className={clsx(styles.text, selectBank ? '' : styles.placeholder)}>
              {selectBank?.bankName ?? '请选择开户银行'}
            </div>
            <Icon src="/images/common/single_arrow.svg" size={16} color="var(--Text-700)" />
          </div>
        </div>

        <div
          className={clsx(styles.form, 'cursor-pointer')}
          onClick={() => setShowPickerType(PickerType.province)}
        >
          <span className={styles.left}>开户省份</span>
          <div className={styles.right}>
            <div className={clsx(styles.text, selectProvince ? '' : styles.placeholder)}>
              {selectProvince?.name ?? '请选择省份'}
            </div>
            <Icon src="/images/common/single_arrow.svg" size={16} color="var(--Text-700)" />
          </div>
        </div>

        <div
          className={clsx(styles.form, 'cursor-pointer')}
          onClick={() => setShowPickerType(PickerType.city)}
        >
          <span className={styles.left}>开户城市</span>
          <div className={styles.right}>
            <div className={clsx(styles.text, !selectCity ? styles.placeholder : null)}>
              {selectCity?.name ?? '请选择城市'}
            </div>
            <Icon src="/images/common/single_arrow.svg" size={16} color="var(--Text-700)" />
          </div>
        </div>

        <div className={styles.form}>
          <span className={styles.label}>开户支行</span>
          <Input
            className={styles.input}
            value={bankAddress}
            placeholder="请输入开户支行"
            autoComplete="set-bankAddress"
            onChange={(v) => setBankAddress(v)}
            allowClear
          />
        </div>

        <div className={styles.form}>
          <span className={styles.label}>银行卡号</span>
          <Input
            className={styles.input}
            value={cardNumber}
            placeholder="请输入银行卡号"
            autoComplete="set-card"
            onChange={(value) => {
              const onlyNums = value.replace(/\D/g, '');
              setCardNumber(onlyNums);
            }}
            maxLength={42}
            allowClear
          />
        </div>
        <div className={styles.form}>
          <span className={styles.label}>确认卡号</span>
          <Input
            className={styles.input}
            value={rcardNumber}
            placeholder="请再次输入银行卡号"
            autoComplete="set-rcard"
            onChange={(value) => {
              const onlyNums = value.replace(/\D/g, '');
              setRcardNumber(onlyNums);
            }}
            maxLength={42}
            allowClear
          />
        </div>
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

      {/* 选择银行 */}
      <PickerModal
        columns={sysBankOption}
        visible={showPickerType == PickerType.bank}
        onClose={() => setShowPickerType(null)}
        onConfirm={onBankPickerConfirm}
        title="请选择银行"
        cancelText="取消"
        confirmText="完成"
        renderLabel={renderPickerLabel}
      />

      {/* 选择省份 */}
      <PickerModal
        columns={provinceOption}
        visible={showPickerType == PickerType.province}
        onClose={() => setShowPickerType(null)}
        onConfirm={onProvinceConfirm}
        title="请选择省份"
        cancelText="取消"
        confirmText="完成"
        renderLabel={renderPickerLabel}
      />

      {/* 选择城市 */}
      <PickerModal
        columns={cityOption}
        visible={showPickerType == PickerType.city}
        onClose={() => setShowPickerType(null)}
        onConfirm={onCityConfirm}
        title="请选择城市"
        cancelText="取消"
        confirmText="完成"
        renderLabel={renderPickerLabel}
      />
    </div>
  );
};

export default AddBank;
