import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { COLORS } from '@/constants/colors';

type HtmlWebViewContentProps = {
  html?: string;
  onImagePress?: (uri: string) => void;
};

const measureHeightJS = `
  (function() {
    var content = document.getElementById('content');
    if (!content) return;
    var h = content.offsetHeight + 20;
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'height', value: h }));
  })();
  true;
`;

export function HtmlWebViewContent({ html, onImagePress }: HtmlWebViewContentProps) {
  const [contentHeight, setContentHeight] = useState(0);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    setContentHeight(0);
  }, [html]);

  if (!html) {
    return null;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { width: 100%; height: auto !important; overflow: visible; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #111;
            background-color: ${COLORS.infoCardBg};
            padding: 10px;
            -webkit-user-select: none;
            user-select: none;
            -webkit-touch-callout: none;
          }
          h1, h2, h3, h4, h5, h6 { color: #111; margin: 10px 0; }
          p { margin: 10px 0; }
          ul, ol { margin: 10px 0; padding-left: 20px; }
          li { margin: 4px 0; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f0f0f0; }
          img { max-width: 100%; width: 100%; height: auto; display: block; border-radius: 4px; margin: 10px 0; }
          a { color: #d63384; text-decoration: none; }
          pre { overflow-x: auto; background: #efefef; padding: 8px; border-radius: 4px; }
          code { background: #efefef; padding: 2px 4px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div id="content">${html}</div>
        <script>
          document.addEventListener('click', function(e) {
            var el = e.target;
            if (el && el.tagName === 'IMG' && el.src) {
              e.preventDefault();
              window.ReactNativeWebView.postMessage(
                JSON.stringify({ type: 'imagePress', value: el.src })
              );
            }
          });
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as {
        type?: string;
        value?: number | string;
      };

      if (data.type === 'height' && typeof data.value === 'number' && data.value > 0) {
        setContentHeight(data.value);
      } else if (data.type === 'imagePress' && typeof data.value === 'string' && onImagePress) {
        onImagePress(data.value);
      }
    } catch {
      // Ignore malformed WebView messages.
    }
  };

  const onLoadEnd = () => {
    setTimeout(() => {
      webViewRef.current?.injectJavaScript(measureHeightJS);
    }, 250);
    setTimeout(() => {
      webViewRef.current?.injectJavaScript(measureHeightJS);
    }, 700);
  };

  return (
    <View style={styles.webViewContainer}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        onMessage={handleMessage}
        onLoadEnd={onLoadEnd}
        javaScriptEnabled
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        style={[
          styles.webView,
          { height: contentHeight > 0 ? contentHeight : 1, opacity: contentHeight > 0 ? 1 : 0 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  webViewContainer: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },
  webView: {
    width: '100%',
    backgroundColor: 'transparent',
  },
});
