import type { Plugin } from 'vite';

/**
 * Vite 插件：在浏览器控制台输出红色大字提示
 */
export default function consoleWarningPlugin(): Plugin {
  return {
    name: 'console-warning',
    transformIndexHtml(html) {
      const warningScript = `
        <script>
          (function() {
            console.log(
              '%c提交代码前请记得清理各自的测试输出！',
              'color: red; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(255,0,0,0.5);'
            );
          })();
        </script>
      `;
      return html.replace('<head>', `<head>${warningScript}`);
    },
  };
}
