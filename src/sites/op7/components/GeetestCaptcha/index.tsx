'use client';

import React, { useEffect, useMemo, useRef } from 'react';

import siteConfig from '../../site.config';
import type { GeetestCaptchaResult } from '@/common/components/GeetestCaptcha';

const GEETEST4_SCRIPT_SRC = 'https://static.geetest.com/v4/gt4.js';
let geetest4ScriptPromise: Promise<void> | null = null;

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

const destroyCaptchaObject = (
  captchaObjRef: React.MutableRefObject<GeetestCaptchaObject | null>,
) => {
  if (!captchaObjRef.current) return;

  try {
    captchaObjRef.current.destroy();
  } catch (error) {
    console.error('销毁验证码失败:', error);
  }
  captchaObjRef.current = null;
};

const loadGeetest4Script = (): Promise<void> => {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (window.initGeetest4) {
    return Promise.resolve();
  }

  if (geetest4ScriptPromise) {
    return geetest4ScriptPromise;
  }

  geetest4ScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${GEETEST4_SCRIPT_SRC}"]`,
    );

    const script: HTMLScriptElement = existingScript ?? document.createElement('script');

    const cleanup = () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
    };

    const handleLoad = () => {
      cleanup();
      script.setAttribute('data-loaded', 'true');
      resolve();
    };

    const handleError = () => {
      cleanup();
      geetest4ScriptPromise = null;
      reject(new Error('Geetest4 脚本加载失败'));
    };

    if (window.initGeetest4 || script.getAttribute('data-loaded') === 'true') {
      resolve();
      return;
    }

    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);

    if (!existingScript) {
      script.src = GEETEST4_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  });

  return geetest4ScriptPromise;
};

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
    if (!visible) {
      return;
    }

    let cancelled = false;

    const initCaptcha = async () => {
      try {
        await loadGeetest4Script();

        if (cancelled || !window.initGeetest4) {
          return;
        }

        destroyCaptchaObject(captchaObjRef);

        window.initGeetest4(captchaConfig, (captchaObj: GeetestCaptchaObject) => {
          if (cancelled) {
            try {
              captchaObj.destroy();
            } catch (error) {
              console.error('取消后销毁验证码失败:', error);
            }
            return;
          }

          captchaObjRef.current = captchaObj;
          window.captchaObj = captchaObj;

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
            .onError((error: unknown) => {
              console.error('Geetest验证码错误:', error);
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
              destroyCaptchaObject(captchaObjRef);
              if (onClose) {
                onClose();
              }
            });

          if (handler) {
            handler(captchaObj);
          }
        });
      } catch (error) {
        console.error('初始化Geetest验证码失败:', error);
      }
    };

    void initCaptcha();

    return () => {
      cancelled = true;
      destroyCaptchaObject(captchaObjRef);
    };
  }, [visible, handler, onSuccess, onClose, captchaConfig]);

  if (!visible) {
    return null;
  }

  return <div id="captcha" ref={containerRef} className="geetest-captcha-container" />;
};

export default GeetestCaptcha;
