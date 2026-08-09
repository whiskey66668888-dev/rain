import { useWithdrawDetailQuery } from '@/apis/origin/transactionRecord/withdrawDetail';
import Overlay from '@/common/components/Overlay';
import { useAppSelector } from '@/core/store/hooks';
import CopyButton from '@/sites/op7/components/CopyButton';
import Skeleton from '@/common/components/Skeleton';
import clsx from 'clsx';
import style from './WithdrawDetailModal.module.scss';
import LazyImage from '@/common/components/LazyImage';
import H5Header from '@/sites/op7/components/H5Header';
import { getSystemTheme } from '@/utils';
import Modal from '@/common/components/Modal';
import { useWithdrawCancelMutation } from '@/apis/origin/transactionRecord/cancel';
import { toast } from '@/common/components/Toast';
import { useOpenCustomerService } from '@/sites/op7/hooks/useOpenCustomerService';
import { useState } from 'react';
import Button from '@/common/components/Button';
import { TradeMainStatus } from '@/apis/commonSports/constants';
import { WithdrawAmountBlock } from './WithdrawAmountBlock';
import { WithdrawProgressTimeline } from './WithdrawProgressTimeline';

interface IProps {
  orderId: string;
  onClose: () => void;
}

/* ─── 通用信息行 ─── */
interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  suffix?: React.ReactNode;
}
const InfoRow = ({ label, value, mono, suffix }: InfoRowProps) => (
  <div className={style.row}>
    <span className={style.rowLabel}>{label}</span>
    <span className={clsx(style.rowValue, mono && style.rowValueMono)}>
      {value}
      {suffix}
    </span>
  </div>
);

/* ─── 主组件 ─── */
export const WithdrawDetailModal = ({ orderId, onClose }: IProps) => {
  const openCustomerService = useOpenCustomerService();
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const theme = themeMode === 'system' ? getSystemTheme() : themeMode;
  const { data, isLoading, refetch } = useWithdrawDetailQuery({ orderId: orderId ?? '' });
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { mutate: cancelWithdraw, isPending: cancelLoading } = useWithdrawCancelMutation({
    onSuccess: (info) => {
      if (info) toast({ description: info, type: 'success' });
      setShowCancelModal(false);
      void refetch();
    },
  });
  const cancelAction = () => {
    cancelWithdraw({ orderId });
  };

  console.log(data?.recipientNonSelf, 'recipientNonSelf');
  return (
    <Overlay
      show={!!orderId}
      close={onClose}
      position={isMobile ? 'bottom' : 'center'}
      bodyClassname={style.body}
    >
      <H5Header
        title="提现详情"
        onBack={onClose}
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

      {/* 取消提现确认弹窗（声明式，cancelLoading 能正确响应） */}
      <Modal
        show={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="取消提现"
        showCloseButton={false}
        confirmText="确认"
        confirmLoading={cancelLoading}
        onConfirm={cancelAction}
        maskClickClose={false}
        footer={
          <div className="flex gap-12px w-full">
            <Button
              type="second"
              className="flex-1"
              onClick={() => {
                setShowCancelModal(false);
              }}
            >
              取消
            </Button>
            <Button
              className="flex-1"
              type="primary"
              loading={cancelLoading}
              onClick={() => {
                cancelAction();
              }}
            >
              确认
            </Button>
          </div>
        }
      >
        <p className="_tf[14] leading-[1.43] text-[var(--Text-800)] mt-12px text-center">
          取消提现订单后，
          <br />
          提现金额将原路返回！
        </p>
      </Modal>
      {isLoading || !data ? (
        <div className="flex-1 flex flex-col gap-12px p-12px">
          {[...Array(6).keys()].map((i) => (
            <Skeleton key={i} type="base" baseClassName="h-40px" />
          ))}
        </div>
      ) : (
        <div className={style.scroll}>
          {/* 金额 + 状态 */}
          <WithdrawAmountBlock
            cash={data.cash}
            tradeMainStatus={data.tradeMainStatus}
            tradeMainStatusName={data.tradeMainStatusName}
            statusText={
              data.tradeMainStatus === TradeMainStatus.COMPLETED
                ? '提现成功，资金已到账。'
                : data.tradeMainStatus === TradeMainStatus.CANCELLED
                  ? '提现已取消，资金已退回账户。'
                  : data.tradeMainStatus === TradeMainStatus.REJECTED
                    ? `提现申请未通过审核，原因：${data.statusDesc ?? ''}。`
                    : undefined
            }
            showHelp={data.tradeMainStatus === TradeMainStatus.REJECTED}
          />

          {/* 进度时间线 */}
          {data.showProgressTimeline && !!data.progressNodes?.length && (
            <WithdrawProgressTimeline
              nodes={data.progressNodes}
              showCancel={data.canCancelWithdraw}
              onCancelClick={() => setShowCancelModal(true)}
            />
          )}
          <div className="flex flex-col gap-12px">
            {/* 订单信息 */}
            <div className={style.card}>
              {data.transactionType && <InfoRow label="交易类型" value={data.transactionType} />}
              <InfoRow
                label="订单号"
                value={data.orderId}
                mono
                suffix={
                  <CopyButton text={data.orderId}>
                    <div className="w-14px h-14px">
                      <LazyImage src={`/images/${theme}/transactionRecord/copy.png`} alt="Copy" />
                    </div>
                  </CopyButton>
                }
              />
              <InfoRow label="创建时间" value={data.createTime ?? data.addTime} mono />
              <InfoRow label="提现金额" value={`¥ ${data.cash?.toFixed(2)}`} mono />
              {/* <InfoRow label="手续费" value={`¥ ${(data.feeAmount ?? 0).toFixed(2)}`} mono /> */}
              <InfoRow label="到账金额" value={`¥ ${data.arrivalAmount}`} mono />
              <InfoRow
                label="账户余额"
                value={`¥ ${(data.accountBalance ?? data.afterCash)?.toFixed(2)}`}
                mono
              />
              <InfoRow
                label="提现方式"
                value={
                  <div className="flex items-center gap-4px">
                    {data.withdrawMethod?.logoUrl && (
                      <LazyImage
                        src={data.withdrawMethod.logoUrl}
                        className="h-15px w-auto"
                        imageClassName="h-15px w-auto object-contain"
                      />
                    )}
                    <div>{data?.withdrawMethod?.name}</div>
                  </div>
                }
                mono
              />
            </div>

            {/* 收款信息 */}

            <div className={style.card}>
              {(data.cashType === 'CNY' || data.cashType === 'ZFB') && (
                <>
                  <InfoRow
                    label="收款人"
                    value={
                      <div className="flex align-center gap-4px">
                        {data?.recipientNonSelf && (
                          <div className="bg-[var(--ThemeColor-Main)] flex items-center justify-center  h-16px px-4px color-[var(--White-100)] _tf[10] rounded-[4px]">
                            非本人
                          </div>
                        )}
                        <div>{data.recipientNameMasked}</div>
                      </div>
                    }
                  />
                  <InfoRow
                    label="收款地址"
                    value={
                      <div className="flex items-center gap-4px">
                        {data.recipientAddressLogoUrl && (
                          <LazyImage
                            src={data.recipientAddressLogoUrl}
                            className="h-15px w-auto"
                            imageClassName="h-15px w-auto object-contain"
                          />
                        )}

                        <div>{data.recipientAddressMasked}</div>
                      </div>
                    }
                    mono
                  />
                </>
              )}
              {data.cashType === 'DIGITAL' && (
                <>
                  <InfoRow
                    label="收款地址"
                    value={
                      <div className="flex items-center gap-4px">
                        {data.withdrawMethod?.logoUrl && (
                          <LazyImage
                            src={data.withdrawMethod.logoUrl}
                            className="h-15px w-auto"
                            imageClassName="h-15px w-auto object-contain"
                          />
                        )}

                        <div>{data.recipientAddressMasked}</div>
                      </div>
                    }
                    mono
                  />
                </>
              )}
              {data.cashType === 'USDT' && (
                <>
                  <InfoRow label="提现汇率" value={data.withdrawExchangeRate} mono />
                  <InfoRow label="到账数量" value={`${data.virtualNum} USDT`} mono />
                  <InfoRow
                    label="提现地址"
                    value={
                      <div className="flex items-center gap-4px">
                        {data.withdrawMethod?.logoUrl && (
                          <LazyImage
                            src={data.withdrawMethod.logoUrl}
                            className="h-15px w-auto"
                            imageClassName="h-15px w-auto object-contain"
                          />
                        )}

                        <div>{data.recipientAddressMasked}</div>
                      </div>
                    }
                    mono
                  />
                  <InfoRow label="提现网络" value={data.withdrawVirtualNetwork} mono />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Overlay>
  );
};
