import { useEffect, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { COLORS } from '@/constants/colors';

type HtmlWebViewContentProps = {
  html?: string;
  onImagePress?: (uri: string) => void;
};

const setupContentJS = `
  (function() {
    var content = document.getElementById('content');
    if (!content) return;

    var hasTable = false;
    var maxWidth = content.offsetWidth || window.innerWidth || 0;

    content.querySelectorAll('table').forEach(function(table) {
      hasTable = true;
      if (table.parentElement && !table.parentElement.classList.contains('table-scroll')) {
        var wrap = document.createElement('div');
        wrap.className = 'table-scroll';
        table.parentNode.insertBefore(wrap, table);
        wrap.appendChild(table);
      }
      maxWidth = Math.max(maxWidth, Math.ceil(table.scrollWidth) + 20);
    });

    var height = Math.ceil(Math.max(content.scrollHeight, content.offsetHeight) + 20);

    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'size',
      width: maxWidth,
      height: height,
      hasTable: hasTable
    }));
  })();
  true;
`;

export function HtmlWebViewContent({ html, onImagePress }: HtmlWebViewContentProps) {
  const [contentSize, setContentSize] = useState({ width: 0, height: 0 });
  const [containerWidth, setContainerWidth] = useState(0);
  const [hasTable, setHasTable] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const lastRemeasureWidth = useRef(0);

  useEffect(() => {
    setContentSize({ width: 0, height: 0 });
    setHasTable(false);
    lastRemeasureWidth.current = 0;
  }, [html, containerWidth]);

  const canScrollHorizontally =
    hasTable && containerWidth > 0 && contentSize.width > containerWidth + 2;
  const webViewWidth = canScrollHorizontally
    ? Math.max(contentSize.width, containerWidth)
    : Math.max(containerWidth, 1);
  const ready = contentSize.height > 0 && containerWidth > 0;

  useEffect(() => {
    if (!ready || !html) {
      return;
    }

    if (webViewWidth <= lastRemeasureWidth.current + 2) {
      return;
    }

    lastRemeasureWidth.current = webViewWidth;
    const timer = setTimeout(() => {
      webViewRef.current?.injectJavaScript(setupContentJS);
    }, 120);

    return () => clearTimeout(timer);
  }, [ready, webViewWidth, html]);

  if (!html) {
    return null;
  }

  // Text wraps to the visible card width; only tables may extend past it.
  const textColumnWidth = Math.max(containerWidth, 1);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=${textColumnWidth}, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body {
            width: ${textColumnWidth}px;
            margin: 0;
            height: auto !important;
            overflow: visible;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #111;
            background-color: ${COLORS.infoCardBg};
            padding: 10px;
            -webkit-text-size-adjust: 100%;
            text-size-adjust: 100%;
            -webkit-user-select: none;
            user-select: none;
            -webkit-touch-callout: none;
          }
          #content {
            width: ${textColumnWidth - 20}px;
            max-width: ${textColumnWidth - 20}px;
            overflow: visible;
          }
          h1, h2, h3, h4, h5, h6 { color: #111; margin: 10px 0; font-size: 16px; }
          p { margin: 10px 0; }
          ul, ol { margin: 10px 0; padding-left: 20px; }
          li { margin: 4px 0; }
          .table-scroll {
            width: max-content;
            max-width: none;
            margin: 10px 0;
          }
          table {
            width: max-content;
            border-collapse: collapse;
            margin: 0;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            white-space: nowrap;
          }
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
        width?: number;
        height?: number;
        hasTable?: boolean;
      };

      if (data.type === 'size' && typeof data.width === 'number' && typeof data.height === 'number') {
        setContentSize({
          width: Math.max(data.width, 1),
          height: Math.max(data.height, 1),
        });
        setHasTable(Boolean(data.hasTable));
      } else if (data.type === 'imagePress' && typeof data.value === 'string' && onImagePress) {
        onImagePress(data.value);
      }
    } catch {
      // Ignore malformed WebView messages.
    }
  };

  const onLoadEnd = () => {
    setTimeout(() => {
      webViewRef.current?.injectJavaScript(setupContentJS);
    }, 250);
    setTimeout(() => {
      webViewRef.current?.injectJavaScript(setupContentJS);
    }, 700);
  };

  // Wait for card width so text wraps correctly from the first paint.
  if (containerWidth <= 0) {
    return (
      <View
        style={styles.webViewContainer}
        onLayout={(event) => {
          const nextWidth = Math.round(event.nativeEvent.layout.width);
          if (nextWidth > 0) {
            setContainerWidth(nextWidth);
          }
        }}
      />
    );
  }

  return (
    <View
      style={styles.webViewContainer}
      onLayout={(event) => {
        const nextWidth = Math.round(event.nativeEvent.layout.width);
        if (nextWidth > 0 && nextWidth !== containerWidth) {
          setContainerWidth(nextWidth);
        }
      }}>
      {canScrollHorizontally ? (
        <Text style={styles.scrollHint}>
          Swipe the table sideways for more columns. To move the page, scroll beside the table.
        </Text>
      ) : null}

      <ScrollView
        horizontal
        bounces={false}
        directionalLockEnabled
        nestedScrollEnabled
        scrollEnabled={canScrollHorizontally}
        showsHorizontalScrollIndicator={canScrollHorizontally}
        showsVerticalScrollIndicator={false}>
        <WebView
          key={`html-${containerWidth}`}
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
            {
              width: webViewWidth,
              height: contentSize.height > 0 ? contentSize.height : 1,
              opacity: ready ? 1 : 0,
            },
          ]}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  webViewContainer: {
    width: '100%',
    minHeight: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },
  webView: {
    backgroundColor: 'transparent',
  },
  scrollHint: {
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.textGrey,
    paddingHorizontal: 4,
    paddingBottom: 6,
    ...Platform.select({
      ios: { fontStyle: 'italic' },
      default: {},
    }),
  },
});
