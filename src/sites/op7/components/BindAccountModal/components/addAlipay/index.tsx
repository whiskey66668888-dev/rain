import React, { useMemo, useState } from 'react';
// components
import Button from '@/common/components/Button';
import Input from '../input';
import { toast } from '@/common/components/Toast';
// hooks
import { addAlipayReq } from '@/apis/origin/bank';

// styles
import styles from './index.module.scss';

interface AddAlipayProps {
  token: string;
  onClose: (refresh?: boolean) => void;
}

const AddAlipay: React.FC<AddAlipayProps> = ({ token, onClose }) => {
  // 真实姓名
  const [cardName, setCardName] = useState('');
  // 支付宝账号
  const [cardNumber, setCardNumber] = useState('');
  // loading
  const [loading, setLoading] = useState(false);

  // 按钮是否可点击
  const disabled = useMemo(() => {
    return cardName && cardNumber ? false : true;
  }, [cardName, cardNumber]);

  // 提交
  const handleSubmit = async () => {
    if (!/^[\u4e00-\u9fa5a-zA-Z]+$/.test(cardName)) {
      toast({ type: 'warning', description: '请输入汉字或英文，字符40个内' });
      return;
    }

    const payload = {
      cardName: cardName,
      cardNumber: cardNumber,
      token: token,
    };

    try {
      setLoading(true);
      await addAlipayReq(payload);
      toast({ type: 'success', description: '添加成功' });
      // 关闭并刷新
      onClose(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.content}>
      <div className={styles.addBox}>
        <Input
          className={styles.input}
          value={cardName}
          onChange={setCardName}
          placeholder="请输入账号绑定的真实姓名"
          maxLength={40}
          allowClear
        />

        <Input
          className={styles.input}
          value={cardNumber}
          onChange={setCardNumber}
          placeholder="请输入支付宝账号"
          maxLength={36}
          allowClear
        />
      </div>

      <div className={styles.buttonWrap}>
        <Button
          className={styles.button}
          type="primary"
          onClick={() => {
            handleSubmit();
          }}
          disabled={disabled}
          loading={loading}
        >
          完成
        </Button>
      </div>
    </div>
  );
};

export default AddAlipay;
