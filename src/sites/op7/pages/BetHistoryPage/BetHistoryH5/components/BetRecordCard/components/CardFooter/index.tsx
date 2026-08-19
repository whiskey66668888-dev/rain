import { useState } from 'react';
import type { TBetHistoryOrderItem } from '@/apis/commonSports/types';
import {
  ChevronDownSvg,
  CircleQuestionSvg,
  CopySvg,
  PlusIconSvg,
} from '@/sites/op7/components/SvgIcons';
import CopyButton from '@/sites/op7/components/CopyButton';
import clsx from 'clsx';
import dayjs from 'dayjs';
import Button from '@/common/components/Button';
import Overlay from '@/common/components/Overlay';
import ModalHeader from '@/sites/op7/components/ModalHeader';
import { useBetHistoryContext } from '@/common/hooks/betHistory/context/BetHistoryContext';
import { useBetHistoryMethods } from '@/common/hooks/betHistory/useBetHistoryMethods';
import { useVenueBalance } from '@/common/hooks/sports/useVenueBalance';
import { EBetHistoryTab, EBetOrderStatus, EVenue } from '@/apis/commonSports/constants';
import { bigNB } from '@/utils/bet/bigMath';
import Popover from '@/common/components/Popover';
import {
  calcEarlySettleStats,
  getEarlySettleDetailItems,
  getOrderDisplayOdds,
} from '@/utils/betHistory';
import { useAppSelector } from '@/core/store/hooks';
import { openBetShare } from '@/sites/op7/pages/SportsDetailsPage/components/share/betShareStore';

// ── 预约投注修改区（本金输入 + 赔率步进 + 操作按钮） ─────────────────────────

const ReserveEditSection = ({ order }: { order: TBetHistoryOrderItem }) => {
  const { activeVenue, reserveEdit, reserveEditComputed } = useBetHistoryContext();
  const { balance } = useVenueBalance();
  const {
    openReserveEditOrder,
    closeReserveEditOrder,
    updateReserveUnitStake,
    updateReserveEditOdds,
    openReserveEditConfirm,
    openCancelReserveBetConfirm,
  } = useBetHistoryMethods();

  const isReserveEditing = reserveEdit?.orderId === order.orderId;
  // 目前仅 FB 支持修改预约注单，OB 只保留取消（对齐 App）
  const canEditReserve = activeVenue === EVenue.FB;

  const handleCancelReserve = () => openCancelReserveBetConfirm(activeVenue, order.orderId);

  return (
    <div className="px-10px py-6px flex flex-col gap-6px">
      {canEditReserve && isReserveEditing && reserveEdit && (
        <div className="flex gap-6px">
          {/* 本金输入 */}
          <input
            type="text"
            inputMode="decimal"
            placeholder={
              reserveEditComputed
                ? `限额 ${reserveEditComputed.minUnitStake}-${reserveEditComputed.maxUnitStake}`
                : '限额获取中'
            }
            value={reserveEdit.unitStake}
            onChange={(e) =>
              updateReserveUnitStake({
                venue: activeVenue,
                unitStake: e.target.value,
                computed: reserveEditComputed,
                totalBalance: balance,
              })
            }
            className={clsx(
              'flex-1 h-[36px] px-10px rounded-[6px] _tf[14] font-medium din-pro',
              'text-[var(--Text-Main-10)]',
              'border-0.5px border-solid border-color-[var(--ThemeColor-Main)] rounded-6px',
              'placeholder:text-[var(--Text-500)] placeholder:_tf[12] placeholder:din-pro',
            )}
          />

          {/* 赔率步进 */}
          <div
            className={clsx(
              'w-128px shrink-0 flex items-center',
              'border-0.5px border-solid border-color-[var(--ThemeColor-Main)] rounded-6px',
            )}
          >
            <button
              type="button"
              onClick={() =>
                updateReserveEditOdds({
                  venue: activeVenue,
                  type: 'minus',
                  currentOdds: reserveEdit.odds,
                  computed: reserveEditComputed,
                  baseOdds: order.orderOdds,
                })
              }
              className="shrink-0 w-30px h-30px flex items-center justify-center"
            >
              <span className="w-10px h-2px bg-[var(--Text-500)]" />
            </button>
            <p className="flex-1 text-center _tf[14] font-medium text-[var(--Text-Main-10)]">
              @<span className="din-pro">{reserveEdit.odds}</span>
            </p>
            <button
              type="button"
              onClick={() =>
                updateReserveEditOdds({
                  venue: activeVenue,
                  type: 'plus',
                  currentOdds: reserveEdit.odds,
                  computed: reserveEditComputed,
                  baseOdds: order.orderOdds,
                })
              }
              className="shrink-0 w-30px h-30px flex items-center justify-center"
            >
              <PlusIconSvg className="w-10px h-10px text-[var(--Text-500)]" />
            </button>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-10px">
        {canEditReserve && isReserveEditing && reserveEdit ? (
          <>
            <Button
              type="second"
              size="middle"
              className="flex-1 rounded-[4px] text-[var(--ThemeColor-Main)]"
              onClick={() => closeReserveEditOrder({ venue: activeVenue })}
            >
              取消
            </Button>
            <Button
              type="primary"
              size="middle"
              className="flex-1 rounded-[4px]"
              disabled={
                !reserveEditComputed ||
                !reserveEdit.unitStake ||
                +reserveEdit.unitStake < reserveEditComputed.minUnitStake ||
                +reserveEdit.unitStake > reserveEditComputed.maxUnitStake
              }
              onClick={() => openReserveEditConfirm(activeVenue)}
            >
              确认
            </Button>
          </>
        ) : (
          <>
            <Button
              type="second"
              size="middle"
              className="flex-1 rounded-[4px] text-[var(--ThemeColor-Main)]"
              onClick={handleCancelReserve}
            >
              取消
            </Button>
            {canEditReserve && (
              <Button
                type="primary"
                size="middle"
                className="flex-1 rounded-[4px]"
                onClick={() => openReserveEditOrder({ venue: activeVenue, order })}
              >
                修改
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ── 卡片底部 ─────────────────────────────────────────────────────────────────

const CardFooter = ({ order, collapsed }: { order: TBetHistoryOrderItem; collapsed: boolean }) => {
  const [earlySettleDetailExpanded, setEarlySettleDetailExpanded] = useState(true);
  const [earlySettleDetailModalOpen, setEarlySettleDetailModalOpen] = useState(false);
  const {
    activeTab,
    activeVenue,
    EarlySettleConfigMap,
    earlySettleMaxCount,
    earlySettleMap,
    handleEarlySettle,
    openReserveEarlySettleSheet,
  } = useBetHistoryContext();
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);

  // #region 提前结算
  const earlySettleConfig = EarlySettleConfigMap?.[order.orderId];
  const currEarlySettleInfo = earlySettleMap[order.orderId];
  const isUnsettled = activeTab === EBetHistoryTab.UNSETTLED;
  const activeReserve = order.reserveEarlySettles?.find((r) => r.status === 1);

  const earlyStats = calcEarlySettleStats(order, earlySettleMaxCount);
  const maxReturn = earlySettleConfig?.cashOutRate
    ? bigNB(earlyStats.remainingStake).times(earlySettleConfig.cashOutRate).toFixed(2)
    : '0.00';

  const showEarlySettleBtn =
    isUnsettled &&
    order.supportEarlySettle &&
    earlySettleConfig?.cashOutRate &&
    earlyStats.count < earlySettleMaxCount;
  const showEarlySettleDetail = earlyStats.history.length > 0;
  // OB（EB 体育）只有全额提前结算，没有预约提前结算（对齐 App）
  const showReserveEarlySettleBtn = activeVenue === EVenue.FB;
  const venueLabel = activeVenue === EVenue.OB ? 'EB' : 'FB';

  const isDisabled =
    currEarlySettleInfo?.step === 'submitting' ||
    currEarlySettleInfo?.step === 'polling' ||
    currEarlySettleInfo?.step === 'settled' ||
    currEarlySettleInfo?.step === 'failed';
  const isPolling =
    currEarlySettleInfo?.step === 'submitting' || currEarlySettleInfo?.step === 'polling';

  const handleShowEarlySettleDetail = () => setEarlySettleDetailModalOpen(true);
  // #endregion

  return (
    <>
      {/* 折叠态：单行概要 / 展开态：确认时间 + 单号 */}
      {!!collapsed ? (
        order.isParlayOrder ? (
          <></>
        ) : (
          <div className="px-10px py-6px flex items-center justify-between gap-6px _tf[12] leading-[1.43] text-[var(--Text-800)]">
            <div>
              <span>{order.orderDetails[0]?.betItemFullName}</span>
              <span>&nbsp;@</span>
              <span className="din-pro">
                {getOrderDisplayOdds(order.orderDetails[0]?.baseOdds, order)}
              </span>
            </div>
            <div>{bigNB(order.orderBetAmount).toFixed(2)}</div>
          </div>
        )
      ) : (
        <div className={clsx('flex items-center justify-between px-10px pt-10px pb-6px')}>
          <div className="_tf[12] leading-[1.33] text-[var(--Text-800)]">
            <p>
              确认: <span>{dayjs(order.orderConfirmTime).format('MM-DD HH:mm:ss')}</span>
            </p>
            <p className="flex items-center gap-4px">
              <span>
                单号: <span>{order.orderId}</span>
              </span>
              <CopyButton
                text={order.orderId}
                className="shrink-0 flex items-center"
                aria-label="复制单号"
              >
                <CopySvg className="w-14px h-14px text-[var(--Text-800)]" />
              </CopyButton>
            </p>
          </div>
          {isLogin && (
            <button
              type="button"
              className="shrink-0 flex items-center justify-center"
              aria-label="分享"
              onClick={() => openBetShare(order, activeVenue)}
            >
              <img
                src="/images/common/sportDetail/order_share_icon.png"
                alt="分享"
                className="w-28px h-28px"
              />
            </button>
          )}
        </div>
      )}

      {/* 提前结算详情 */}
      {showEarlySettleDetail && !collapsed && isUnsettled && (
        /* 未结算：折叠展开 */ <div className="px-10px shadow-[0_0.5px_0_0_var(--Line-100)_inset]">
          <button
            type="button"
            className="w-full flex items-center justify-between py-8px"
            onClick={() => setEarlySettleDetailExpanded((v) => !v)}
          >
            <span className="_tf[14] text-[var(--Text-Main-10)]">提前结算详情</span>
            <ChevronDownSvg
              className={clsx(
                'w-16px h-16px text-[var(--Text-800)] transition-transform duration-200',
                earlySettleDetailExpanded && 'rotate-180',
              )}
            />
          </button>
          {earlySettleDetailExpanded && (
            <div className="flex flex-col gap-10px pb-10px">
              {getEarlySettleDetailItems(order, earlyStats).map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="_tf[14] text-[var(--Text-800)]">{label}:</span>
                  <span className="_tf[14] din-pro font-medium text-[var(--Text-Main-10)]">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 提前结算操作按钮 */}
      {showEarlySettleBtn && (
        <div className="px-10px py-8px flex gap-10px shadow-[0_0.5px_0_0_var(--Line-100)_inset]">
          <Button
            size="middle"
            className={clsx('rounded-[4px]', showReserveEarlySettleBtn ? 'w-[220px]' : 'flex-1')}
            disabled={isDisabled}
            loading={isPolling}
            onClick={() => {
              const entry = earlySettleMap[order.orderId];
              handleEarlySettle({ order, earlySettleConfig, entry, fromList: true });
            }}
          >
            {currEarlySettleInfo?.step === 'settled' ? (
              <>提前结算 成功</>
            ) : currEarlySettleInfo?.step === 'failed' ? (
              <>提前结算 失败</>
            ) : (
              <div className="flex items-center">
                提前结算&nbsp;<span className="din-pro translate-y-1px">{maxReturn}</span>
                <Popover
                  trigger="click"
                  placement="top"
                  content={
                    <p className="_tf[12] leading-[1.5] max-w-[200px]">
                      提前结算只适用于指定赛事和盘口，如遇到赛事或盘口取消，提前结算注单将会被收回重新结算。
                      {venueLabel}体育保留赛果最终解释权
                    </p>
                  }
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="w-16px h-16px shrink-0 flex items-center justify-center"
                  >
                    <CircleQuestionSvg className="w-12px" />
                  </div>
                </Popover>
              </div>
            )}
          </Button>

          {showReserveEarlySettleBtn && (
            <Button
              type="second"
              size="middle"
              className={clsx('flex-1 rounded-[4px] text-[var(--ThemeColor-Main)]')}
              disabled={isDisabled}
              onClick={() => openReserveEarlySettleSheet(order.orderId)}
            >
              {activeReserve ? (
                '预约中'
              ) : (
                <div className="flex items-center gap-4px font-medium">
                  <PlusIconSvg className="w-14px h-14px" />
                  <span>预约</span>
                </div>
              )}
            </Button>
          )}
        </div>
      )}

      {/* 提前结算详情 */}
      {showEarlySettleDetail && !isUnsettled && (
        /* 已结算：按钮 + 弹窗 */
        <div className="px-10px py-8px shadow-[0_0.5px_0_0_var(--Line-100)_inset]">
          <Button
            size="middle"
            className="w-full rounded-[4px]"
            onClick={handleShowEarlySettleDetail}
          >
            提前结算详情
          </Button>

          <Overlay
            show={earlySettleDetailModalOpen}
            close={() => setEarlySettleDetailModalOpen(false)}
            maskClickClose
            bodyClassname="bg-[var(--Background-300)] rounded-12px w-[310px]"
          >
            <ModalHeader
              title="提前结算详情"
              onClose={() => setEarlySettleDetailModalOpen(false)}
            />

            <div className="flex flex-col gap-10px px-12px pt-4px pb-12px">
              {getEarlySettleDetailItems(order, earlyStats).map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <p className="_tf[14] leading-[1.43] text-[var(--Text-800)]">{label}:</p>
                  <p className="_tf[18] din-pro text-[var(--Text-Main-10)]">{value}</p>
                </div>
              ))}
            </div>
          </Overlay>
        </div>
      )}

      {/* 预约投注修改区 */}
      {order.isPreBetOrder && order.orderStatus === EBetOrderStatus.Confirming && (
        <ReserveEditSection order={order} />
      )}
    </>
  );
};

export default CardFooter;
