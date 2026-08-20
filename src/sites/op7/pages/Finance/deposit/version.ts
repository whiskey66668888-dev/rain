import { DepositVersionType, getDepositVersionV2 } from '@/apis/origin/finance/depositV2';

const DEPOSIT_VERSION_STORAGE_KEY = 'depositType';
const DEFAULT_DEPOSIT_VERSION: DepositVersionType = 'new';
export const DEPOSIT_VERSION_CHANGE_EVENT = 'deposit-version-change';

export const normalizeDepositVersion = (value: unknown): DepositVersionType => {
  return value === 'old' ? 'old' : DEFAULT_DEPOSIT_VERSION;
};

export const getSessionDepositVersion = (): DepositVersionType | null => {
  if (typeof sessionStorage === 'undefined') return null;
  const value = sessionStorage.getItem(DEPOSIT_VERSION_STORAGE_KEY);
  if (value !== 'new' && value !== 'old') return null;
  return value;
};

export const getInitialDepositVersion = (): DepositVersionType => {
  return getSessionDepositVersion() ?? DEFAULT_DEPOSIT_VERSION;
};

export const setSessionDepositVersion = (value: DepositVersionType): void => {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(DEPOSIT_VERSION_STORAGE_KEY, value);
  window.dispatchEvent(
    new CustomEvent<DepositVersionType>(DEPOSIT_VERSION_CHANGE_EVENT, {
      detail: value,
    }),
  );
};

export const getDepositVersion = async (): Promise<DepositVersionType> => {
  const sessionVersion = getSessionDepositVersion();
  if (sessionVersion) return sessionVersion;

  try {
    const res = await getDepositVersionV2();
    const version = normalizeDepositVersion(res.data);
    setSessionDepositVersion(version);
    return version;
  } catch {
    return DEFAULT_DEPOSIT_VERSION;
  }
};
