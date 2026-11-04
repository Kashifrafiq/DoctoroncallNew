import AntDesign from '@expo/vector-icons/AntDesign';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ImageViewing from 'react-native-image-viewing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { InfoCard } from '@/components/disease/info-card';
import { DiseaseHeader } from '@/components/headers/disease-header';
import { Header } from '@/components/headers/header';
import { COLORS } from '@/constants/colors';
import type { DiseaseCategoryParams, DiseaseSection } from '@/types/disease';
import { parseRouteJson } from '@/utils/route-params';

type DiseaseInfoParams = {
  id?: string;
  name?: string;
  shortDescription?: string;
  htmlContent?: string;
  acf?: string;
  catData?: string;
  sections?: string;
};

type AcfData = {
  'questions_&_answers'?: DiseaseSection[];
};

const CONTENT_BOTTOM_PADDING = 24;

export default function DiseaseInfoScreen() {
  const params = useLocalSearchParams<DiseaseInfoParams>();
  const insets = useSafeAreaInsets();
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const scrollBottomPadding = insets.bottom + CONTENT_BOTTOM_PADDING;

  const acf = parseRouteJson<AcfData>(params.acf);
  const catData = parseRouteJson<DiseaseCategoryParams>(params.catData);
  const sections = parseRouteJson<DiseaseSection[]>(params.sections);

  const sectionRows = useMemo(() => {
    if (Array.isArray(sections) && sections.length > 0) {
      return sections.map((section) => ({
        header: section.header ?? section.question ?? '',
        htmlContent: section.htmlContent ?? section.answer ?? '',
      }));
    }

    const qa = acf?.['questions_&_answers'] ?? [];
    return qa.map((row) => ({
      header: row.header ?? row.question ?? '',
      htmlContent: row.htmlContent ?? row.answer ?? '',
    }));
  }, [acf, sections]);

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Platform.OS === 'android' ? COLORS.white : undefined}
        translucent={false}
      />

      <Header showBack />

      <View style={styles.mainContainer}>
        {catData ? (
          <DiseaseHeader
            img={catData.image}
            mainText={catData.heading}
            secText={String(catData.count)}
            id={catData.diseaseId}
            diseaseID={params.id ?? 0}
            disable={false}
            type={catData.type}
          />
        ) : null}

        <Text style={styles.headingText}>{params.name}</Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          directionalLockEnabled
          contentContainerStyle={{ paddingBottom: scrollBottomPadding }}>
          <FlatList
            scrollEnabled={false}
            data={sectionRows}
            keyExtractor={(item, index) => `${item.header || 'section'}-${index}`}
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
          visible={Boolean(viewingImage)}
          onRequestClose={() => setViewingImage(null)}
          swipeToCloseEnabled
          doubleTapToZoomEnabled
          presentationStyle="overFullScreen"
          HeaderComponent={() => (
            <View style={styles.imageViewerHeader}>
              <Pressable
                onPress={() => setViewingImage(null)}
                style={styles.imageViewerCloseButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <AntDesign name="close" size={26} color={COLORS.white} />
              </Pressable>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  mainContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
  },
  headingText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textGrey,
    marginLeft: 5,
    marginTop: 10,
  },
  imageViewerHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === 'ios' ? 54 : 18,
    paddingHorizontal: 12,
    zIndex: 2,
    alignItems: 'flex-end',
  },
  imageViewerCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
