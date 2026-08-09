import React, { useMemo, useState } from 'react';

// components
import Icon from '@/common/components/Icon';
import LazyImage from '@/common/components/LazyImage';
import AccountPicker, { OtherItem } from '../accountPicker';
import { BankAccountType } from '@/utils/constants/money';
import PermanentModal from '../../../components/permanentModal';

import { WithdrawItem, WithdrawType, AccountItem } from '@/apis/origin/finance/withdrawal';
import { useAppSelector } from '@/core/store/hooks';
// utils
import { getAccountName, getAccountTip } from '../../../utils';
// styles
import styles from './index.module.scss';
import { BindAccountType } from '@/utils/constants/account';
/**
 * 钱包 取款 - 银行卡/虚拟币/支付宝/数字币 地址
 */
const CardAddress: React.FC<{
  item: WithdrawItem;
  selectIdx: number;
  accountItem: AccountItem;
  onChange: (val: number) => void;
  openRealNameModal: () => void;
  showAccountType: (showType: BankAccountType | null) => void;
  openBindAccountModal: (type: BindAccountType) => void;
}> = ({
  item,
  selectIdx,
  accountItem,
  onChange,
  openRealNameModal,
  showAccountType,
  openBindAccountModal,
}) => {
  const { realName, hasOtherBank } = useAppSelector((state) => state.user.memberInfo);
  const [pickerVisible, setPickerVisible] = useState(false);

  const cardMax = useMemo(() => {
    return item.cardMax;
  }, [item]);

  const cardNum = useMemo(() => {
    const accountList = item?.accountList ?? [];
    return accountList.length;
  }, [item]);

  const cardTitle = useMemo(() => {
    let result = '';
    switch (item.code) {
      case WithdrawType.bank:
        result = `提现银行 (${cardNum}/${cardMax})`;
        break;
      case WithdrawType.virtual:
        result = `虚拟币地址 (${cardNum}/${cardMax})`;
        break;
      case WithdrawType.digital:
        result = `数字币地址 (${cardNum}/${cardMax})`;
        break;
      case WithdrawType.zfb:
        result = `提现支付宝 (${cardNum}/${cardMax})`;
        break;
      default:
        break;
    }
    return result;
  }, [item, cardNum, cardMax]);

  // logo
  const cardLogo = useMemo(() => {
    if (accountItem.id) {
      if (accountItem.cardLogo) return accountItem.cardLogo;

      return item.icon;
    }

    return '/images/common/finance/add_blue.svg';
  }, [accountItem, item]);

  const cardName = useMemo(() => {
    if (accountItem?.id) {
      return getAccountName({ type: item.code, item: accountItem });
    }

    let result = '';
    switch (item.code) {
      case WithdrawType.bank:
        result = '点击绑定提现银行卡';
        break;
      case WithdrawType.virtual:
        result = '点击绑定虚拟币地址';
        break;
      case WithdrawType.digital:
        result = '点击绑定数字币地址';
        break;
      case WithdrawType.zfb:
        result = '点击绑定支付宝';
        break;
      default:
        break;
    }
    return result;
  }, [accountItem, item]);

  const cardTip = useMemo(() => {
    if (accountItem?.id) {
      return getAccountTip({ type: item.code, item: accountItem });
    }

    return '';
  }, [accountItem, item]);

  // 渲染picker 底部按钮
  const getPickerButton = () => {
    if (item.code === WithdrawType.bank) {
      if (cardNum >= cardMax) {
        return [
          {
            label: '管理提现银行卡',
            icon: '/images/common/finance/ic_manage.svg',
            onClick: toBankListPage,
          },
        ];
      }

      const list: OtherItem[] = [
        {
          label: '添加本人银行卡',
          icon: '/images/common/finance/add_blue.svg',
          onClick: toAddBankPage,
        },
      ];
      if (hasOtherBank) {
        list.push({
          label: '添加非本人银行卡',
          icon: '/images/common/finance/add_green.svg',
          tip: 'VIP5特权',
          onClick: toAddOtherBankPage,
        });
      }
      return list;
    }

    if (item.code === WithdrawType.virtual) {
      if (cardNum >= cardMax) {
        return [
          {
            label: '管理虚拟币地址',
            icon: '/images/common/finance/ic_manage.svg',
            onClick: toUsdtListPage,
          },
        ];
      }

      return [
        {
          label: '添加虚拟币地址',
          icon: '/images/common/finance/add_blue.svg',
          onClick: toAddUsdtPage,
        },
      ];
    }

    if (item.code === WithdrawType.digital) {
      if (cardNum >= cardMax) {
        return [
          {
            label: '管理数字币地址',
            icon: '/images/common/finance/ic_manage.svg',
            onClick: toDigitalListPage,
          },
        ];
      }

      return [
        {
          label: '添加数字币地址',
          icon: '/images/common/finance/add_blue.svg',
          onClick: toAddDigitalPage,
        },
      ];
    }

    if (item.code === WithdrawType.zfb) {
      if (cardNum >= cardMax) {
        return [
          {
            label: '管理支付宝账号',
            icon: '/images/common/finance/ic_manage.svg',
            onClick: toZfbListPage,
          },
        ];
      }

      return [
        {
          label: '添加支付宝账号',
          icon: '/images/common/finance/add_blue.svg',
          onClick: toAddZfbPage,
        },
      ];
    }

    return [];
  };

  // 添加本人银行卡
  const toAddBankPage = () => {
    if (!realName) {
      // 真实姓名 弹框
      openRealNameModal();
      return;
    }
    // 添加银行卡
    openBindAccountModal(BindAccountType.bank);
  };

  // 添加非本人银行卡
  const toAddOtherBankPage = () => {
    // 添加他人银行卡
    openBindAccountModal(BindAccountType.otherBank);
  };

  // 去银行卡列表页
  const toBankListPage = () => {
    showAccountType(BankAccountType.BANK_ACCOUNT);
  };

  // 添加虚拟币
  const toAddUsdtPage = () => {
    // 跳转到添加虚拟币
    openBindAccountModal(BindAccountType.virtual);
  };

  // 去虚拟币列表页
  const toUsdtListPage = () => {
    showAccountType(BankAccountType.VIRTUAL_ACCOUNT);
  };

  // 添加数字币
  const toAddDigitalPage = () => {
    // 添加数字币
    openBindAccountModal(BindAccountType.digital);
  };

  // 去虚拟币列表页
  const toDigitalListPage = () => {
    showAccountType(BankAccountType.DIGITAL_ACCOUNT);
  };

  // 添加支付宝
  const toAddZfbPage = () => {
    // 添加支付宝
    openBindAccountModal(BindAccountType.alipay);
  };

  // 去支付宝列表页
  const toZfbListPage = () => {
    showAccountType(BankAccountType.ZFB_ACCOUNT);
  };

  // 点击事件
  const handleClick = () => {
    const accountList = item?.accountList ?? [];
    if (accountList.length === 0) {
      if (item.code === WithdrawType.bank) {
        if (!hasOtherBank) {
          toAddBankPage();
          return;
        }
      } else if (item.code === WithdrawType.virtual) {
        toAddUsdtPage();
        return;
      } else if (item.code === WithdrawType.digital) {
        toAddDigitalPage();
        return;
      } else if (item.code === WithdrawType.zfb) {
        toAddZfbPage();
        return;
      }
    }

    setPickerVisible(true);
  };

  return (
    <div className={styles.cardAddress}>
      <div className={styles.title}>
        <span>{cardTitle}</span>
        <PermanentModal />
      </div>

      <div className={styles.bankItem} onClick={handleClick}>
        <div className={styles.left}>
          <LazyImage
            className="w-24px h-24px cursor-pointer"
            src={cardLogo}
            alt="Add"
            lazy={false}
          />

          <div className={styles.nameBox}>
            <div className={styles.name}>{cardName}</div>
            {cardTip && <div className={styles.tip}>{cardTip}</div>}
          </div>
        </div>

        <Icon src="/images/common/arrow_down.svg" size="16px" color="var(--Text-700)" />
      </div>

      <AccountPicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        withdrawType={item.code}
        list={item.accountList}
        selectIdx={selectIdx}
        onChange={onChange}
        otherItemList={getPickerButton()}
      />
    </div>
  );
};

export default CardAddress;
