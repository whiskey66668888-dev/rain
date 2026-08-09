import type { Plugin } from 'vite';

export default function reactInspectorHotkeyPlugin(): Plugin {
  return {
    name: 'react-inspector-hotkey',
    apply: 'serve',
    transformIndexHtml(html) {
      const script = `
        <script>
          (function() {
            function findInspectorTarget(event) {
              var path = typeof event.composedPath === 'function' ? event.composedPath() : [];

              for (var i = 0; i < path.length; i += 1) {
                var node = path[i];
                if (node && node.nodeType === 1 && node.getAttribute('data-react-inspector')) {
                  return node;
                }
              }

              var target = event.target && event.target.nodeType === 1 ? event.target : null;
              return target && target.closest ? target.closest('[data-react-inspector]') : null;
            }

            document.addEventListener(
              'click',
              function(event) {
                if (!event.altKey) {
                  return;
                }

                var target = findInspectorTarget(event);
                if (!target) {
                  return;
                }

                var file = target.getAttribute('data-react-inspector');
                if (!file) {
                  return;
                }

                event.preventDefault();
                event.stopPropagation();
                fetch('/__react-inspector-launch-editor?file=' + encodeURIComponent(file));
              },
              true
            );

            console.info('[React Inspector] Hold Alt and click an element to open its source file.');
          })();
        </script>
      `;

      return html.replace('</body>', `${script}</body>`);
    },
  };
}
