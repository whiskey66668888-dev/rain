import { useMemo, useState } from 'react';
import { doMemberTransfer } from '@/apis/origin/finance/transfer';

export function useMemberTransfer() {
  const [account, setAccount] = useState(''); // 用户账号
  const [amount, setAmount] = useState(''); // 转账金额
  const [remark, setRemark] = useState(''); // 备注
  const [loading, setLoading] = useState(false); // 转账请求loadin
  const RemarkMax = 30;

  const changeAmount = (value: string) => {
    if (/^\d*(\.\d{0,2})?$/.test(value)) {
      setAmount(value);
    }
  };

  const disabled = useMemo(() => {
    const amountValue = parseFloat(amount) ?? 0;
    if (amountValue <= 0) return true;

    if (!account) return true;
    if (account.length < 5) return true;
    return false;
  }, [account, amount]);

  const memberTransfer = async (password: string) => {
    const payload = {
      loginName: account, // 会员账户
      cash: amount, // 转账金额
      cashPassword: password, // 支付密码
      markInfo: remark, // 备注
    };
    try {
      setLoading(true);
      await doMemberTransfer(payload);
    } finally {
      setLoading(false);
    }
  };

  return {
    account,
    amount,
    remark,
    RemarkMax,
    disabled,
    loading,
    setAccount,
    changeAmount,
    setRemark,
    memberTransfer,
  };
}
