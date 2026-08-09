import { useMemo, useRef, useState } from 'react';
// components
import { toast } from '@/common/components/Toast';
import Button from '@/common/components/Button';

// utis
import html2canvas from 'html2canvas';
import fileSaver from 'file-saver';
import { copyToClipboard } from '@/utils';

import { ClientOnly } from '@/common/components/ClientOnly';
import Overlay from '@/common/components/Overlay';
import { zIndexMap } from '@/utils/constants/zIndex';
import { useAppSelector } from '@/core/store/hooks';
import { getSystemTheme } from '@/utils';

// css
import styles from './index.module.scss';
import LazyImage from '@/common/components/LazyImage';
import { ModalCloseButton } from '@/sites/op7/components/themeIcon';

// 永久网址弹窗
const PermanentModal = () => {
  const { saveAs } = fileSaver;
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const theme = themeMode === 'system' ? getSystemTheme() : themeMode;
  const isDark = useMemo(() => theme === 'dark', [theme]);

  const [visible, setVisible] = useState(false);

  const inviteImageRef = useRef<HTMLDivElement>(null);
  const urlArr = ['op7.io', 'op7.vip'];

  // 处理图片下载 - 使用 file-saver 库
  const handleDownloadImage = async () => {
    if (!inviteImageRef.current) return;

    try {
      // 使用html2canvas将DOM元素转换为canvas
      const canvas = await html2canvas(inviteImageRef.current, {
        useCORS: true, // 允许跨域图片
        scale: 3,
        backgroundColor: null, // 透明背景
      });

      // 在非 Flutter 环境中，保存为文件
      canvas.toBlob((blob) => {
        if (blob) {
          // 使用 file-saver 保存为文件
          saveAs(blob, `永久域名.png`);
          toast({ type: 'success', description: '图片已保存' });
        } else {
          toast({ type: 'warning', description: '保存失败，请重试' });
        }
      }, 'image/png');
    } catch (error) {
      console.error('处理图片失败:', error);
      toast({ type: 'warning', description: '操作失败，请重试' });
    }
  };

  const onCopy = async (text: string) => {
    await copyToClipboard(text);
    toast({
      title: '复制成功',
      type: 'success',
    });
  };

  return (
    <>
      <span onClick={() => setVisible(true)} className={styles.address}>
        网址：op7.io
      </span>
      <ClientOnly>
        <Overlay
          show={visible}
          close={() => setVisible(false)}
          position="center"
          maskClickClose
          zIndex={zIndexMap.walletSubModal}
        >
          <div className={styles.mask_content} ref={inviteImageRef}>
            <div className={styles.heder_view}>
              <LazyImage
                className={styles.header_title_img}
                src="/images/common/finance/permanent_modal_title.svg"
                width={209}
                height={20}
                lazy={false}
                alt=""
              />

              <ModalCloseButton onClick={() => setVisible(false)} />
            </div>

            <div className={styles.content_view}>
              <div className={styles.item_title}>1.通过桌面图标上的网站，重新下载APP：</div>
              <div className={styles.item_one_value}>
                <LazyImage
                  src="/images/common/finance/logo.png"
                  width={30}
                  height={30}
                  lazy={false}
                  alt=""
                />
                <div className={styles.textBox}>
                  <div className={styles.text}>
                    <span>op7.io</span>
                    <LazyImage
                      src={`/images/common/finance/search_${isDark ? 'dark' : 'light'}.svg`}
                      width={10}
                      height={10}
                      lazy={false}
                      alt=""
                    />
                  </div>
                </div>
              </div>
              <div className={styles.item_title}>2.记得您的官网网站，随时畅玩：</div>
              <ul className={styles.item_sencond_value}>
                {urlArr.map((it, index) => {
                  return (
                    <li
                      key={index}
                      onClick={() => {
                        onCopy(it);
                      }}
                    >
                      <div className={styles.item_sencond_content}>
                        <p>{it}</p>
                        <LazyImage
                          src="/images/common/copy.svg"
                          width={14}
                          height={14}
                          lazy={false}
                          alt=""
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className={styles.bnt_list}>
                <Button
                  className={styles.button}
                  type="second"
                  onClick={() => {
                    handleDownloadImage();
                  }}
                >
                  保存至相册
                </Button>
                <Button
                  className={styles.button}
                  onClick={() => {
                    onCopy('官方永久网址: \n1.op7.io\n2.op7.app');
                  }}
                >
                  一键复制
                </Button>
              </div>
            </div>
          </div>
        </Overlay>
      </ClientOnly>
    </>
  );
};

export default PermanentModal;
