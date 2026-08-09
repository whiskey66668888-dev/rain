import { useState, useEffect } from 'react';

import { usePreInfoQuery } from '@/apis/origin/setting';
import { load as loadFingerprintJS } from '@fingerprintjs/fingerprintjs-pro';

interface FingerprintAgent {
  get(): Promise<{ visitorId: string }>;
}

type LoadFingerprint = (options: { apiKey: string }) => Promise<FingerprintAgent>;

const loadFingerprint = loadFingerprintJS as LoadFingerprint;

interface UseFingerprintReturn {
  /** 访客指纹 ID */
  visitorId: string;
  /** 是否加载中 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
}

/**
 * 获取浏览器指纹 Hook
 * 使用 FingerprintJS Pro 获取唯一访客标识
 */
export function useFingerprint(): UseFingerprintReturn {
  const { data: preInfo } = usePreInfoQuery();
  const fingerPrintKey = preInfo?.fingerPrintKey;

  const [visitorId, setVisitorId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fingerPrintKey) {
      setLoading(false);
      setError('fingerPrintKey 未配置');
      return;
    }

    const getFingerprint = async () => {
      try {
        setLoading(true);
        setError(null);

        const fp = await loadFingerprint({
          apiKey: fingerPrintKey,
        });

        const { visitorId: id } = await fp.get();
        setVisitorId(id);
      } catch (err) {
        console.error('获取指纹失败:', err);
        setError(err instanceof Error ? err.message : '获取指纹失败');
      } finally {
        setLoading(false);
      }
    };

    getFingerprint();
  }, [fingerPrintKey]);

  return {
    visitorId,
    loading,
    error,
  };
}
