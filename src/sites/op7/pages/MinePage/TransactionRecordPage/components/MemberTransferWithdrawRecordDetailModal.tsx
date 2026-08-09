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
import {
  TMemberTransferDetailData,
  useMemberTransferDetailQuery,
} from '@/apis/origin/transactionRecord/memberTransferWithdrawDetail';
import { DEFAULT_AVATAR } from '@/sites/op7/pages/MinePage/ProfilePage/components/AvatarUpdate';
import { resolveEmcAvatarSrc } from '@/common/utils/emcAvatar';

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

const isTippingTransaction = (transactionType?: string) =>
  Boolean(transactionType?.includes('打赏'));

const getAccountAvatarUrl = (
  perspective: 'IN' | 'OUT' | undefined,
  data: TMemberTransferDetailData,
) => (perspective === 'OUT' ? data.transferInAvatarUrl : data.transferOutAvatarUrl);

const AccountInfoRow = ({
  label,
  account,
  avatarUrl,
}: {
  label: string;
  account?: string;
  avatarUrl?: string;
}) => {
  const avatar = resolveEmcAvatarSrc(avatarUrl);

  return (
    <InfoRow
      label={label}
      value={
        <div className="flex items-center gap-4px">
          <LazyImage
            src={avatar}
            alt="avatar"
            lazy={false}
            fallback={DEFAULT_AVATAR}
            className="w-16px h-16px shrink-0 rounded-full overflow-hidden"
            imageClassName="object-cover w-full h-full"
          />
          <span data-avatar={avatar}>{account}</span>
        </div>
      }
    />
  );
};

const getCompletedStatusText = (perspective: 'IN' | 'OUT' | undefined) =>
  perspective === 'IN' ? '会员互转成功，已成功发放至中心钱包！' : '互转成功，资金已到账。';

interface DetailContentProps {
  data: TMemberTransferDetailData;
  theme: string | undefined;
  onCancelClick: () => void;
}

const MemberTransferDetailContent = ({ data, theme, onCancelClick }: DetailContentProps) => {
  const isTipping = isTippingTransaction(data.transactionType);
  const perspective = data.transferPerspective;
  const accountAvatarUrl = getAccountAvatarUrl(perspective, data);
  const balance = (data.accountBalance ?? data.afterCash)?.toFixed(2);
  const cashFormatted = `¥ ${data.cash?.toFixed(2)}`;

  return (
    <div className={style.scroll}>
      <WithdrawAmountBlock
        cashPrefix={perspective === 'IN' ? '+' : '-'}
        cash={data.cash}
        tradeMainStatus={data.tradeMainStatus}
        tradeMainStatusName={data.tradeMainStatusName}
        statusText={
          data.tradeMainStatus === TradeMainStatus.COMPLETED
            ? getCompletedStatusText(perspective)
            : data.tradeMainStatus === TradeMainStatus.CANCELLED
              ? '会员互转已取消，资金已退回账户。'
              : data.tradeMainStatus === TradeMainStatus.REJECTED
                ? `互转申请未通过，原因：${data.statusDesc ?? ''}。`
                : undefined
        }
        showHelp={data.tradeMainStatus === TradeMainStatus.REJECTED}
      />

      {data.showProgressTimeline && !!data.progressNodes?.length && (
        <WithdrawProgressTimeline
          memberTransfer
          nodes={data.progressNodes}
          showCancel={data.canCancelWithdraw}
          onCancelClick={onCancelClick}
        />
      )}

      <div className="flex flex-col gap-12px">
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
          {isTipping ? (
            perspective === 'OUT' ? (
              <AccountInfoRow
                label="转入账号"
                account={data.recipientAccountMasked ?? data.transferListTitle}
                avatarUrl={accountAvatarUrl}
              />
            ) : (
              <AccountInfoRow
                label="转出账号"
                account={data.transferOutAccountMasked}
                avatarUrl={accountAvatarUrl}
              />
            )
          ) : perspective === 'OUT' ? (
            <>
              <InfoRow label="转出金额" value={cashFormatted} mono />
              <InfoRow label="账户余额" value={`¥ ${balance}`} mono />
              {data.arrivalTime && <InfoRow label="到账时间" value={data.arrivalTime} mono />}
            </>
          ) : (
            <AccountInfoRow
              label="转出账号"
              account={data.transferOutAccountMasked}
              avatarUrl={accountAvatarUrl}
            />
          )}
        </div>

        <div className={style.card}>
          {isTipping ? (
            perspective === 'OUT' ? (
              <>
                {data.arrivalTime && <InfoRow label="完成时间" value={data.arrivalTime} mono />}
                <InfoRow label="转出金额" value={cashFormatted} mono />
                <InfoRow label="账户余额" value={`¥ ${balance}`} mono />
                <InfoRow label="附言" value={data.postscript} mono />
              </>
            ) : (
              <>
                {data.arrivalTime && <InfoRow label="到账时间" value={data.arrivalTime} mono />}
                <InfoRow label="到账金额" value={cashFormatted} mono />
                <InfoRow label="账户余额" value={`¥ ${balance}`} mono />
                <InfoRow label="附言" value={data.postscript} mono />
              </>
            )
          ) : perspective === 'OUT' ? (
            <>
              {/* <InfoRow
                label="收款账号"
                value={
                  <div className="flex items-center gap-4px">
                    {data.withdrawMethod?.logoUrl && (
                      <LazyImage src={data.withdrawMethod.logoUrl} className="h-15px" />
                    )}
                    <span>{data.transferListTitle}</span>
                  </div>
                }
              /> */}

              <AccountInfoRow
                label="收款账号"
                account={data.transferListTitle}
                avatarUrl={accountAvatarUrl}
              />
              {data.postscript != null && data.postscript !== '' && (
                <InfoRow label="附言" value={data.postscript} mono />
              )}
            </>
          ) : (
            <>
              {data.arrivalTime && <InfoRow label="到账时间" value={data.arrivalTime} mono />}
              <InfoRow label="到账金额" value={cashFormatted} mono />
              <InfoRow label="账户余额" value={`¥ ${balance}`} mono />
              {data.postscript != null && data.postscript !== '' && (
                <InfoRow label="附言" value={data.postscript} mono />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── 主组件 ─── */
export const MemberTransferWithdrawDetailModal = ({ orderId, onClose }: IProps) => {
  const openCustomerService = useOpenCustomerService();
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const theme = themeMode === 'system' ? getSystemTheme() : themeMode;
  const { data, isLoading, refetch } = useMemberTransferDetailQuery({ orderId: orderId ?? '' });
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

  return (
    <Overlay
      show={!!orderId}
      close={onClose}
      position={isMobile ? 'bottom' : 'center'}
      bodyClassname={style.body}
    >
      <H5Header
        title="会员互转详情"
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

      {/* 取消会员互转确认弹窗（声明式，cancelLoading 能正确响应） */}
      <Modal
        show={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="取消会员互转"
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
          取消会员互转订单后，
          <br />
          互转金额将原路返回！
        </p>
      </Modal>
      {isLoading || !data ? (
        <div className="flex-1 flex flex-col gap-12px p-12px">
          {[...Array(6).keys()].map((i) => (
            <Skeleton key={i} type="base" baseClassName="h-40px" />
          ))}
        </div>
      ) : (
        <MemberTransferDetailContent
          data={data}
          theme={theme}
          onCancelClick={() => setShowCancelModal(true)}
        />
      )}
    </Overlay>
  );
};
