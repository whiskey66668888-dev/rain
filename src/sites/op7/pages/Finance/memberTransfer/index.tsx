import React, { useState } from 'react';
// components
import Header from '../components/header';
import Balance from '../components/balance/index';
import Input from '../components/Input';
import Button from '@/common/components/Button';
import clsx from 'clsx';
import ConfirmModal from './components/confirmModal';
import PasswordModal from './components/passwordModal';
import { toast } from '@/common/components/Toast';
// constants
import { WalletType } from '../constants';
// hooks
import { useAppSelector } from '@/core/store/hooks';
import { useMemberTransfer } from './hooks/useMemberTransfer';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';
import { useGetMemberInfo } from '@/common/hooks/useMemberInfo';

// styles
import styles from './index.module.scss';
import { ETransRecordType } from '@/apis/commonSports/constants';
/**
 * 钱包 会员互转
 */
const MemberTransferPage: React.FC = () => {
  const navigate = useNavigateWithLanguage();
  const { getMemberInfo } = useGetMemberInfo();
  // 支付密码弹框
  const [pwdVisible, setPwdVisible] = useState(false);
  // 二次确认弹框提示
  const [confirmVisible, setConfirmVisible] = useState(false);
  // 用户信息
  const { cash, isAgent } = useAppSelector((state) => state.user.memberInfo);
  const {
    amount,
    account,
    remark,
    disabled,
    setAccount,
    changeAmount,
    setRemark,
    memberTransfer,
    loading,
  } = useMemberTransfer();

  const renderAccountPrefix = () => {
    return <span className={styles.label}>转入账号</span>;
  };

  const renderAmountPrefix = () => {
    return <span className={styles.label}>转入金额</span>;
  };

  const handleButton = () => {
    const amountValue = Number(amount);
    if (Number(cash) < amountValue) {
      toast({ type: 'warning', description: '您的账号钱包余额不足' });
      return;
    }

    // if (amountValue < 200) {
    //   toast({ type: 'warning', description: '最低互转金额为200' });
    //   return;
    // }

    setConfirmVisible(true);
  };

  const handleSubmit = async (password: string) => {
    setPwdVisible(false);
    await memberTransfer(password);
    await getMemberInfo();
    toast({ type: 'success', description: '操作成功' });
    // 跳转到交易记录
    navigate(PATHS.mineTransactionRecord + `?type=${ETransRecordType.MemberTransferWithdraw}`);
  };

  return (
    <div className={styles.memberTransferPage}>
      <Header title="会员互转" recordType={ETransRecordType.MemberTransferWithdraw} />

      <section>
        <Balance walletType={WalletType.Transfer} />

        <div className={styles.form}>
          <Input
            className={styles.input}
            placeholder="请输入转入账号"
            value={account}
            prefix={renderAccountPrefix()}
            allowClear
            onChange={setAccount}
          />
          <Input
            className={styles.input}
            placeholder="请输入转入金额"
            value={amount}
            prefix={renderAmountPrefix()}
            maxLength={10}
            allowClear
            onChange={changeAmount}
          />
          <Input
            className={clsx(styles.input, styles.textarea)}
            type="textarea"
            placeholder="请输入备注信息"
            value={remark}
            maxLength={30}
            showLimitWord={true}
            allowClear
            onChange={setRemark}
          />
        </div>

        <Button
          className={styles.button}
          type="primary"
          disabled={disabled}
          loading={loading}
          onClick={handleButton}
        >
          提交
        </Button>

        <div className={styles.reminds}>
          <div className={styles.tipsText}>温馨提示：</div>
          <div>
            1.会员互转需要满足提款流水方可转账，收款账户需要满足一倍提款流水方可进行提款；
            <br />
            2.最低互转金额为{isAgent ? 10 : 100}；
            <br />
            2.需要完成一次银行卡提现,才能使用会员互转功能。
          </div>
        </div>

        <ConfirmModal
          visible={confirmVisible}
          onClose={() => setConfirmVisible(false)}
          onConfirm={() => {
            // 关闭确认框
            setConfirmVisible(false);
            // 打开支付密码弹框
            setPwdVisible(true);
          }}
          amount={amount}
          account={account}
        />

        <PasswordModal
          visible={pwdVisible}
          money={amount}
          onClose={() => setPwdVisible(false)}
          onComplete={handleSubmit}
        />
      </section>
    </div>
  );
};

export default MemberTransferPage;
