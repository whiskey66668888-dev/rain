import clsx from 'clsx';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Toast } from 'antd-mobile';
import dayjs from 'dayjs';
import { ClientOnly } from '@/common/components/ClientOnly';
import Content from './components/content';
import { getRebate, rebateSave, getRebateList, type RebateTop10Item } from '@/apis/origin/rebate';
import { useGetMemberInfo } from '@/common/hooks/useMemberInfo';

/**
 * 实时返水（三级路由）
 */
const RealtimeRebatePage: React.FC = () => {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [rebateAmount, setRebateAmount] = useState('----');
  const [rows, setRows] = useState<RebateTop10Item[]>([]);
  const [top10Loading, setTop10Loading] = useState(false);
  const { getMemberInfo } = useGetMemberInfo();

  const btnText = countdown > 0 ? `领取中（${countdown}S）` : '立即领取';

  const loadRebateAmount = useCallback(async () => {
    try {
      const res = await getRebate();
      const amount = res.data;
      setRebateAmount(String(amount ?? '----'));
    } catch {
      setRebateAmount('----');
    }
  }, []);

  const loadTop10 = useCallback(async () => {
    setTop10Loading(true);
    try {
      const res = await getRebateList({
        type: '0',
        pageNumber: 1,
        pageSize: 6,
        start: dayjs(new Date()).format('YYYY-MM-DD'),
        end: dayjs(new Date()).format('YYYY-MM-DD'),
      });
      setRows(res.data?.data ?? []);
    } catch {
      setRows([]);
    } finally {
      setTop10Loading(false);
    }
  }, []);

  const isMounted = useRef(true);
  useEffect(
    () => () => {
      isMounted.current = false;
    },
    [],
  );

  const handleReceive = useCallback(async () => {
    if (countdown > 0) return;

    setCountdown(3);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      await rebateSave();
      Toast.show({ icon: 'success', content: '领取返水成功' });
      await Promise.all([getMemberInfo(), loadRebateAmount(), loadTop10()]);
    } catch (e: unknown) {
      if (isMounted.current) setCountdown(0);
      const info =
        typeof e === 'object' && e !== null && 'response' in e
          ? (e as { response?: { info?: string } }).response?.info
          : undefined;
      const content = info?.includes('没有可领取金额') ? '当前无可领返水' : info || '领取失败';
      Toast.show({ icon: 'fail', content });
    }
  }, [countdown, getMemberInfo, loadRebateAmount, loadTop10]);

  useEffect(() => {
    void loadRebateAmount();
    void loadTop10();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [loadRebateAmount, loadTop10]);

  return (
    <div
      data-desc="realtime-rebate-page"
      className={clsx(
        'self-center w-full ',
        'flex-1 flex flex-col ',
        'overflow-y-auto lg:overflow-initial',
        'lg:max-w-[1220px]',
      )}
    >
      <div className="text-sm text-[var(--Text-800)] flex-1 flex flex-col">
        <ClientOnly>
          <Content
            rebateAmount={rebateAmount}
            btnText={btnText}
            onReceive={() => {
              handleReceive();
            }}
            rows={rows}
            loading={top10Loading}
          />
        </ClientOnly>
      </div>
    </div>
  );
};

export default RealtimeRebatePage;
