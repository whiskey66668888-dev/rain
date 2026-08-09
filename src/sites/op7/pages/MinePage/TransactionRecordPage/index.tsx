import React, { useMemo, useState } from 'react';
import H5Header from '@/sites/op7/components/H5Header';
import {
  ETransRecordType,
  transRecordTypeList,
  transRecordTypeMap,
} from '@/apis/commonSports/constants';
import DateRangePicker from '@/common/components/DateRangePicker';
import { t } from 'i18next';
import clsx from 'clsx';
import { ArrowLeftSvg } from '@/sites/op7/components/SvgIcons';
import Overlay from '@/common/components/Overlay';
import { useAppSelector } from '@/core/store/hooks';
import ModalHeader from '@/sites/op7/components/ModalHeader';
import CheckBox from '@/common/components/CheckBox';
import PickerModal from '@/sites/op7/components/PickerModal';
import { PickerColumnItem, PickerValue } from 'antd-mobile/es/components/picker-view';
import { useSearchParams } from 'react-router-dom';
import { DepositRecord } from './components/DepositRecord';
import { WithdrawRecord } from './components/WithdrawRecord';
import { TransferRecord } from './components/TransferRecord';
import { BonusRecord } from './components/BonusRecord';
import { MemberTransferWithdraw } from './components/MemberTransferWithdrawRecord';
import { WithdrawDetailModal } from './components/WithdrawDetailModal';
import { DepositDetailModal } from './components/DepositDetailModal';
import { BonusDetailModal } from './components/BonusDetailModal';
import { TransferRecordDetailModal } from './components/TransferRecordDetailModal';
import { MemberTransferWithdrawDetailModal } from './components/MemberTransferWithdrawRecordDetailModal';
import { TDateRange } from '@/utils/dateHelper';
import { todayRange } from '@/utils/dateHelper';
import { useOpenCustomerService } from '@/sites/op7/hooks/useOpenCustomerService';
import { getSystemTheme } from '@/utils';

/**
 * 交易记录（三级路由）
 */
const TransactionRecordPage: React.FC = () => {
  const openCustomerService = useOpenCustomerService();
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const theme = themeMode === 'system' ? getSystemTheme() : themeMode;
  const [searchParams, setSearchParams] = useSearchParams();
  const [transRecordType, setTransRecordType] = useState<ETransRecordType>(
    (searchParams.get('type') as ETransRecordType) || ETransRecordType.Deposit,
  );
  const [dateRange, setDateRange] = useState<TDateRange>(todayRange());
  const [showTypeOverlay, setShowTypeOverlay] = useState(false);
  const [showPickerType, setShowPickerType] = useState<boolean>(false);
  const [simplePickerData, setSimplePickerData] = useState<PickerColumnItem[]>([
    { label: '全部', value: '' },
  ]);
  const [currentPickerType, setCurrentPickerType] = useState<PickerValue>('');
  const [totalInfo, setTotalInfo] = useState({ totalAmount: 0, totalSize: 0 });

  /** 统一管理各类详情弹窗：{ type, orderId }，为空则不显示 */
  const [detailModal, setDetailModal] = useState<{
    type: ETransRecordType;
    orderId: string;
  } | null>(null);
  const openDetail = (type: ETransRecordType, orderId: string) => setDetailModal({ type, orderId });
  const closeDetail = () => setDetailModal(null);

  const onChangeDate = (dateRange: TDateRange) => {
    setDateRange(dateRange);
  };

  const handleTransRecordTypeChange = (type: ETransRecordType) => {
    setTransRecordType(type);
    setSearchParams({ type }, { replace: true });
    setShowTypeOverlay(false);
    setCurrentPickerType('');
    setSimplePickerData([{ label: '全部', value: '' }]);
  };
  const renderPickerLabel = (item: PickerColumnItem) => {
    return <div className="flex flex-1 items-center justify-center">{item.label}</div>;
  };
  const currentPickerLabel = useMemo(
    () =>
      simplePickerData.find((item) => item.value === currentPickerType)?.label ??
      simplePickerData[0]?.label ??
      '全部',
    [currentPickerType, simplePickerData],
  );
  console.log('currentPickerLabel', currentPickerLabel);
  const onConfirm = (value: PickerValue[]) => {
    console.log('onConfirm', value);
    setCurrentPickerType(value[0] ?? '');
  };
  return (
    <>
      <H5Header
        title="交易记录"
        right={
          <button type="button" aria-label="专属客服" onClick={openCustomerService}>
            <img
              src={`/images/${theme}/mine/mine_top_kf.png`}
              alt=""
              className="h-20px w-20px object-contain"
            />
          </button>
        }
      />
      <div className="flex-1 flex flex-col gap-12px overflow-hidden  lg:p-0">
        <div
          className={clsx(
            'shrink-0 flex items-center gap-12px bg-[var(--Background-300)] p-[6px_12px_6px_12px]',
            'lg:w-full',
          )}
        >
          <div
            className={clsx(
              'flex flex-1 min-w-0 items-center gap-8px',
              'bg-[var(--Background-700)] rounded-full p-2px',
            )}
          >
            {transRecordTypeList.map((key) => {
              const active = key === transRecordType;
              return (
                <button
                  key={key}
                  type="button"
                  className={clsx(
                    'h-32px flex-1 min-w-0 px-12px rounded-full',
                    'flex items-center justify-center',
                    active && 'bg-[var(--ThemeColor-Main)]',
                  )}
                  onClick={() => handleTransRecordTypeChange(key)}
                >
                  <span
                    className={clsx(
                      '_tf[12] font-500 leading-[1.66] whitespace-nowrap',
                      active ? 'text-[var(--White-100)]' : 'text-[var(--Text-800)]',
                    )}
                  >
                    {transRecordTypeMap[key]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between px-12px ">
          <div className="flex items-center gap-20px">
            <div>
              <DateRangePicker
                value={dateRange}
                onChange={onChangeDate}
                className={clsx(
                  'flex-1 flex gap-4px items-center justify-center',
                  'lg:w-full lg:min-w-0',
                )}
              >
                {(label, open) => (
                  <>
                    <div className="_tf[12] font-500 leading-[1.66] text-[var(--Text-Main-10)]">
                      {t(label)}
                    </div>
                    <ArrowLeftSvg
                      className={clsx(
                        'w-10px h-10px text-[var(--Text-Main-10)]',
                        'transition-transform duration-200',
                        open ? 'rotate-90' : 'rotate-270',
                      )}
                    />
                  </>
                )}
              </DateRangePicker>
            </div>
            <div
              className="flex items-center gap-4px"
              onClick={() => setShowPickerType((show) => !show)}
            >
              <span className="_tf[12] font-500 leading-[1.66] text-[var(--Text-Main-10)]">
                {currentPickerLabel}
              </span>
              <ArrowLeftSvg
                className={clsx(
                  'w-10px h-10px text-[var(--Text-Main-10)]',
                  'transition-transform duration-200',
                  showPickerType ? 'rotate-90' : 'rotate-270',
                )}
              />
            </div>
          </div>

          <div className="flex items-center gap-20px">
            <div className="flex items-center gap-4px">
              <div className="color-[var(--Text-800)] _tf[12]">笔数</div>
              <div className=" color-[var(--Text-Main-10)] _tf[14] din-pro">
                {totalInfo.totalSize}
              </div>
            </div>
            <div className="flex items-center gap-4px">
              <div className="color-[var(--Text-800)] _tf[12]">总金额</div>
              <div className=" color-[var(--Text-Main-10)] _tf[14] din-pro">
                {totalInfo.totalAmount}
              </div>
            </div>
          </div>
        </div>
        <div className={clsx('flex-1-col-hidden')}>
          <div className="flex-1 flex flex-col overflow-y-auto lg:overflow-initial">
            {transRecordType === ETransRecordType.Deposit && (
              <DepositRecord
                dateRange={dateRange}
                setSimplePickerData={setSimplePickerData}
                currentPickerType={currentPickerType}
                setTotalInfo={setTotalInfo}
                onItemClick={(orderId) => openDetail(ETransRecordType.Deposit, orderId)}
              />
            )}
            {transRecordType === ETransRecordType.Withdraw && (
              <WithdrawRecord
                dateRange={dateRange}
                setSimplePickerData={setSimplePickerData}
                currentPickerType={currentPickerType}
                setTotalInfo={setTotalInfo}
                onItemClick={(orderId) => openDetail(ETransRecordType.Withdraw, orderId)}
              />
            )}
            {transRecordType === ETransRecordType.MemberTransferWithdraw && (
              <MemberTransferWithdraw
                dateRange={dateRange}
                setSimplePickerData={setSimplePickerData}
                currentPickerType={currentPickerType}
                setTotalInfo={setTotalInfo}
                onItemClick={(orderId) =>
                  openDetail(ETransRecordType.MemberTransferWithdraw, orderId)
                }
              />
            )}
            {transRecordType === ETransRecordType.Transfer && (
              <TransferRecord
                dateRange={dateRange}
                setSimplePickerData={setSimplePickerData}
                currentPickerType={currentPickerType}
                setTotalInfo={setTotalInfo}
                onItemClick={(orderId) => openDetail(ETransRecordType.Transfer, orderId)}
              />
            )}
            {transRecordType === ETransRecordType.Bonus && (
              <BonusRecord
                dateRange={dateRange}
                setSimplePickerData={setSimplePickerData}
                currentPickerType={currentPickerType}
                setTotalInfo={setTotalInfo}
                onItemClick={(orderId) => openDetail(ETransRecordType.Bonus, orderId)}
              />
            )}
          </div>
        </div>
      </div>
      <PickerModal
        columns={[simplePickerData]}
        visible={showPickerType}
        onClose={() => setShowPickerType(false)}
        onConfirm={onConfirm}
        title="充值状态"
        cancelText="取消"
        confirmText="确认"
        renderLabel={renderPickerLabel}
      />

      <Overlay
        show={showTypeOverlay && isMobile}
        close={() => setShowTypeOverlay(false)}
        position={isMobile ? 'bottom' : 'center'}
        bodyClassname={clsx(
          'flex flex-col gap-8px overflow-hidden bg-[var(--Background-400)]',
          isMobile ? 'rounded-t-10px safe-b' : 'rounded-12px w-300px',
        )}
        bodyStyle={{
          maxHeight: '50%',
        }}
      >
        <ModalHeader title="选择类型" onClose={() => setShowTypeOverlay(false)} />
        <div className={clsx('px-12px pb-20px flex-1-col-hidden')}>
          <div className={clsx('bg-[var(--Background-300)] rounded-12px flex-1 overflow-y-auto')}>
            {transRecordTypeList.map((key) => {
              return (
                <button
                  key={key}
                  type="button"
                  className={clsx('w-full flex items-center justify-between p-12px')}
                  onClick={() => {
                    handleTransRecordTypeChange(key);
                  }}
                >
                  <span className="_tf[14] font-600 leading-[1.43]">{transRecordTypeMap[key]}</span>
                  <CheckBox value={transRecordType === key} />
                </button>
              );
            })}
          </div>
        </div>
      </Overlay>
      <DepositDetailModal
        orderId={detailModal?.type === ETransRecordType.Deposit ? detailModal.orderId : ''}
        onClose={closeDetail}
      />
      <WithdrawDetailModal
        orderId={detailModal?.type === ETransRecordType.Withdraw ? detailModal.orderId : ''}
        onClose={closeDetail}
      />

      <MemberTransferWithdrawDetailModal
        orderId={
          detailModal?.type === ETransRecordType.MemberTransferWithdraw ? detailModal.orderId : ''
        }
        onClose={closeDetail}
      />
      <TransferRecordDetailModal
        orderId={detailModal?.type === ETransRecordType.Transfer ? detailModal.orderId : ''}
        onClose={closeDetail}
      />
      <BonusDetailModal
        orderId={detailModal?.type === ETransRecordType.Bonus ? detailModal.orderId : ''}
        onClose={closeDetail}
      />
    </>
  );
};

export default TransactionRecordPage;
