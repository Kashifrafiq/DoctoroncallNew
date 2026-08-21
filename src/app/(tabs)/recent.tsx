import Entypo from '@expo/vector-icons/Entypo';
import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PrimaryCard } from '@/components/cards/primary-card';
import { Header } from '@/components/headers/header';
import { COLORS } from '@/constants/colors';
import { getDiseasesCatogery } from '@/hooks/api/diseases';
import { getdrugsCatogery } from '@/hooks/api/drugs';
import { getData } from '@/services/local-storage';
import type { RecentDiseaseItem } from '@/types/cards';
import type { CategoryItem } from '@/types/catalog';

type RecentStorageItem = RecentDiseaseItem | string | number;

function extractTextFromTaxonomy(taxonomy?: string): string {
  if (!taxonomy) {
    return '';
  }

  return taxonomy.split('_')[0] ?? '';
}

function getRecentCategoryIds(recentData: RecentStorageItem[] | null): Set<string | number> {
  if (!recentData?.length) {
    return new Set();
  }

  return new Set(
    recentData.map((item) =>
      typeof item === 'object' && item !== null && 'catId' in item ? item.catId : item,
    ),
  );
}

export default function RecentScreen() {
  const [diseaseData, setDiseaseData] = useState<CategoryItem[]>([]);
  const [drugsData, setDrugsData] = useState<CategoryItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [recentList, setRecentList] = useState<CategoryItem[]>([]);
  const [displayData, setDisplayData] = useState<CategoryItem[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const applySearch = useCallback((text: string, source: CategoryItem[]) => {
    if (!text.trim()) {
      setDisplayData(source);
      return;
    }

    const query = text.toLowerCase();
    setDisplayData(source.filter((item) => item.name.toLowerCase().includes(query)));
  }, []);

  const filterData = useCallback(async () => {
    try {
      const recentData = await getData<RecentStorageItem[]>('recent');
      const catIdSet = getRecentCategoryIds(recentData);

      const filteredDiseases = diseaseData.filter((disease) => catIdSet.has(disease.id));
      const filteredDrugs = drugsData.filter((drug) => catIdSet.has(drug.id));
      const mergedData = [...filteredDiseases, ...filteredDrugs];

      setRecentList(mergedData);
      applySearch(searchText, mergedData);
    } catch (error) {
      console.error('Error filtering data:', error);
    }
  }, [applySearch, diseaseData, drugsData, searchText]);

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [diseases, drugs] = await Promise.all([getDiseasesCatogery(), getdrugsCatogery()]);
      setDiseaseData(diseases);
      setDrugsData(drugs);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleSearch = (text: string) => {
    setSearchText(text);
    applySearch(text, recentList);
  };

  const handleRefresh = useCallback(async () => {
    await fetchData();
    if (isDataLoaded) {
      await filterData();
    }
  }, [fetchData, filterData, isDataLoaded]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (diseaseData.length > 0 && drugsData.length > 0) {
      setIsDataLoaded(true);
    }
  }, [diseaseData, drugsData]);

  useEffect(() => {
    if (isDataLoaded) {
      filterData();
    }
  }, [isDataLoaded, filterData]);

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.contentContainer}>
        <View style={styles.textInputContainer}>
          <Entypo name="magnifying-glass" size={20} color={COLORS.darkGrey} />
          <TextInput
            style={styles.inputText}
            placeholder="Search recent items"
            placeholderTextColor={COLORS.darkGrey}
            value={searchText}
            onChangeText={handleSearch}
          />
        </View>

        <Text style={styles.headingText}>Recently Opened</Text>

        {displayData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No recent items</Text>
            <Text style={styles.emptySubText}>Your recently viewed items will appear here</Text>
          </View>
        ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={displayData}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            numColumns={2}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <PrimaryCard
                mainText={item.name}
                secondaryText={String(item.count)}
                img={item.imageUrl}
                paid={false}
                bgColor={item.color}
                id={item.id}
                type={extractTextFromTaxonomy(item.taxonomy)}
                rcntScreen
              />
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  textInputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputTextBg,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputText: {
    flex: 1,
    color: COLORS.darkGrey,
    fontSize: 16,
    marginLeft: 12,
  },
  headingText: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.textGrey,
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: Platform.OS === 'android' ? 120 : 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textGrey,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.darkGrey,
    textAlign: 'center',
  },
});
