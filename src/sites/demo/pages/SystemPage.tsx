import React from 'react';

import { ClientOnly } from '@/common/components/ClientOnly';

import { useAppSelector } from '@/core/store/hooks';
import { FontScaleType } from '@/utils/constants/system';

import { useSystem } from '@/common/hooks/useSystem';

/**
 * 系统配置demo页
 */
const SystemPage: React.FC = () => {
  const { fontScaleType, themeMode, language } = useAppSelector((state) => state.config.system);
  const { setFontScaleType, setTheme, setLanguage } = useSystem();
  return (
    <div>
      <h1>系统配置demo页</h1>
      <ClientOnly>
        <div>
          <section>
            <p className={'_tf[16]'}>字体缩放: {fontScaleType}</p>
            <button onClick={() => setFontScaleType(FontScaleType.MEDIUM)}>切换字体缩放</button>
          </section>
          <section>
            <p className={'_tf[16]'}>主题: {themeMode}</p>
            <button onClick={() => setTheme('dark')}>暗色主题</button>
            <button onClick={() => setTheme('light')}>亮色主题</button>
          </section>
          <section>
            <button onClick={() => setLanguage('zh')}>中文</button>
            <button onClick={() => setLanguage('en')}>English</button>
            <button onClick={() => setLanguage('vi')}>Tiếng Việt</button>
            <span>当前语言: {language}</span>
          </section>
        </div>
      </ClientOnly>
    </div>
  );
};

export default SystemPage;
