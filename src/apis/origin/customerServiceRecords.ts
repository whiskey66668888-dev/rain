import dayjs from 'dayjs';

import { useQueryHook } from '@/core/query';
import request from '@/core/sdk/request';

export interface CustomerServiceBetRecordDetail {
  marketName?: string;
  createTime?: string | number;
  matchName?: string;
  vendor?: string;
  oddsType?: string | number;
  betStatus?: number;
}

export interface CustomerServiceBetRecord {
  betAmount: number | string;
  netAmount: number | string;
  createTime: string | number;
  orderId: string;
  vendor: string;
  matchName: string;
  marketName?: string;
  betStatus: number;
  oddsType: number;
  isParlay?: boolean;
  details?: CustomerServiceBetRecordDetail[];
  odds?: number | string;
  parlayType?: string;
}

export interface CustomerServiceBetRecordPage {
  records: CustomerServiceBetRecord[];
  pageNumber: number;
  totalPage?: number;
  totalSize?: number;
}

interface CustomerServiceBetRecordParams {
  gameId: string;
  pageNumber: number;
  pageSize: number;
  beginTime: string;
  endTime: string;
  isSettle: boolean;
}

function normalizeRecordList(data: unknown): CustomerServiceBetRecord[] {
  if (Array.isArray(data)) return data.map(normalizeRecord);
  if (!data || typeof data !== 'object') return [];

  const response = data as Record<string, unknown>;
  for (const key of ['list', 'records', 'items', 'data']) {
    if (Array.isArray(response[key])) {
      return response[key].map(normalizeRecord);
    }
    if (response[key] && typeof response[key] === 'object') {
      const nestedRecords = normalizeRecordList(response[key]);
      if (nestedRecords.length) return nestedRecords;
    }
  }

  // 部分场馆返回以 gameId 为 key 的记录集合。
  return Object.entries(response)
    .filter(([key, value]) => !Number.isNaN(Number(key)) && Array.isArray(value))
    .flatMap(([, value]) => (value as CustomerServiceBetRecord[]).map(normalizeRecord));
}

function normalizeRecord(record: CustomerServiceBetRecord): CustomerServiceBetRecord {
  return {
    ...record,
    betAmount: Number(record.betAmount) || 0,
    netAmount: Number(record.netAmount) || 0,
    betStatus: Number(record.betStatus) || 0,
    oddsType: Number(record.oddsType) || 0,
    details: record.details?.map((detail) => ({
      ...detail,
      betStatus: detail.betStatus === undefined ? undefined : Number(detail.betStatus),
    })),
  };
}

function findNumericMeta(data: unknown, keys: string[]): number | undefined {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return undefined;
  const record = data as Record<string, unknown>;

  for (const key of keys) {
    if (record[key] === undefined || record[key] === null || record[key] === '') continue;
    const value = Number(record[key]);
    if (Number.isFinite(value) && value >= 0) return value;
  }

  for (const key of ['data', 'page', 'pagination']) {
    const nested = findNumericMeta(record[key], keys);
    if (nested !== undefined) return nested;
  }
  return undefined;
}

export async function getCustomerServiceBetRecordPage(
  gameId: number,
  pageNumber = 1,
  pageSize = 20,
): Promise<CustomerServiceBetRecordPage> {
  const params: CustomerServiceBetRecordParams = {
    gameId: String(gameId),
    pageNumber,
    pageSize,
    beginTime: dayjs().subtract(90, 'day').format('YYYY-MM-DD'),
    endTime: dayjs().format('YYYY-MM-DD'),
    isSettle: false,
  };
  const response = await request.post<unknown, CustomerServiceBetRecordParams>(
    '/api/game/record/gameRecord',
    {
      body: params,
      isErrorToast: false,
    },
  );
  return {
    records: normalizeRecordList(response.data),
    pageNumber,
    totalPage: findNumericMeta(response.data, ['totalPage', 'totalPages', 'pageCount']),
    totalSize: findNumericMeta(response.data, ['totalSize', 'total', 'totalCount']),
  };
}

export async function getCustomerServiceBetRecords(gameId: number) {
  const page = await getCustomerServiceBetRecordPage(gameId);
  return page.records;
}

export function useCustomerServiceBetRecords(gameId?: number, enabled = true) {
  return useQueryHook<CustomerServiceBetRecord[], Error>({
    queryKey: ['customer-service', 'bet-records', gameId],
    queryFn: () => (gameId ? getCustomerServiceBetRecords(gameId) : Promise.resolve([])),
    enabled: enabled && !!gameId,
    staleTime: 0,
    retry: false,
  });
}
