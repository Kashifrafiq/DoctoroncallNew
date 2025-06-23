import {StyleSheet, Text, View, TextInput, FlatList} from 'react-native';
import React, {useState, useEffect, useCallback} from 'react';
import Header from '../../components/header/Header';
import Icons from 'react-native-vector-icons/Entypo';
import {COLORS} from '../../assets/color/COLOR';
import PrimaryCard from '../../components/card/PrimaryCard';
import {getDiseasesCatogery} from '../../Hooks/api/diseases';
import {getData} from '../../services/localStorage';
import { getdrugsCatogery } from '../../Hooks/api/drugs';
import {useNavigation, useFocusEffect} from '@react-navigation/native';

const DATA = [
  {
    name: 'Kidney Diseases',
    details: '94 diseases discussed',
    img: '../../assets/img/bannerImage.png',
  },
  {
    name: 'Kidney Diseases',
    details: '94 diseases discussed',
    img: '../../assets/img/bannerImage.png',
  },
  {
    name: 'Kidney Diseases',
    details: '94 diseases discussed',
    img: '../../assets/img/bannerImage.png',
  },
  {
    name: 'Kidney Diseases',
    details: '94 diseases discussed',
    img: '../../assets/img/bannerImage.png',
  },
  {
    name: 'Kidney Diseases',
    details: '94 diseases discussed',
    img: '../../assets/img/bannerImage.png',
  },
  {
    name: 'Kidney Diseases',
    details: '94 diseases discussed',
    img: '../../assets/img/bannerImage.png',
  },
  {
    name: 'Kidney Diseases',
    details: '94 diseases discussed',
    img: '../../assets/img/bannerImage.png',
  },
  {
    name: 'Kidney Diseases',
    details: '94 diseases discussed',
    img: '../../assets/img/bannerImage.png',
  },
  {
    name: 'Kidney Diseases',
    details: '94 diseases discussed',
    img: '../../assets/img/bannerImage.png',
  },
  {
    name: 'Kidney Diseases',
    details: '94 diseases discussed',
    img: '../../assets/img/bannerImage.png',
  },
];

const RecentScreem = () => {
  const navigation = useNavigation();
  const [diseaseData, setDiseaseData] = useState([]);
  const [drugsData, setDrugsData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [recentItems, setRecentItems] = useState([]);

  const extractTextFromTaxonomy = (taxonomy) => {
    const parts = taxonomy.split('_');
    console.log(parts[0])
    return parts[0]; // Adjust this to extract the part you need
  };

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [diseases, drugs] = await Promise.all([
        getDiseasesCatogery(),
        getdrugsCatogery(),
      ]);
      setDiseaseData(diseases);
      setDrugsData(drugs);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const filterData = async () => {
    try {
      const favoriteData = await getData('recent');
      const catIdSet = new Set(favoriteData?.map(item => item.catId));

      const filteredDiseases = diseaseData?.filter(disease =>
        catIdSet.has(disease.id)
      );
      const filteredDrugs = drugsData?.filter(drug =>
        catIdSet.has(drug.id)
      );

      const mergedData = [...filteredDiseases, ...filteredDrugs];
      setFilteredData(mergedData);
    } catch (error) {
      console.error('Error filtering data:', error);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    if (text) {
      const searchedData = filteredData?.filter(item =>
        item.name.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredData(searchedData);
      console.log('filetered Data', filteredData)
    } else {
      filterData();
    }
  };

  const handleRefresh = useCallback(() => {
    fetchData();
    if (diseaseData.length > 0 && drugsData.length > 0) {
      setIsDataLoaded(true);
    }
    if (isDataLoaded) {
      filterData();
    }
  }, []);

  const fetchRecentData = async () => {
    try {
      const recentData = await getData('recent');
      setRecentItems(recentData || []);
    } catch (error) {
      console.error('Error fetching recent data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (diseaseData.length > 0 && drugsData.length > 0) {
      setIsDataLoaded(true);
    }
  }, [diseaseData, drugsData]);

  useEffect(() => {
    if (isDataLoaded) {
      filterData();
    }
  }, [isDataLoaded]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchRecentData();
    });

    return unsubscribe;
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      fetchRecentData();
    }, [])
  );

  useEffect(() => {
    const checkForRecentChanges = async () => {
      const recentData = await getData('recent');
      if (JSON.stringify(recentData) !== JSON.stringify(recentItems)) {
        fetchRecentData();
      }
    };

    const interval = setInterval(checkForRecentChanges, 1000);
    return () => clearInterval(interval);
  }, [recentItems]);

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.contentContainer}>
        <View style={styles.textInputContainer}>
          <Icons name={'magnifying-glass'} size={20} color={COLORS.darkGrey} />
          <TextInput
            style={styles.inputText}
            placeholder="Search recent items"
            placeholderTextColor={COLORS.darkGrey}
            value={searchText}
            onChangeText={handleSearch}
          />
        </View>

        <Text style={styles.headingText}>Recently Opened</Text>

        {filteredData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No recent items</Text>
            <Text style={styles.emptySubText}>Your recently viewed items will appear here</Text>
          </View>
        ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={filteredData}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
            renderItem={({item}) => (
              <PrimaryCard
                mainText={item.name}
                secondaryText={item.count}
                img={item.acf.category_image}
                paid={false}
                bgColor={item.acf.color}
                id={item.id}
                type={item.taxonomy ? extractTextFromTaxonomy(item.taxonomy) : ''}
                fvrtScreen={false}
                rcntScreen={true}
              />
            )}
          />
        )}
      </View>
    </View>
  );
};

export default RecentScreem;

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
    backgroundColor: COLORS.inputTextBG,
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
    color: COLORS.textgrey,
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
    color: COLORS.textgrey,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.darkGrey,
    textAlign: 'center',
  },
});
