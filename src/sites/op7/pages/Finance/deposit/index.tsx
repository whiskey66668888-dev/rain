import React, { useMemo, useState, useRef } from 'react';
import { PATHS } from '@/sites/op7/routes/paths';
// components
import PayWayList from '../components/payWayList';
// import Tutorial from '../components/tutorial';
import VirtualTutorial from './components/virtualTutorial';
import VirtualActivity from './components/virtualActivity';
import QuickAmount from './components/quickAmount';
import FormTip from './components/formTip';
import { DepositChannelType, isExternalBrowserPayItem } from '../constants';
import Modal from '@/common/components/Modal';
import { toastCustom } from '@/common/components/Toast';
import Button from '@/common/components/Button';
import ReminderModal from './components/reminderModal';
import Skeleton from '@/common/components/Skeleton';
import RealNameModal from '../../MinePage/ProfilePage/components/RealNameModal';
import WalletChannelIcon, {
  type WalletChannelIconType,
} from '@/sites/op7/components/WalletChannelIcon';
import { API_CODE_ORIGIN_SUCCESS } from '@/utils/constants/apiCodeOrigin';

// hooks
import { useAppSelector } from '@/core/store/hooks';
import {
  useDepositChannelQuery,
  useDepositBankLockQuery,
  useDepositReminderlHooks,
  doDeposit,
  ChannelItem,
  PayItem,
} from '@/apis/origin/finance/deposit';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
// styles
import styles from './index.module.scss';
import clsx from 'clsx';
/**
 * 钱包 充值
 */
const Deposit: React.FC<{ inModal?: boolean }> = ({ inModal = false }) => {
  const navigate = useNavigateWithLanguage();
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  // 用户信息
  const { realName } = useAppSelector((state) => state.user.memberInfo);
  // 充值渠道
  const [channelIdx, setChannelIdx] = useState(0);
  // 支付方式
  const [payIdx, setPayIdx] = useState(0);
  // 充值金额
  const [amount, setAmount] = useState('');
  // 充值接口请求loading
  const [loading, setLoading] = useState(false);
  // bank lock flag
  const [bankLockFirst, setBankLockFirst] = useState(true);
  // 重要提醒弹框
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [realNameVisible, setRealNameVisible] = useState(false);
  // window ref
  const winRef = useRef<Window | null>(null);

  const { isRemembered, setDepositRemembered } = useDepositReminderlHooks();
  const { data, isFetching } = useDepositChannelQuery();
  const channels = data || [];

  const { data: bankLock } = useDepositBankLockQuery();

  const depositIconTypeMap: Record<string, WalletChannelIconType> = {
    [DepositChannelType.bank]: 'bank',
    [DepositChannelType.virtual]: 'virtual',
    [DepositChannelType.aliwechat]: 'digital',
  };

  const getDepositIconType = (code: string): WalletChannelIconType => {
    return depositIconTypeMap[code] ?? 'rmb';
  };

  const curChannel: ChannelItem = useMemo(() => {
    if (!data) return {} as ChannelItem;
    if (data.length == 0) return {} as ChannelItem;

    return data[channelIdx] ?? ({} as ChannelItem);
  }, [channelIdx, data]);

  const changeChannelIdx = (index: number, channelItem: ChannelItem) => {
    if (index === channelIdx) return;

    if (channelItem.code === DepositChannelType.bank.toString()) {
      // 银行卡锁定
      if (bankLock?.isCashInLock) {
        // 打开弹框
        Modal.open({
          title: '银行卡充值已被锁定',
          content: (
            <div style={{ marginTop: '12px', color: 'var(--Text-800)' }}>
              请 {bankLock?.hours} 小时之后再试，或使用虚拟币充值
            </div>
          ),
          confirmText: '我知道了',
        });
        return;
      } else {
        if (!realName) {
          const modal = Modal.open({
            title: '安全提示',
            content: (
              <div>
                <p style={{ marginTop: '12px', color: 'var(--Text-800)', textAlign: 'center' }}>
                  为了您的账号安全，请您完成实名认证。
                </p>
              </div>
            ),
            footer: (
              <div className={styles.modalFooter}>
                <Button
                  type="second"
                  className={clsx(styles.button, styles.cancel)}
                  onClick={() => {
                    modal.close();
                    if (index === channels.length - 1) {
                      navigate(-1);
                      return;
                    }

                    changeChannelIdx(index + 1, channels[index + 1]!);
                  }}
                >
                  取消
                </Button>
                <Button
                  className={styles.button}
                  type="primary"
                  onClick={() => {
                    modal.close();
                    // 去实名认证
                    setRealNameVisible(true);
                  }}
                >
                  前往
                </Button>
              </div>
            ),
          });
          return;
        } else if (bankLockFirst === true) {
          toastCustom({
            type: 'warning',
            content: (
              <div className={styles.lockBankBox}>
                <div className={styles.lockTimes}>
                  银行卡充值次数({bankLock?.failNumber}/{bankLock?.maxNumber})
                </div>
                <div className={styles.lockTip}>取消/超时/失败次数过多,充值渠道将会锁定</div>
              </div>
            ),
          });
        }

        if (bankLock?.failNumber === 0) {
          setBankLockFirst(false);
        }
      }
    }

    setChannelIdx(index);
    setPayIdx(0);
  };

  const curPay = useMemo(() => {
    const payList = curChannel?.payList ?? [];
    if (payList[payIdx]) {
      return payList[payIdx];
    }
    return {} as PayItem;
  }, [curChannel, payIdx]);

  // 充值按钮是否不可点击
  const disabled = useMemo(() => {
    if (!amount) return true;
    if (loading) return true;

    const val = Number(amount);
    if (val >= curPay.cashMin && val <= curPay.cashMax) {
      return false;
    }
    return true;
  }, [amount, curPay, loading]);

  const onSubmit = () => {
    // 重要提醒 24小时不再提醒 直接充值
    if (isRemembered) {
      handleDeposit();
    } else {
      // 显示重要提醒弹框
      setReminderModalVisible(true);
    }
  };

  // 重要提醒弹框 确认事件
  const onReminderModalSubmit = (isCheched: boolean) => {
    // 24小时不再提醒 勾选
    if (isCheched) {
      setDepositRemembered();
    }

    // 关闭重要提醒弹框
    setReminderModalVisible(false);

    handleDeposit();
  };

  // 提交充值
  const handleDeposit = async () => {
    if (loading) return;

    setLoading(true);
    const useIframePayPage = isMobile && !inModal && !isExternalBrowserPayItem(curPay.payName);
    try {
      if (!useIframePayPage) {
        winRef.current = window.open('about:blank', '_blank');
      }
      const { code, data } = await doDeposit({ payId: curPay.payId, cash: amount });
      if (code === API_CODE_ORIGIN_SUCCESS) {
        // 接口成功后先解除按钮 loading，再处理跳转，避免跳转较慢时按钮长时间停留在 loading 态。
        setLoading(false);
        setAmount('');

        if (data.url) {
          if (useIframePayPage) {
            navigate(PATHS.mineDepositPay, { state: { url: data.url } });
            return;
          }
          if (winRef.current) {
            winRef.current.location.href = data.url;
          }
          return;
        }

        if (winRef.current) {
          winRef.current.close();
        }
        return;
      }

      if (winRef.current) {
        winRef.current.close();
      }
    } catch (e) {
      console.log(e);
      if (winRef.current) {
        setTimeout(() => {
          winRef.current?.close();
        }, 100);
      }
    } finally {
      setLoading(false);
    }
  };

  const isVirtual = useMemo(
    () => DepositChannelType.virtual.toString() === curChannel.code,
    [curChannel],
  );

  const getChannelDisplayName = (name: string, code: string) => {
    if (code === DepositChannelType.virtual.toString()) return '虚拟币充值';
    if (code === DepositChannelType.aliwechat.toString()) return '数字币充值';
    return name;
  };

  const isVirtualTutorial = useMemo(() => curPay.payId === -1, [curPay]);
  const hotIconMap: Record<number, string> = {
    1: '/images/common/finance/pay/payType-hot.png',
    2: '/images/common/finance/pay/payType-discount.png',
    3: '/images/common/finance/pay/payType-promo.png',
    4: '/images/common/finance/pay/payType-0-5.png',
  };

  const usdtAmount = useMemo(() => {
    if (!isVirtual || isVirtualTutorial) return '';

    const virtualAmount = amount.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');

    const usdt = Number(virtualAmount) / Number(curPay.thirdRate);
    return usdt.toFixed(2);
  }, [isVirtual, isVirtualTutorial, amount, curPay]);

  if (isFetching && channels.length == 0) {
    return (
      <div
        className={clsx(
          styles.deposit,
          inModal ? styles.inModal : '',
          !inModal ? styles.autoPC : '',
          !inModal ? styles.pageLayout : '',
        )}
      >
        <Skeleton type="depositMainList" />
      </div>
    );
  }

  return (
    <>
      <div
        className={clsx(
          styles.deposit,
          inModal ? styles.inModal : '',
          !inModal ? styles.autoPC : '',
          !inModal ? styles.pageLayout : '',
        )}
      >
        <div className={styles.depositTypeList}>
          {channels.map((item, index) => (
            <div
              className={clsx(
                styles.depositTypeItem,
                curChannel.code == item.code ? styles.active : '',
              )}
              key={item.code}
              onClick={() => changeChannelIdx(index, item)}
            >
              <div className={styles.logoWrap}>
                <WalletChannelIcon
                  type={getDepositIconType(item.code)}
                  selected={curChannel.code == item.code}
                  size={16}
                  backgroundSize={16}
                  color="var(--Text-800)"
                  selectedColor="var(--White-100)"
                />
                {hotIconMap[item.hot] ? (
                  <img
                    src={hotIconMap[item.hot]}
                    alt=""
                    className={clsx(styles.pay_type_hot, styles.pay_type_hotOnIcon)}
                  />
                ) : null}
              </div>
              <span className={styles.channelLabel}>
                {getChannelDisplayName(item.name, item.code)}
                {hotIconMap[item.hot] ? (
                  <img
                    src={hotIconMap[item.hot]}
                    alt=""
                    className={clsx(styles.pay_type_hot, styles.pay_type_hotOnLabel)}
                  />
                ) : null}
              </span>
            </div>
          ))}
        </div>

        <div className={styles.main}>
          <PayWayList
            list={curChannel.payList}
            payIdx={payIdx}
            onChange={setPayIdx}
            inModal={inModal}
          />

          {/* <Tutorial icon="" name="UCPay存款教程" /> */}

          {curPay.payId == -1 ? (
            <>
              <VirtualTutorial />
              {isVirtual && <VirtualActivity />}
            </>
          ) : (
            <>
              <QuickAmount
                payItem={curPay}
                value={amount}
                onChange={setAmount}
                isVirtual={isVirtual}
                inModal={inModal}
                disabled={disabled}
                loading={loading}
                onSubmit={onSubmit}
                showUsdtAmount={isVirtual && !isVirtualTutorial && !!amount}
                usdtAmount={usdtAmount}
              />

              <FormTip tip={curPay.explain} />
              {isVirtual && <VirtualActivity />}
            </>
          )}
        </div>
      </div>

      {/* 重要提醒 */}
      <ReminderModal
        visible={reminderModalVisible}
        onClose={() => setReminderModalVisible(false)}
        onSubmit={onReminderModalSubmit}
      />

      <RealNameModal
        visible={realNameVisible}
        onClose={() => {
          setRealNameVisible(false);
        }}
      />
    </>
  );
};

export default Deposit;
