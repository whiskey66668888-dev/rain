import { useCallback, useMemo } from 'react';

import { usePreInfoQuery } from '@/apis/origin/setting';
import { buildDownloadAppUrl, openDownloadAppUrl } from '@/utils/appDownload';

/**
 * 站点配置 downUrl + 代理参数「APP下载」行为，供首页 Banner、我的页、侧栏等处复用。
 */
export function useAppDownload() {
  const { data: preInfo } = usePreInfoQuery();

  const downloadAppUrl = useMemo(() => buildDownloadAppUrl(preInfo?.downUrl), [preInfo?.downUrl]);

  const openDownloadApp = useCallback(() => {
    if (!downloadAppUrl) return;
    openDownloadAppUrl(downloadAppUrl);
  }, [downloadAppUrl]);

  return { downloadAppUrl, openDownloadApp };
}
