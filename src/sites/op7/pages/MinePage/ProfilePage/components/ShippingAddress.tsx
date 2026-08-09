import React, { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { PickerView } from 'antd-mobile';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { ArrowRightSvg } from '@/sites/op7/components/SvgIcons';
import Overlay from '@/common/components/Overlay';
import H5Header from '@/sites/op7/components/H5Header';
import Button from '@/common/components/Button';
import ModalHeader from '@/sites/op7/components/ModalHeader';
import { useRegionDataQuery } from '@/apis/origin/getRegionData';
import type { TRegionProvince, TRegionCity } from '@/apis/origin/getRegionData';
import { toast } from '@/common/components/Toast';
import { saveAddressThunk } from '@/core/store/thunks/userThunks';

const ShippingAddress: React.FC = () => {
  const dispatch = useAppDispatch();
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const addressMap = useAppSelector((state) => state.user.memberInfo.addressMap);
  const addressFetching = useAppSelector((state) => state.user.addressFetching);
  const [show, setShow] = useState(false);
  const [showProvincePicker, setShowProvincePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<TRegionProvince | null>(null);
  const [selectedCity, setSelectedCity] = useState<TRegionCity | null>(null);
  const [detail, setDetail] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const { data: regionData = [] } = useRegionDataQuery();

  useEffect(() => {
    if (!show || !addressMap || regionData.length === 0) return;
    const { province: provinceName, city: cityName, addressDetails, mailbox } = addressMap;
    const p = regionData.find((r) => r.name === provinceName);
    if (p) {
      setSelectedProvince(p);
      const c = p.cities.find((ci) => ci.name === cityName);
      if (c) setSelectedCity(c);
    }
    if (addressDetails) setDetail(addressDetails);
    if (mailbox) setPostalCode(mailbox);
  }, [show, addressMap, regionData]);

  const handleOpen = () => setShow(true);
  const handleClose = () => {
    if (addressFetching) {
      return;
    }
    setShow(false);
    setShowProvincePicker(false);
    setShowCityPicker(false);
    setSelectedProvince(null);
    setSelectedCity(null);
    setDetail('');
    setPostalCode('');
  };

  const onOpenProvincePicker = () => setShowProvincePicker(true);
  const onCloseProvincePicker = () => setShowProvincePicker(false);
  const onProvinceSelect = (p: TRegionProvince) => setSelectedProvince(p);
  const cityOptions = selectedProvince?.cities ?? [];

  const provinceColumns = useMemo(
    () => [[...regionData.map((p) => ({ label: p.name, value: p.id }))]],
    [regionData],
  );
  const cityColumns = useMemo(
    () => [[...(selectedProvince?.cities ?? []).map((c) => ({ label: c.name, value: c.id }))]],
    [selectedProvince?.cities],
  );
  const provinceValue = selectedProvince?.id ?? regionData[0]?.id ?? null;
  const cityValue = selectedCity?.id ?? cityOptions[0]?.id ?? null;

  const onProvinceConfirm = () => {
    if (provinceValue != null) {
      const p = regionData.find((r) => r.id === provinceValue);
      if (p) setSelectedProvince(p);
    }
    setSelectedCity(null);
    setShowProvincePicker(false);
  };

  const onOpenCityPicker = () => {
    if (!selectedProvince) {
      toast({ title: '请先选择省份', type: 'warning' });
      return;
    }
    setShowCityPicker(true);
  };
  const onCloseCityPicker = () => setShowCityPicker(false);
  const onCitySelect = (c: TRegionCity) => setSelectedCity(c);
  const onCityConfirm = () => {
    if (cityValue != null && cityOptions.length > 0) {
      const c = cityOptions.find((r) => r.id === cityValue);
      if (c) setSelectedCity(c);
    }
    setShowCityPicker(false);
  };

  const handleSubmit = () => {
    if (!selectedProvince) {
      toast({ title: '请选择省份', type: 'warning' });
      return;
    }
    if (!selectedCity) {
      toast({ title: '请选择城市', type: 'warning' });
      return;
    }
    if (!detail.trim()) {
      toast({ title: '请填写详细地址', type: 'warning' });
      return;
    }
    if (!postalCode.trim()) {
      toast({ title: '请填写邮政编码', type: 'warning' });
      return;
    }
    dispatch(
      saveAddressThunk({
        mailbox: postalCode,
        province: selectedProvince.name,
        city: selectedCity.name,
        addressDetails: detail,
      }),
    )
      .unwrap()
      .then(() => {
        toast({ title: '保存成功', type: 'success' });
        handleClose();
      });
  };

  return (
    <>
      <div
        className="flex items-center justify-between gap-12px px-12px py-14px lg:px-24px "
        onClick={handleOpen}
      >
        <div className="_tf[14] leading-[1.43] text-[var(--Text-Main-10)] text-nowrap">
          收货地址
        </div>
        <div className="flex items-center gap-4px overflow-hidden">
          <p className="_tf[14] leading-[1.43] text-[var(--Text-700)] truncate">
            {addressMap?.province ? (
              <span>{`${addressMap.province} ${addressMap.city} ${addressMap.addressDetails}`}</span>
            ) : (
              <span>请填写收货地址</span>
            )}
          </p>
          <ArrowRightSvg className="w-12px h-12px text-[var(--Text-700)]" />
        </div>
      </div>

      <Overlay
        show={show}
        position={isMobile ? 'bottom' : 'center'}
        close={handleClose}
        bodyClassname={clsx({
          'h-full bg-[var(--Background-700)] flex flex-col': isMobile,
          'h-auto w-450px bg-[var(--Background-300)] rounded-16px': !isMobile,
          'pointer-events-none': addressFetching,
        })}
      >
        <H5Header title="收货地址" onBack={handleClose} />
        <ModalHeader title="收货地址" onClose={handleClose} mobileHidden />

        <div className="p-12px flex flex-col gap-12px lg:p-24px lg:gap-24px">
          <div className="rounded-16px bg-[var(--Background-300)] overflow-hidden">
            {/* 省份 */}
            <div
              className="flex items-center justify-between px-12px py-14px shadow-[0_-0.5px_0_0_var(--Line-100)_inset]"
              onClick={onOpenProvincePicker}
            >
              <span className="_tf[14] leading-[1.43] text-[var(--Text-Main-10)]">省份</span>
              <div
                className={clsx(
                  'flex items-center gap-4px _tf[14] leading-[1.43]',
                  !!selectedProvince?.name
                    ? 'text-[var(--Text-Main-10)]'
                    : 'text-[var(--Text-700)]',
                )}
              >
                <span>{selectedProvince?.name ?? '请选择省份'}</span>
                <ArrowRightSvg className="w-12px h-12px" />
              </div>
            </div>

            {/* 城市 */}
            <div
              className="flex items-center justify-between px-12px py-14px shadow-[0_-0.5px_0_0_var(--Line-100)_inset]"
              onClick={onOpenCityPicker}
            >
              <span className="_tf[14] leading-[1.43] text-[var(--Text-Main-10)]">城市</span>
              <div
                className={clsx(
                  'flex items-center gap-4px _tf[14] leading-[1.43]',
                  !!selectedCity?.name ? 'text-[var(--Text-Main-10)]' : 'text-[var(--Text-700)]',
                )}
              >
                <span>{selectedCity?.name ?? '请选择城市'}</span>
                <ArrowRightSvg className="w-12px h-12px" />
              </div>
            </div>

            {/* 详细地址 */}
            <div className="flex items-center justify-between px-12px py-14px shadow-[0_-0.5px_0_0_var(--Line-100)_inset]">
              <span className="_tf[14] leading-[1.43] text-[var(--Text-Main-10)]">详细地址</span>
              <input
                type="text"
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="请填写真实地址，用于接受活动所送礼物"
                className={clsx(
                  'flex-1 ml-12px text-right bg-transparent outline-none border-none',
                  '_tf[14] leading-[1.43] text-[var(--Text-Main-10)] placeholder:text-[var(--Text-700)]',
                  'caret-[var(--ThemeColor-Main)]',
                )}
              />
            </div>

            {/* 邮编 */}
            <div className="flex items-center justify-between px-12px py-14px">
              <span className="_tf[14] leading-[1.43] text-[var(--Text-Main-10)]">邮编</span>
              <input
                type="text"
                maxLength={6}
                inputMode="numeric"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
                placeholder="请填写邮政编码"
                className={clsx(
                  'flex-1 ml-12px text-right bg-transparent outline-none border-none',
                  '_tf[14] leading-[1.43] text-[var(--Text-Main-10)] placeholder:text-[var(--Text-700)]',
                  'caret-[var(--ThemeColor-Main)]',
                )}
              />
            </div>
          </div>

          <Button
            type="primary"
            className="w-full"
            onClick={handleSubmit}
            loading={addressFetching}
          >
            提交
          </Button>
        </div>
      </Overlay>

      {/* 省份选择器：参考 Birthday 的 Overlay + ModalHeader + 内容区 */}
      <Overlay
        show={showProvincePicker}
        position={isMobile ? 'bottom' : 'center'}
        close={onCloseProvincePicker}
        bodyClassname={clsx('flex flex-col', {
          'h-[50%] bg-[var(--Background-400)] rounded-t-16px': isMobile,
          'w-450px h-400px bg-[var(--Background-300)] rounded-16px': !isMobile,
        })}
      >
        <ModalHeader
          title="请选择省份"
          onClose={onCloseProvincePicker}
          left={
            <button
              type="button"
              className="_tf[14] leading-[1.43] text-[var(--Text-800)]"
              onClick={onCloseProvincePicker}
            >
              取消
            </button>
          }
          right={
            <button
              type="button"
              className="_tf[14] leading-[1.43] text-[var(--ThemeColor-Main)]"
              onClick={onProvinceConfirm}
            >
              完成
            </button>
          }
        />
        <div className="flex-1 flex flex-col pt-8px px-12px pb-20px">
          <PickerView
            columns={provinceColumns}
            value={provinceValue != null ? [provinceValue] : undefined}
            onChange={(val) => {
              const id = val[0] as number;
              const p = regionData.find((r) => r.id === id);
              if (p) onProvinceSelect(p);
            }}
            className="op7-picker-view flex-1 rounded-12px"
            mouseWheel
          />
        </div>
      </Overlay>

      {/* 城市选择器 */}
      <Overlay
        show={showCityPicker}
        position={isMobile ? 'bottom' : 'center'}
        close={onCloseCityPicker}
        bodyClassname={clsx('flex flex-col', {
          'h-[50%] bg-[var(--Background-400)] rounded-t-16px': isMobile,
          'w-450px h-400px bg-[var(--Background-300)] rounded-16px': !isMobile,
        })}
      >
        <ModalHeader
          title="请选择城市"
          onClose={onCloseCityPicker}
          left={
            <button
              type="button"
              className="_tf[14] leading-[1.43] text-[var(--Text-800)]"
              onClick={onCloseCityPicker}
            >
              取消
            </button>
          }
          right={
            <button
              type="button"
              className="_tf[14] leading-[1.43] text-[var(--ThemeColor-Main)]"
              onClick={onCityConfirm}
            >
              完成
            </button>
          }
        />
        <div className="flex-1 flex flex-col pt-8px px-12px pb-20px">
          <PickerView
            columns={cityColumns}
            value={cityValue != null ? [cityValue] : undefined}
            onChange={(val) => {
              const id = val[0] as number;
              const c = cityOptions.find((r) => r.id === id);
              if (c) onCitySelect(c);
            }}
            className="op7-picker-view flex-1 rounded-12px"
          />
        </div>
      </Overlay>
    </>
  );
};

export default ShippingAddress;
