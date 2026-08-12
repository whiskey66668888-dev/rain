import pako from 'pako';

import type { RequestConf } from './config';
import { basicConfig } from './config';
import { ResponseData } from './model';

// pako 类型定义
interface PakoType {
  inflate: (data: Uint8Array | ArrayBuffer) => Uint8Array;
  gzip: (data: Uint8Array | ArrayBuffer | string) => Uint8Array;
}

export function getBaseUrl(url: string, _config: RequestConf = basicConfig): string {
  // SPA：相对路径走当前站点 / Vite 代理
  return url;
}

// 头部
export function getHeaders(data: HeadersInit = {}, config: RequestConf = basicConfig): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  return {
    ...headers,
    ...config.sharedHeaders(),
    ...data,
  };
}

// 获取url query参数
export function getQueryString(name: string, uri?: string): string {
  const url = uri ? uri : window.location.href;
  const query = url.split('?')[1];

  if (query) {
    const vars = query.split('&');
    for (let i = 0; i < vars.length; i++) {
      const pair = vars[i]?.split('=');
      if (pair?.[0] === name) {
        return pair[1] ?? '';
      }
    }
  }
  return '';
}

interface EncryptionData {
  [key: string]: string | number | boolean | null | undefined;
}

export const encryption = {
  /**
   * @description base64编码转换
   * @param {String} data base64编码PB数据
   * @return {Object} 转换后的Json对象数据
   */
  unzip_data<T>(data: string): ResponseData<T> | string {
    let res: ResponseData<T> | string = '';
    try {
      if (data) {
        const binData = this.to_Uint8Array(data);
        if (binData) {
          // pako.inflate 返回 Uint8Array
          const pakoTyped = pako as unknown as PakoType;
          const decodedData: Uint8Array = pakoTyped.inflate(binData);
          const decodedString = new TextDecoder().decode(decodedData);
          if (decodedString) {
            res = JSON.parse(decodeURIComponent(decodedString)) as ResponseData<T>;
          }
        }
      } else {
        res = data;
      }
    } catch (_error) {
      console.log('unzip_data error!');
    }
    return res;
  },
  /**
   * @description: base64编码PB数据转换
   * @param {String} b64Data base64编码PB数据
   * @return {Array} 转换后的字节数组
   */
  to_Uint8Array(b64Data: string): Uint8Array | null {
    let ret: Uint8Array | null = null;
    // Decode base64 (convert ascii to binary)
    const strData = atob(b64Data);
    if (strData) {
      // Convert binary string to character-number array
      const charData = strData.split('').map(function (x) {
        return x.charCodeAt(0);
      });
      if (charData) {
        // Turn number array into byte-array
        const binData = new Uint8Array(charData);
        ret = binData;
      }
    }
    return ret;
  },

  /**
   * @description compress data
   * @param {Object} data
   * @returns {String} base64编码数据
   */
  zip_data<T extends EncryptionData>(data: T): string | null {
    let res: string | null = null;
    try {
      if (data) {
        // Convert JSON object to string
        const strData = JSON.stringify(data);
        if (strData) {
          // Convert string to Uint8Array
          const uint8Data = new TextEncoder().encode(strData);
          if (uint8Data) {
            // Compress data using pako
            const pakoTyped = pako as unknown as PakoType;
            const compressedData: Uint8Array = pakoTyped.gzip(uint8Data);
            // Convert compressed data to base64
            res = this.from_Uint8Array(compressedData);
          }
        }
      }
    } catch (_error) {
      console.log('zip_data error!');
    }
    return res;
  },

  from_Uint8Array(uint8Data: Uint8Array): string {
    // Convert byte-array to number array
    const numData = Array.from(uint8Data);
    // Convert number array to binary string
    const binData = String.fromCharCode.apply(null, numData);
    // Encode binary string to base64
    return btoa(binData);
  },
};

export const uuid = (lowercase = false): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string) => {
    const r = (Math.random() * 16) | 0;
    const result = (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    return lowercase ? result : result.toUpperCase();
  });
};

export const readUUID = (): string | null => {
  const UUID = uuid();
  try {
    if (localStorage.getItem('_uuid')) {
      return localStorage.getItem('_uuid');
    } else {
      localStorage.setItem('_uuid', UUID);
      return UUID;
    }
  } catch (_e) {
    return UUID;
  }
};
