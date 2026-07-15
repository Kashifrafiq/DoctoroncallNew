import AntDesign from '@expo/vector-icons/AntDesign';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ImageViewing from 'react-native-image-viewing';
import { SafeAreaView } from 'react-native-safe-area-context';

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

export default function DiseaseInfoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<DiseaseInfoParams>();
  const [viewingImage, setViewingImage] = useState<string | null>(null);

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
    <SafeAreaView style={styles.mainContainer} edges={['top', 'left', 'right']}>
      <Header />

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

      <Pressable style={styles.header} onPress={() => router.back()}>
        <AntDesign name="arrow-left" size={30} color={COLORS.textGrey} />
        <Text style={styles.headingText}>{params.name}</Text>
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
  },
  header: {
    width: '90%',
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headingText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textGrey,
    marginLeft: 5,
    flex: 1,
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
