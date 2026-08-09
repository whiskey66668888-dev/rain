import request from '@/core/sdk/request';

/** 获取当前访问 IP（展示用） */
export async function getVisitIpReq(): Promise<string> {
  try {
    const res = await request.get<unknown, void, string>('/api/website/getVisitIp');
    return res?.data ?? '';
  } catch {
    return '';
  }
}
