import request from '@/core/sdk/request';

interface TMessageUploadParams {
  uploadUrl: string;
  file: File;
}

export interface TMessageUploadResponse {
  code: number;
  imgDetail: string;
}

/**
 * 站内信图片上传
 * - 使用 FormData 传 file 字段
 * - 其余 version / visitSource / visitType 由 sharedData 自动注入
 */
export const messageUploadReq = ({ uploadUrl, file }: TMessageUploadParams) => {
  const formData = new FormData();
  formData.append('file', file);
  // 'https://upload.hhg335.com/api/messageUpload'
  return request.post<unknown, FormData>(uploadUrl, {
    body: formData,
  }) as unknown as Promise<TMessageUploadResponse>;
};
