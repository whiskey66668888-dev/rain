export interface CheckIp2RegionData {
  ip?: string;
  Country?: string;
  City?: string;
  Province?: string;
}

const EXCLUDED_CITY_KEYWORDS = ['香港', '澳门', '台'] as const;

/**
 * 中国大陆 IP 判断
 * - Country === 中国
 * - City 不包含：香港 / 澳门 / 台湾（兼容 “台北/台中/台南...” 等）
 */
export function isMainlandChinaIp(region?: CheckIp2RegionData | null): boolean {
  if (!region) return false;
  if ((region.Country ?? '').trim() !== '中国') return false;

  const city = (region.City ?? '').trim();
  if (!city) return true;

  return !EXCLUDED_CITY_KEYWORDS.some((kw) => city.includes(kw));
}
