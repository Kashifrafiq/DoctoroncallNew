import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "../../components/header/Header";
import DiseaseHeader from "../../components/header/DiseaseHeader";
import Icon from "react-native-vector-icons/AntDesign";
import { COLORS } from "../../assets/color/COLOR";
import { useNavigation, useRoute } from "@react-navigation/native";
// import HTMLView from 'react-native-htmlview';
import { ScrollView } from "react-native-gesture-handler";
import WebView from "react-native-webview";
import ImageViewing from "react-native-image-viewing";

const HTMLWebViewContent = ({ html, onImagePress }) => {
  const [contentHeight, setContentHeight] = useState(0);
  const webViewRef = useRef(null);

  useEffect(() => {
    setContentHeight(0);
  }, [html]);

  if (!html) return null;

  const measureHeightJS = `
    (function() {
      var content = document.getElementById('content');
      if (!content) return;
      var h = content.offsetHeight + 20;
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'height', value: h }));
    })();
    true;
  `;

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
           background-color: ${COLORS.infocardBG};
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

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "height" && typeof data.value === "number" && data.value > 0) {
        setContentHeight(data.value);
      } else if (data.type === "imagePress" && data.value && onImagePress) {
        onImagePress(data.value);
      }
    } catch (_e) {}
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
};

const InfoCard = ({ property, desc, onImagePress }) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <View style={styles.inforcardContainer}>
      <TouchableOpacity
        onPress={() => setShowInfo(!showInfo)}
        style={styles.inforcardinnerContainer}
      >
        <Text style={styles.inforcardText}>{property}</Text>
        <View>
          <Icon
            name={showInfo ? "up" : "down"}
            size={16}
            color={COLORS.textgrey}
          />
        </View>
      </TouchableOpacity>

      {showInfo ? (
        <View style={styles.inforcardTextArea}>
          <HTMLWebViewContent html={desc} onImagePress={onImagePress} />
        </View>
      ) : null}
    </View>
  );
};

const DiseaseInfoScreen = () => {
  const navigation = useNavigation();
  const [viewingImage, setViewingImage] = useState(null);

  const route = useRoute();
  const data = route.params;

  /** Prefer backend `sections: { header, htmlContent }[]`; fallback to legacy acf Q&A. */
  const sectionRows = useMemo(() => {
    if (Array.isArray(data?.sections) && data.sections.length > 0) {
      return data.sections.map((s) => ({
        header: s.header ?? s.question ?? "",
        htmlContent: s.htmlContent ?? s.answer ?? "",
      }));
    }
    const qa = data?.acf?.["questions_&_answers"] ?? [];
    return qa.map((row) => ({
      header: row.header ?? row.question ?? "",
      htmlContent: row.htmlContent ?? row.answer ?? "",
    }));
  }, [data]);

  const onPressback = () => {
    navigation.goBack();
  };
  return (
    <View style={styles.mainContainer} showsVerticalScrollIndicator={false}>
      <Header />
      <DiseaseHeader
        img={data?.catData?.image}
        mainText={data?.catData?.heading}
        secText={data?.catData?.count}
        id={data?.catData?.diseaseId}
        diseaseID={data?.id}
        disable={false}
      />
      <TouchableOpacity style={styles.header} onPress={onPressback}>
        <Icon name={"arrowleft"} size={30} color={COLORS.textgrey} />
        <Text style={styles.HeadingText}>{data.name}</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* {data.shortDescription ? (
          <Text style={styles.summaryText}>{data.shortDescription}</Text>
        ) : null} */}

        <FlatList
          scrollEnabled={false}
          data={sectionRows}
          keyExtractor={(item, index) =>
            `${item.header ?? "section"}-${index}`
          }
          renderItem={({ item }) => (
            <InfoCard
              desc={item.htmlContent}
              property={item.header}
              onImagePress={setViewingImage}
            />
          )}
        />
      </ScrollView>

      <ImageViewing
        images={viewingImage ? [{ uri: viewingImage }] : []}
        imageIndex={0}
        visible={!!viewingImage}
        onRequestClose={() => setViewingImage(null)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
        presentationStyle="overFullScreen"
        HeaderComponent={() => (
          <View style={styles.imageViewerHeader}>
            <TouchableOpacity
              onPress={() => setViewingImage(null)}
              style={styles.imageViewerCloseButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close" size={26} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default DiseaseInfoScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    width: "100%",
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
  },
  header: {
    width: "90%",
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  HeadingText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textgrey,
    marginLeft: 5,
  },
  summaryText: {
    fontSize: 14,
    color: COLORS.textgrey,
    lineHeight: 22,
    marginBottom: 12,
    marginTop: 4,
  },
  inforcardContainer: {
    width: "100%",
    backgroundColor: COLORS.infocardBG,
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.nameCardBorder,
    borderRadius: 10,
    // Shadow properties for iOS
    ...Platform.select({
      ios: {
        shadowColor: "#000", // Shadow color
        shadowOffset: { width: 0, height: 2 }, // Shadow offset
        shadowOpacity: 0.1, // Shadow opacity (lower value for subtle shadow)
        shadowRadius: 4, // Shadow blur radius
      },
      android: {
        elevation: 4, // Shadow depth (higher value for more prominent shadow)
      },
    }),
  },
  inforcardinnerContainer: {
    width: "98%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },

  inforcardText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textgrey,
  },
  inforcardTextArea: {
    width: "90%",
    alignSelf: "center",
    marginBottom: 8,
  },
  infordescText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textgrey,
  },
  webViewContainer: {
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: COLORS.white,
  },
  webView: {
    width: "100%",
    backgroundColor: "transparent",
  },
  imageViewerHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === "ios" ? 54 : 18,
    paddingHorizontal: 12,
    zIndex: 2,
    alignItems: "flex-end",
  },
  imageViewerCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
});
