import Entypo from '@expo/vector-icons/Entypo';
import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryCard } from '@/components/cards/primary-card';
import { Header } from '@/components/headers/header';
import { COLORS } from '@/constants/colors';
import { getDiseasesCatogery } from '@/hooks/api/diseases';
import { getdrugsCatogery } from '@/hooks/api/drugs';
import { getData } from '@/services/local-storage';
import type { CategoryItem } from '@/types/catalog';
import type { FavoriteDiseaseItem } from '@/types/cards';

function extractTextFromTaxonomy(taxonomy?: string): string {
  if (!taxonomy) {
    return '';
  }

  return taxonomy.split('_')[0] ?? '';
}

export default function FavoritesScreen() {
  const [diseaseData, setDiseaseData] = useState<CategoryItem[]>([]);
  const [drugsData, setDrugsData] = useState<CategoryItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [favoritesList, setFavoritesList] = useState<CategoryItem[]>([]);
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
      const favoriteData = await getData<FavoriteDiseaseItem[]>('fvrt');
      const catIdSet = new Set(favoriteData?.map((item) => item.catId));

      const filteredDiseases = diseaseData.filter((disease) => catIdSet.has(disease.id));
      const filteredDrugs = drugsData.filter((drug) => catIdSet.has(drug.id));
      const mergedData = [...filteredDiseases, ...filteredDrugs];

      setFavoritesList(mergedData);
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
    applySearch(text, favoritesList);
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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header />

      <View style={styles.contentContainer}>
        <View style={styles.textInputContainer}>
          <Entypo name="magnifying-glass" size={20} color={COLORS.darkGrey} />
          <TextInput
            style={styles.inputText}
            placeholder="Search your favorites"
            placeholderTextColor={COLORS.darkGrey}
            value={searchText}
            onChangeText={handleSearch}
          />
        </View>

        <Text style={styles.headingText}>Favorites</Text>

        {displayData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No favorites yet</Text>
            <Text style={styles.emptySubText}>Add some items to see them here</Text>
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
                fvrtScreen
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
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
    paddingBottom: 100,
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
