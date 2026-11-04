import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { NameCard } from '@/components/cards/name-card';
import { DiseaseHeader } from '@/components/headers/disease-header';
import { Header } from '@/components/headers/header';
import { COLORS } from '@/constants/colors';
import { getdiseases, getDiseasesByCategoryId } from '@/hooks/api/diseases';
import { getDrugs, getMedicinesByCategoryId } from '@/hooks/api/drugs';
import { getData } from '@/services/local-storage';
import type { FavoriteDiseaseItem } from '@/types/cards';
import type { DiseaseCategoryParams, DiseaseListItem } from '@/types/disease';
import {
  decodeRouteJson,
  decodeRouteParam,
  getRouteParam,
  normalizeFirebaseStorageUrl,
  parseRouteFlag,
} from '@/utils/route-params';

type ListRouteParams = {
  catData?: string;
  diseaseId?: string;
  image?: string;
  heading?: string;
  count?: string;
  type?: string;
  fvrtScreen?: string;
  rcntScreen?: string;
};

type ListCatData = {
  diseaseId: string;
  image?: string;
  heading: string;
  count: string;
  type: string;
  fvrtScreen?: string;
  rcntScreen?: string;
};

const LIST_BOTTOM_PADDING = 24;

export default function ListOfDiseasesScreen() {
  const params = useLocalSearchParams<ListRouteParams>();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<DiseaseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const isLoadingRef = useRef(false);
  const listBottomPadding = insets.bottom + LIST_BOTTOM_PADDING;

  const catData = useMemo<DiseaseCategoryParams>(() => {
    const fromJson = decodeRouteJson<ListCatData>(params.catData);

    const diseaseId = fromJson?.diseaseId ?? getRouteParam(params.diseaseId);
    const rawImage = fromJson?.image ?? decodeRouteParam(params.image);
    const heading = fromJson?.heading ?? getRouteParam(params.heading);
    const count = fromJson?.count ?? getRouteParam(params.count);
    const type = fromJson?.type ?? getRouteParam(params.type);
    const fvrtScreen = fromJson?.fvrtScreen
      ? fromJson.fvrtScreen === '1'
      : parseRouteFlag(params.fvrtScreen);
    const rcntScreen = fromJson?.rcntScreen
      ? fromJson.rcntScreen === '1'
      : parseRouteFlag(params.rcntScreen);

    return {
      diseaseId,
      image: normalizeFirebaseStorageUrl(rawImage),
      heading,
      count,
      type,
      fvrtScreen,
      rcntScreen,
    };
  }, [params.catData, params.diseaseId, params.image, params.heading, params.count, params.type, params.fvrtScreen, params.rcntScreen]);

  const { diseaseId, type, fvrtScreen, rcntScreen } = catData;

  const filterData = useCallback(
    async (allData: DiseaseListItem[], itemType: 'disease' | 'drug') => {
      try {
        if (fvrtScreen) {
          const favoriteData = await getData<(FavoriteDiseaseItem | string | number)[]>('fvrt');
          const diseaseIdSet = new Set(
            favoriteData?.map((item) =>
              typeof item === 'object' && item !== null && 'diseaseID' in item
                ? item.diseaseID
                : item,
            ),
          );
          return allData.filter((item) => diseaseIdSet.has(item.id));
        }

        if (rcntScreen) {
          const recentData = await getData<(FavoriteDiseaseItem | string | number)[]>('recent');
          const diseaseIdSet = new Set(
            recentData?.map((item) =>
              typeof item === 'object' && item !== null && 'diseaseID' in item
                ? item.diseaseID
                : item,
            ),
          );
          return allData.filter((item) => diseaseIdSet.has(item.id));
        }

        const belongsToCategory = (ids?: (string | number)[]) =>
          ids?.some((id) => String(id) === String(diseaseId)) ?? false;

        if (itemType === 'disease') {
          return allData.filter(
            (item) =>
              belongsToCategory(item.categoryIds) || belongsToCategory(item['disease-category']),
          );
        }

        return allData.filter(
          (item) => belongsToCategory(item.categoryIds) || belongsToCategory(item.drug_category),
        );
      } catch (error) {
        console.error('Error filtering data:', error);
        return [];
      }
    },
    [diseaseId, fvrtScreen, rcntScreen],
  );

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isLoadingRef.current) {
        return;
      }

      isLoadingRef.current = true;
      setLoading(true);

      try {
        const isDrugTab = type === 'drugs' || type === 'drug';
        const fromCategoryList = !fvrtScreen && !rcntScreen;

        if (fromCategoryList) {
          const rows = isDrugTab
            ? await getMedicinesByCategoryId(diseaseId)
            : await getDiseasesByCategoryId(diseaseId);

          if (isMounted) {
            setData(rows);
          }
          return;
        }

        const allData = isDrugTab ? await getDrugs() : await getdiseases();
        const filteredData = await filterData(allData, isDrugTab ? 'drug' : 'disease');

        if (isMounted) {
          setData(filteredData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        if (isMounted) {
          setData([]);
        }
      } finally {
        isLoadingRef.current = false;
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [diseaseId, type, fvrtScreen, rcntScreen, filterData]);

  const renderItem = useCallback(
    ({ item }: { item: DiseaseListItem }) => (
      <NameCard
        name={item.title.rendered}
        acf={item.acf}
        catData={{
          diseaseId: catData.diseaseId,
          image: catData.image,
          heading: catData.heading,
          count: catData.count,
          type: catData.type,
        }}
        id={item.id}
        sections={item.sections}
        shortDescription={item.shortDescription ?? ''}
        htmlContent={item.htmlContent ?? ''}
      />
    ),
    [catData],
  );



  return (

    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
       <StatusBar
        barStyle={Platform.OS === 'android' ? 'dark-content' : 'dark-content'}
        backgroundColor={Platform.OS === 'android' ? COLORS.black : undefined}
        translucent={false}
      />
      <Header showBack />

      <View style={styles.container}>


        <DiseaseHeader
          img={catData.image}
          mainText={catData.heading}
          secText={String(catData.count)}
          id={catData.diseaseId}
          disable
          type={catData.type}
        />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingBottom: listBottomPadding, paddingTop: 8 }}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews
            ListEmptyComponent={
              <Text style={styles.emptyText}>No items found in this category.</Text>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 15,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textGrey,
    marginTop: 24,
    fontSize: 16,
  },
});
