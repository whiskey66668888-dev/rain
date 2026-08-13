import { useCallback } from 'react';
import fileSaver from 'file-saver';

import { toast } from '@/common/components/Toast';
import useFlutterBridge from '@/sites/op7/hooks/useFlutterBridge';

/**
 * 分享海报截图保存：html2canvas 截取 → Flutter 内走 downloadFriendPic，否则浏览器下载。
 * 成功返回 true（静默，由调用方决定是否 toast）；失败内部已 toast。
 * 串关等长图会按元素完整尺寸截取（不受视口裁剪影响）。
 */
export const useSharePosterSave = () => {
  const { sendToFlutter, isInFlutter } = useFlutterBridge();

  return useCallback(
    async (el: HTMLElement | null, filename: string): Promise<boolean> => {
      if (!el) {
        toast({ type: 'warning', description: '保存失败，请重试' });
        return false;
      }
      let canvas: HTMLCanvasElement;
      try {
        const { default: html2canvas } = await import('html2canvas');
        canvas = await html2canvas(el, { useCORS: true, scale: 3, backgroundColor: null });
      } catch {
        toast({ type: 'warning', description: '保存失败，请重试' });
        return false;
      }
      try {
        if (isInFlutter()) {
          sendToFlutter('downloadFriendPic', { imageBase64: canvas.toDataURL('image/png') });
          return true;
        }
        return await new Promise<boolean>((resolve) => {
          canvas.toBlob((blob) => {
            if (blob) {
              fileSaver.saveAs(blob, filename);
              resolve(true);
            } else {
              toast({ type: 'warning', description: '保存失败，请重试' });
              resolve(false);
            }
          }, 'image/png');
        });
      } catch {
        toast({ type: 'warning', description: '保存失败，请重试' });
        return false;
      }
    },
    [isInFlutter, sendToFlutter],
  );
};

export default useSharePosterSave;
