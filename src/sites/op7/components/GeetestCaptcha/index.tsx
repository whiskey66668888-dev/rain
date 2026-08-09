'use client';

import React, { useEffect, useMemo, useRef } from 'react';

import siteConfig from '../../site.config';
import type { GeetestCaptchaResult } from '@/common/components/GeetestCaptcha';

/**
 * 极验验证码对象接口
 */
interface GeetestCaptchaObject {
  destroy: () => void;
  appendTo: (element: HTMLElement | string) => GeetestCaptchaObject;
  onReady: (callback: () => void) => GeetestCaptchaObject;
  onNextReady: (callback: () => void) => GeetestCaptchaObject;
  onBoxShow: (callback: () => void) => GeetestCaptchaObject;
  onError: (callback: (error: unknown) => void) => GeetestCaptchaObject;
  onSuccess: (callback: () => void) => GeetestCaptchaObject;
  onClose: (callback: () => void) => GeetestCaptchaObject;
  showCaptcha: () => void;
  getValidate: () => GeetestCaptchaResult | null;
}

interface GeetestCaptchaHandler {
  (captchaObj: GeetestCaptchaObject): void;
}

interface GeetestCaptchaProps {
  visible: boolean;
  handler?: GeetestCaptchaHandler;
  onSuccess?: (result: GeetestCaptchaResult) => void;
  onClose?: () => void;
}

declare global {
  interface Window {
    initGeetest4?: (
      config: {
        captchaId: string;
        language?: string;
        product?: string;
        protocol?: string;
      },
      handler: GeetestCaptchaHandler,
    ) => void;
    captchaObj?: GeetestCaptchaObject;
  }
}

const GeetestCaptcha: React.FC<GeetestCaptchaProps> = ({
  visible,
  handler,
  onSuccess,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const captchaObjRef = useRef<GeetestCaptchaObject | null>(null);

  // 从 site.config 获取配置（useMemo 避免 useEffect 依赖每次渲染变化）
  const captchaConfig = useMemo(
    () => ({
      captchaId: siteConfig.captcha?.geetest?.captchaId || '28e6e3d5493ab7b717eb71827fda4ea4',
      language: siteConfig.captcha?.geetest?.language || 'zh',
      product: siteConfig.captcha?.geetest?.product || 'bind',
      protocol: siteConfig.captcha?.geetest?.protocol || 'https://',
    }),
    [],
  );

  useEffect(() => {
    if (!visible || !window.initGeetest4) {
      return;
    }

    // 如果已经存在验证码对象，先销毁
    if (captchaObjRef.current) {
      try {
        captchaObjRef.current.destroy();
      } catch (e) {
        console.error('销毁验证码失败:', e);
      }
      captchaObjRef.current = null;
    }

    // 初始化极验验证码
    try {
      window.initGeetest4(captchaConfig, (captchaObj: GeetestCaptchaObject) => {
        captchaObjRef.current = captchaObj;
        window.captchaObj = captchaObj;

        // 绑定事件
        captchaObj
          .appendTo(containerRef.current || '#captcha')
          .onReady(() => {
            console.log('Geetest验证码准备就绪');
            captchaObj.showCaptcha();
          })
          .onNextReady(() => {
            console.log('Geetest验证码下一步准备就绪');
          })
          .onBoxShow(() => {
            console.log('Geetest验证码弹窗显示');
          })
          .onError((e: unknown) => {
            console.error('Geetest验证码错误:', e);
          })
          .onSuccess(() => {
            console.log('Geetest验证码验证成功');
            const result = captchaObj.getValidate();
            if (result && onSuccess) {
              onSuccess(result);
            }
          })
          .onClose(() => {
            console.log('Geetest验证码关闭');
            if (captchaObjRef.current) {
              captchaObjRef.current.destroy();
              captchaObjRef.current = null;
            }
            if (onClose) {
              onClose();
            }
          });

        // 调用外部处理器
        if (handler) {
          handler(captchaObj);
        }
      });
    } catch (error) {
      console.error('初始化Geetest验证码失败:', error);
    }

    // 清理函数
    return () => {
      if (captchaObjRef.current) {
        try {
          captchaObjRef.current.destroy();
        } catch (e) {
          console.error('清理验证码失败:', e);
        }
        captchaObjRef.current = null;
      }
    };
  }, [visible, handler, onSuccess, onClose, captchaConfig]);

  if (!visible) {
    return null;
  }

  return <div id="captcha" ref={containerRef} className="geetest-captcha-container" />;
};

export default GeetestCaptcha;
