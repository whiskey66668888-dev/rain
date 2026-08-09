import React, { useEffect, useMemo } from 'react';
// components
import Header from '../components/header';
import BalanceTransferH5 from '../components/balance/transferH5';
import SwitchNav from '../components/switchNav';
import ManualForm from './components/manualForm';
import Icon from '@/common/components/Icon';
import Skeleton from '@/common/components/Skeleton/index';

// hooks
import { useTransfer } from './hooks/useTransfer';
import type { GameItem } from '@/apis/origin/finance/transfer';

// styles
import styles from './index.module.scss';
import clsx from 'clsx';
import { ETransRecordType } from '@/apis/commonSports/constants';
/**
 * 钱包 转账 和 游戏钱包功能
 */
interface TransferProps {
  title?: string;
  showService?: boolean;
  inModal?: boolean;
}

const Transfer: React.FC<TransferProps> = ({
  title = '转账',
  showService = true,
  inModal = false,
}) => {
  const {
    gameList,
    isHideBalance,
    isFetched,
    changeHideBalance,
    handleBalanceClick,
    isAutoTransfer,
    changeAutoTransfer,
    initData,
    updateBlanceByGameId,
  } = useTransfer();

  useEffect(() => {
    initData();
  }, [initData]);

  const showList = useMemo(() => {
    if (!isHideBalance) return gameList;

    return gameList.filter((obj) => obj.balance && Number(obj.balance) > 0);
  }, [isHideBalance, gameList]);

  const renderItemContent = (item: GameItem) => {
    if (item.info === '失败' || item.info === '维护中' || item.info === '升级中') {
      return (
        <span style={{ color: 'var(--Text-700)', fontSize: '12px', fontWeight: 500 }}>
          {item.info}
        </span>
      );
    }

    if (item.balance === undefined) {
      return (
        <span>
          <Icon
            src="/images/common/loading.svg"
            className="inline-block rounded-full animate-spin"
            size={12}
            color="var(--ThemeColor-Main)"
          />
        </span>
      );
    }

    const num = Number(item.balance);
    return <span>{isNaN(num) ? item.balance : num.toFixed(2)}</span>;
  };

  const renderTransferGameList = () => {
    // 加载中
    if (!isFetched) {
      return <Skeleton type="transferMainList" />;
    }

    if (showList.length === 0) return null;

    return (
      <div className={clsx(styles.contentList)}>
        {showList.map((item, index) => {
          return (
            <div key={index} className={styles.gameItem}>
              <div className={styles.gameName}>{item.gameName}</div>
              <div
                className={styles.tlog1}
                onClick={() => {
                  handleBalanceClick(item);
                }}
              >
                {renderItemContent(item)}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderHideBalanceTip = () => {
    return (
      <div
        style={{
          width: '350px',
          fontSize: '12px',
          padding: '0',
          color: 'var(--Text-800)',
          borderRadius: '8px',
        }}
      >
        <p>1. 点击场馆下面的金额，可一键将中心钱包余额转入该场馆。</p>
        <p>2. 场馆钱包不能进行互转，请先转入主账户，再转入场馆钱包。</p>
        <p>3. Choice娱乐包含：Choice真人、YGG老虎机、YGG捕鱼。</p>
        <p>4. 所有场馆：可在进入场馆后，顶部进行转账操作。</p>
      </div>
    );
  };

  const renderAutoTransferTip = () => {
    return (
      <div
        style={{
          width: '287px',
          fontSize: '12px',
          padding: '0',
          color: 'var(--Text-800)',
          borderRadius: '8px',
        }}
      >
        <p>开启时：钱包余额将自动归集转入当前游戏场馆。</p>
        <p>关闭时：进入游戏场馆时需要手动“一键转入”</p>
      </div>
    );
  };

  return (
    <div className={clsx(styles.transferPage, inModal && styles.inModal)}>
      {!inModal && (
        <Header title={title} recordType={ETransRecordType.Transfer} showCustomer={showService} />
      )}

      <section>
        <BalanceTransferH5
          recycle={() => {
            initData(true);
          }}
        />

        <div className={styles.mainContent}>
          <SwitchNav
            className={styles.contentHeader}
            title="隐藏无余额场馆"
            checked={isHideBalance}
            onChange={(val) => {
              changeHideBalance(val);
            }}
            tooltip={renderHideBalanceTip()}
            tooltipPopoverClassName={styles.transferTipPopover}
          />

          {renderTransferGameList()}

          <SwitchNav
            title="自动转账"
            checked={isAutoTransfer}
            onChange={(val) => {
              changeAutoTransfer(val);
            }}
            tooltip={renderAutoTransferTip()}
            tooltipPopoverClassName={styles.transferTipPopover}
          />
        </div>

        {!isAutoTransfer && (
          <ManualForm
            gameList={gameList}
            updateBlanceByGameId={updateBlanceByGameId}
            inModal={inModal}
          />
        )}
      </section>
    </div>
  );
};

export default Transfer;
