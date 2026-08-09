import { useState, useMemo } from 'react';
import { useBankRiskInfoQuery, AccountItem } from '@/apis/origin/finance/withdrawal';

/**
 * 风险银行管理 Hook
 * 负责获取风险银行列表、安全银行列表、风险提示信息等
 * @param unifiedAccountList - 用户的银行卡列表（已经过 formatAccountList 统一格式化）
 * @param defaultAccount - 当前选中的默认账户
 */
export function useRiskBank() {
  const { data, refetch: getRiskBankList } = useBankRiskInfoQuery();

  /** 风险银行列表（需要提示的银行） */
  const riskBankList = useMemo(() => data?.tipBankList ?? [], [data]);

  /** 风险提示标题 */
  const riskTitle = useMemo(() => data?.title ?? '', [data]);

  /** 风险提示内容1 */
  const riskContent1 = useMemo(() => data?.content1 ?? '', [data]);

  /** 风险提示内容2 */
  const riskContent2 = useMemo(() => data?.content2 ?? '', [data]);

  /** 风险提示倒计时时间（秒） */
  const riskTipTime = useMemo(() => data?.tipTime ?? 5, [data]);

  /** 是否显示风险弹窗 */
  const [riskVisible, setRiskVisible] = useState<boolean>(false);

  /** 已经展示过风险提示的银行代码集合 */
  const [shownRiskBanks, setShownRiskBanks] = useState<Set<number>>(new Set());

  /**
   * 检查选中的银行是否为风险银行（且未展示过提示）
   * @param account - 银行账户对象
   * @returns 是否需要显示风险提示
   */
  const isRiskBank = (account: AccountItem): boolean => {
    if (!account) return false;

    const accountId = account.id;
    const bankCode = account.cardCode;

    // 如果已经展示过，不再提示
    if (shownRiskBanks.has(accountId)) {
      return false;
    }

    // 检查是否在风险列表中
    const isRisk = riskBankList.some((riskBank) => riskBank.bankCode === bankCode);
    return isRisk;
  };

  /**
   * 显示风险提示弹窗
   * - 显示弹窗时自动标记当前银行已展示
   * - 确保只要弹窗展示过，就不再提示
   */
  const showRiskModal = (id: number) => {
    // 👇 显示弹窗时立即标记已展示
    if (id) {
      setShownRiskBanks((prev) => new Set(prev).add(id));
    }

    setRiskVisible(true);
  };

  /**
   * 关闭风险提示弹窗
   */
  const hideRiskModal = () => {
    setRiskVisible(false);
  };

  /**
   * 安全银行
   */
  const getSafeBankList = (bankList: AccountItem[]): AccountItem[] => {
    return bankList.filter((bank) => {
      const isRisk = riskBankList.some((riskBank) => {
        return riskBank.bankCode === bank.cardCode;
      });
      return !isRisk;
    });
  };

  return {
    /** 风险银行列表 */
    riskBankList,

    /** 风险提示标题 */
    riskTitle,

    /** 风险提示内容1 */
    riskContent1,

    /** 风险提示内容2 */
    riskContent2,

    /** 风险提示倒计时（秒） */
    riskTipTime,

    /** 是否显示风险弹窗 */
    riskVisible,

    /** 手动获取风险银行列表 */
    getRiskBankList,

    /** 检查是否为风险银行（且未展示过） */
    isRiskBank,

    /** 显示风险提示弹窗 */
    showRiskModal,

    /** 关闭风险提示弹窗 */
    hideRiskModal,

    /** 获取安全银行 */
    getSafeBankList,
  };
}
