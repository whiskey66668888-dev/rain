import Overlay from '@/common/components/Overlay';
import { useAppSelector } from '@/core/store/hooks';
import CopyButton from '@/sites/op7/components/CopyButton';
import Skeleton from '@/common/components/Skeleton';
import clsx from 'clsx';
import style from './WithdrawDetailModal.module.scss';
import LazyImage from '@/common/components/LazyImage';
import H5Header from '@/sites/op7/components/H5Header';
import { getSystemTheme } from '@/utils';
import { useOpenCustomerService } from '@/sites/op7/hooks/useOpenCustomerService';
import { TradeMainStatus } from '@/apis/commonSports/constants';
import { WithdrawAmountBlock } from './WithdrawAmountBlock';
import { WithdrawProgressTimeline } from './WithdrawProgressTimeline';
import { useBonusDetailQuery } from '@/apis/origin/transactionRecord/bonusDetails';
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
export const BonusDetailModal = ({ orderId, onClose }: IProps) => {
  const openCustomerService = useOpenCustomerService();
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const theme = themeMode === 'system' ? getSystemTheme() : themeMode;
  const { data, isLoading } = useBonusDetailQuery({ orderId: orderId ?? '' });

  return (
    <Overlay
      show={!!orderId}
      close={onClose}
      position={isMobile ? 'bottom' : 'center'}
      bodyClassname={style.body}
    >
      <H5Header
        title="红利详情"
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

      {isLoading || !data ? (
        <div className="flex-1 flex flex-col gap-12px p-12px">
          {[...Array(6).keys()].map((i) => (
            <Skeleton key={i} type="base" baseClassName="h-40px" />
          ))}
        </div>
      ) : (
        <div className={style.scroll}>
          {/* 内容区：flex-1 撑满，按钮自然沉底 */}
          <div className="flex-1 flex flex-col gap-12px">
            {/* 金额 + 状态 */}
            <WithdrawAmountBlock
              cash={data.cash}
              cashPrefix="+"
              tradeMainStatus={data.tradeMainStatus}
              tradeMainStatusName={data.tradeMainStatusName}
              statusText={
                data.tradeMainStatus === TradeMainStatus.COMPLETED
                  ? '红利已发放至您的中心钱包账户。'
                  : data.tradeMainStatus === TradeMainStatus.CANCELLED
                    ? '红利已取消。'
                    : data.tradeMainStatus === TradeMainStatus.REJECTED
                      ? `红利申请未通过，原因：${data.statusDesc ?? ''}。`
                      : undefined
              }
              showHelp={data.tradeMainStatus === TradeMainStatus.REJECTED}
            />
            {/* 进度时间线 */}
            {data.showProgressTimeline && !!data.progressNodes?.length && (
              <WithdrawProgressTimeline nodes={data.progressNodes} />
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
                <InfoRow label="创建时间" value={data.createTime} mono />
                {[TradeMainStatus.COMPLETED, TradeMainStatus.REJECTED].includes(
                  data.tradeMainStatus,
                ) && <InfoRow label="发放时间" value={data.completeTime} mono />}
              </div>

              <div className={style.card}>
                <InfoRow label="红利金额" value={`¥ ${data.bonusAmount?.toFixed(2)}`} />
                <InfoRow label="账户余额" value={`¥ ${data.accountBalance?.toFixed(2)}`} />
                <InfoRow label="红利类型" value={data.bonusTypeName} />
                <InfoRow label="流水倍数" value={data.turnoverMultiple} />
              </div>
            </div>
          </div>

          {/* 按钮固定在底部 */}
          {/* {data.tradeMainStatus === TradeMainStatus.COMPLETED && (
            <Button
              className="w-full shrink-0"
              onClick={() => {
                navigate(PATHS.mineWelfareCenter);
              }}
            >
              去福利中心查看
            </Button>
          )} */}
        </div>
      )}
    </Overlay>
  );
};
