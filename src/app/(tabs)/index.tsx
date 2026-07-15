import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Banner } from '@/components/banner';
import { PaymentSheet } from '@/components/cards/payment-sheet';
import { PrimaryCard } from '@/components/cards/primary-card';
import { COLORS } from '@/constants/colors';
import { getDiseasesCatogery, searchDiseases } from '@/hooks/api/diseases';
import { getdrugsCatogery, searchMedicines } from '@/hooks/api/drugs';
import { MIN_SEARCH_LENGTH } from '@/hooks/api/firestore-search';
import { auth, getUserData, isProfileComplete, type UserData } from '@/services/firebase-functions';
import { calculateDaysLeft } from '@/services/helper';
import { RevenueCatService } from '@/services/revenue-cat';
import type { CategoryItem, SearchResultItem } from '@/types/catalog';

function isSubscriptionActive(user?: UserData): boolean {
  if (!user?.virified) {
    return false;
  }
  if (!user.expiryDate) {
    return false;
  }

  const expiry =
    typeof user.expiryDate === 'object' && 'toDate' in user.expiryDate
      ? user.expiryDate.toDate()
      : new Date(user.expiryDate);

  if (Number.isNaN(expiry.getTime())) {
    return false;
  }

  return expiry.getTime() > Date.now();
}

const TAB_BAR_CLEARANCE = 72;

export default function HomeScreen() {
  const sheetRef = useRef<BottomSheetModal>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const listBottomPadding = insets.bottom + TAB_BAR_CLEARANCE;
  const [activeTab, setActiveTab] = useState<'diseases' | 'drugs'>('diseases');
  const [diseaseData, setDiseaseData] = useState<CategoryItem[]>([]);
  const [drugData, setDrugData] = useState<CategoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [user, setUser] = useState<UserData>();
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const hasActiveAccess = isSubscriptionActive(user);
  const categoryListData = activeTab === 'diseases' ? diseaseData : drugData;

  const loadUserData = useCallback(async () => {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      console.log('HomeScreen - no user logged in');
      return;
    }

    const isComplete = await isProfileComplete(currentUser.uid);
    if (!isComplete) {
      router.replace('/auth/profile-completion' as Href);
      return;
    }

    let data = await getUserData(currentUser.uid);

    // If Firestore still shows locked after a successful purchase, re-sync from RevenueCat.
    if (!isSubscriptionActive(data ?? undefined)) {
      const synced = await RevenueCatService.ensurePremiumSynced();
      if (synced) {
        data = await getUserData(currentUser.uid);
      }
    }

    setUser(data ?? undefined);

    console.log('HomeScreen - logged in user:', {
      uid: currentUser.uid,
      email: currentUser.email,
      userData: data,
      hasActiveAccess: isSubscriptionActive(data ?? undefined),
    });
  }, [router]);

  const getCategoryById = (categoryId: (string | number)[] | undefined, type: string) => {
    if (!categoryId?.length) {
      return null;
    }

    if (type === 'disease') {
      return diseaseData.find((category) => category.id === categoryId[0]) ?? null;
    }

    if (type === 'drug') {
      return drugData.find((category) => category.id === categoryId[0]) ?? null;
    }

    return null;
  };

  useFocusEffect(
    useCallback(() => {
      void loadUserData();
    }, [loadUserData]),
  );

  useEffect(() => {
    const loadHome = async () => {
      setIsLoading(true);
      try {
        const [diseaseCategories, drugCategories] = await Promise.all([
          getDiseasesCatogery(),
          getdrugsCatogery(),
          loadUserData(),
        ]);

        
        console.log('drugCategories', drugCategories);

        setDiseaseData(diseaseCategories);
        setDrugData(drugCategories);
      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHome();
  }, [refresh, loadUserData]);

  useEffect(() => {
    const term = searchQuery.trim();
    if (term.length < MIN_SEARCH_LENGTH) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const [diseases, medicines] = await Promise.all([
          searchDiseases(term),
          searchMedicines(term),
        ]);
        setSearchResults([...diseases, ...medicines]);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const onSearchResultPress = (item: SearchResultItem) => {
    const cat = getCategoryById(
      item.type === 'disease' ? item['disease-category'] : item.drug_category,
      item.type,
    );

    if (!cat) {
      Alert.alert('Unavailable', 'Category for this item could not be loaded.');
      return;
    }

    router.push({
      pathname: '/disease-info',
      params: {
        id: String(item.id),
        name: item.title.rendered,
        shortDescription: item.shortDescription ?? '',
        htmlContent: item.htmlContent ?? '',
        acf: JSON.stringify(item.acf ?? null),
        sections: JSON.stringify(item.sections ?? null),
        catData: JSON.stringify({
          diseaseId: cat.id,
          image: cat.acf?.category_image,
          heading: cat.name,
          count: cat.count,
          type: item.type,
          fvrtScreen: false,
          rcntScreen: false,
        }),
      },
    } as unknown as Href);



  };

  const renderListHeader = useCallback(
    () => (
      <>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.text1}>Welcome, </Text>
            <Text style={styles.text2}>{user?.name}</Text>
          </View>
          <Text style={styles.text3}>{calculateDaysLeft(user?.expiryDate)}</Text>
        </View>

        <Banner />

        <View style={styles.navigationContainer}>
          <Pressable
            style={[
              styles.navigationTab,
              {
                backgroundColor:
                  activeTab === 'diseases' ? COLORS.homeInnerTabBarPrimaryCol : COLORS.white,
              },
            ]}
            onPress={() => setActiveTab('diseases')}>
            <MaterialCommunityIcons
              name="virus-outline"
              size={20}
              color={activeTab === 'diseases' ? COLORS.white : COLORS.black}
            />
            <Text
              style={[
                styles.navigationTabText,
                { color: activeTab === 'diseases' ? COLORS.white : COLORS.black },
              ]}>
              Diseases
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.navigationTab,
              {
                backgroundColor:
                  activeTab === 'drugs' ? COLORS.homeInnerTabBarSecondaryCol : COLORS.white,
              },
            ]}
            onPress={() => setActiveTab('drugs')}>
            <MaterialCommunityIcons
              name="pill"
              size={20}
              color={activeTab === 'drugs' ? COLORS.white : COLORS.black}
            />
            <Text
              style={[
                styles.navigationTabText,
                { color: activeTab === 'drugs' ? COLORS.white : COLORS.black },
              ]}>
              Drugs
            </Text>
          </Pressable>
        </View>
      </>
    ),
    [activeTab, user?.expiryDate, user?.name],
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.homeInnerTabBarPrimaryCol} />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  const showSearchResults = searchQuery.trim().length >= MIN_SEARCH_LENGTH;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.searchSection}>
        <View style={styles.textInputContainer}>
          <Entypo name="magnifying-glass" size={18} color={COLORS.darkGrey} />
          <TextInput
            style={[styles.inputText, !hasActiveAccess && styles.disabledInputText]}
            placeholder={
              hasActiveAccess
                ? 'Search by any disease or drug'
                : 'Search is locked for unverified users'
            }
            placeholderTextColor={COLORS.black}
            value={searchQuery}
            onChangeText={setSearchQuery}
            editable={hasActiveAccess}
          />
        </View>

        {showSearchResults ? (
          <View style={styles.searchResultsContainer}>
            {isSearching ? (
              <View style={styles.searchLoadingRow}>
                <ActivityIndicator size="small" color={COLORS.homeInnerTabBarPrimaryCol} />
                <Text style={styles.searchLoadingText}>Searching…</Text>
              </View>
            ) : null}
            <FlatList
              data={searchResults}
              keyExtractor={(item) => `${item.type ?? 'item'}-${item.id}`}
              style={styles.searchResultsList}
              contentContainerStyle={styles.searchResultsContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
              nestedScrollEnabled
              ListEmptyComponent={
                !isSearching ? <Text style={styles.searchEmptyText}>No results found</Text> : null
              }
              renderItem={({ item }) => (
                <Pressable style={styles.resultItem} onPress={() => onSearchResultPress(item)}>
                  <MaterialCommunityIcons
                    name={item.type === 'disease' ? 'virus-outline' : 'pill'}
                    size={20}
                    color={COLORS.black}
                  />
                  <Text style={styles.resultText}>{item.title.rendered}</Text>
                </Pressable>
              )}
            />
          </View>
        ) : null}
      </View>

      <FlatList
        showsVerticalScrollIndicator={false}
        data={categoryListData}
        numColumns={2}
        style={styles.flatListContainer}
        contentContainerStyle={{ paddingBottom: listBottomPadding }}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={renderListHeader}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item, index }) => (
          <PrimaryCard
            mainText={item.name}
            secondaryText={String(item.count)}
            img={item.imageUrl}
            paid={!hasActiveAccess && index !== 0}
            bgColor={item.color}
            id={item.id}
            type={activeTab}
            sheetRef={sheetRef}
          />
        )}
      />

      <BottomSheetModal ref={sheetRef} enableDynamicSizing>
        <PaymentSheet sheetRef={sheetRef} onRefresh={() => setRefresh((prev) => !prev)} />
      </BottomSheetModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  text1: {
    color: COLORS.textGrey,
    fontSize: 18,
    fontWeight: '600',
  },
  text2: {
    color: COLORS.textBlue,
    fontSize: 18,
    fontWeight: '600',
  },
  text3: {
    color: 'red',
    fontSize: 18,
    fontWeight: '600',
  },
  searchSection: {
    zIndex: 10,
    backgroundColor: COLORS.white,
    paddingBottom: 8,
  },
  textInputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputTextBg,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  inputText: {
    flex: 1,
    color: COLORS.black,
    fontSize: 16,
    marginLeft: 12,
  },
  disabledInputText: {
    opacity: 0.5,
  },
  navigationContainer: {
    width: '100%',
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 8,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.inputTextBg,
    borderRadius: 12,
  },
  navigationTab: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  navigationTabText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  resultItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  resultText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.black,
    marginLeft: 10,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textGrey,
    fontSize: 16,
    fontWeight: '500',
  },
  searchLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  searchLoadingText: {
    fontSize: 14,
    color: COLORS.textGrey,
  },
  searchEmptyText: {
    padding: 16,
    fontSize: 14,
    color: COLORS.textGrey,
    textAlign: 'center',
  },
  searchResultsContainer: {
    width: '100%',
    marginTop: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    maxHeight: 320,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  searchResultsList: {
    flexGrow: 0,
  },
  searchResultsContent: {
    paddingBottom: 8,
  },
  flatListContainer: {
    width: '100%',
    flex: 1,
  },
});
