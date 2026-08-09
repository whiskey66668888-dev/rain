import { useBettingData } from '@/common/hooks/bet/context/BettingDataContext';
import { useGetVenueBalance, useVenueBalanceLoading } from '@/common/hooks/sports/useVenueBalance';
import { useOneClickTransferLoading } from '@/common/hooks/sports/useOneClickTransfer';
import useBetMethods from '@/common/hooks/bet/useBetMethods';
import clsx from 'clsx';
import BetSwitch from '../BetSwitch';
import OneClickTransferButton from '../../../components/OneClickTransferButton';
import bigMath from '@/utils/bet/bigMath';
import Icon from '@/common/components/Icon';
import { useAppSelector } from '@/core/store/hooks';

const BetTabsBar = () => {
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const { singleBetData, parlayBetData, isParlay, totalBalance, venue, isChatBet } =
    useBettingData();
  const { switchParlay, switchSingle } = useBetMethods();
  const { getVenueBalance } = useGetVenueBalance();
  const { balanceLoading } = useVenueBalanceLoading();
  const { oneClickTransferLoading } = useOneClickTransferLoading();

  return (
    <div data-desc="h5投注单导航栏" className="flex items-center justify-between px-16px">
      <BetSwitch
        options={
          isChatBet
            ? [{ label: '单关', count: singleBetData.ids.length }]
            : [
                { label: '单关', count: singleBetData.ids.length },
                { label: '串关', count: parlayBetData.ids.length },
              ]
        }
        activeIndex={isParlay ? 1 : 0}
        onChange={(index) => (index === 0 ? switchSingle() : switchParlay())}
      />

      <div className="flex items-center gap-8px">
        {!!isLogin && <OneClickTransferButton />}
        <div
          className={clsx(
            'flex items-center justify-end gap-4px cursor-pointer',
            'text-[var(--White-100)]',
            { 'pointer-events-none': balanceLoading || oneClickTransferLoading },
          )}
          onClick={() => {
            if (!isLogin) {
              return;
            }
            getVenueBalance({ venue, isLoading: true });
          }}
        >
          <p className="_tf[20] leading-[1] font-medium din-pro tabular-nums translate-y-[0.5px]">
            {bigMath.decimals(totalBalance, { padZero: true })}
          </p>

          <div
            className={clsx('shrink-0 flex', {
              'animate-spin': balanceLoading,
            })}
          >
            <Icon src="/images/common/refresh.svg" size="14px" color="var(--White-100)" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetTabsBar;
