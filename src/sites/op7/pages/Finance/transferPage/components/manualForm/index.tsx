import React, { useEffect, useState } from 'react';
// components
import Icon from '@/common/components/Icon';
import Button from '@/common/components/Button';
import Input from '../../../components/Input';
import VenuePicker from '../venuePicker';
import TransferDirectionView from '../transferDirection';

// hooks
import { useManualForm } from '../../hooks/useManualForm';
import type { GameItem } from '@/apis/origin/finance/transfer';

// styles
import styles from './index.module.scss';

/**
 * 钱包 转账表单
 */
const ManualForm: React.FC<{
  gameList: GameItem[];
  updateBlanceByGameId: (gameId: number) => void;
  inModal?: boolean;
}> = ({ gameList, updateBlanceByGameId, inModal = false }) => {
  const [accountPickerVisible, setAccountPickerVisible] = useState(false);
  const {
    amount,
    changeAmount,
    setMax,
    transferDirection,
    changeTransferDirection,
    transferInAccountName,
    transferOutAccountName,
    disabled,
    selectGameItem,
    setSelectGameItem,
    handleTransfer,
    loading,
    showMaskLoading,
  } = useManualForm({ updateBlanceByGameId });

  useEffect(() => {
    if (gameList.length > 0) {
      setSelectGameItem(gameList[0] as GameItem);
    }
  }, [gameList, setSelectGameItem]);

  const renderSuffix = () => {
    return (
      <span className={styles.max} onClick={setMax}>
        最大金额
      </span>
    );
  };

  return (
    <div className={styles.transFormContent}>
      <TransferDirectionView
        transferOutAccountName={transferOutAccountName}
        transferInAccountName={transferInAccountName}
        transferDirection={transferDirection}
        showAccountPicker={setAccountPickerVisible}
        changeTransferDirection={changeTransferDirection}
        inModal={inModal}
      />

      <div className={styles.list_bg}>
        <h3 className={styles.list_title}>转账金额</h3>
        <Input
          className={styles.input_box}
          value={amount}
          onChange={changeAmount}
          placeholder="请输入转账金额"
          suffix={renderSuffix()}
          maxLength={10}
        />
      </div>

      <div className={styles.bnDiv}>
        <Button
          type="primary"
          className={styles.button}
          disabled={disabled}
          loading={loading}
          onClick={() => {
            handleTransfer();
          }}
        >
          立即转账
        </Button>
      </div>

      {accountPickerVisible && (
        <VenuePicker
          visible={accountPickerVisible}
          onClose={() => setAccountPickerVisible(false)}
          list={gameList}
          value={selectGameItem}
          onChange={(val: GameItem) => {
            setSelectGameItem(val);
          }}
        />
      )}

      {showMaskLoading ? (
        <div className={styles.loadingMask}>
          <Icon
            src="/images/common/loading.svg"
            className="inline-block rounded-full animate-spin"
            size={100}
            color="var(--ThemeColor-Main)"
          />
        </div>
      ) : null}
    </div>
  );
};

export default ManualForm;
