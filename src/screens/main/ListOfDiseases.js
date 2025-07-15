import {FlatList, Image, StyleSheet, Text, View, ActivityIndicator} from 'react-native';
import React, {useEffect, useState, useCallback} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import LOGO from '../../assets/img/logo.png';
import Header from '../../components/header/Header';
import DiseaseHeader from '../../components/header/DiseaseHeader';
import NameCard from '../../components/card/NameCard';
import {useRoute} from '@react-navigation/native';
import {getdiseases} from '../../Hooks/api/diseases';
import {getDrugs} from '../../Hooks/api/drugs';
import {getData} from '../../services/localStorage';
import {COLORS} from '../../assets/color/COLOR';

const ListOfDiseases = () => {
  const route = useRoute();
  const catData = route.params;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const filterData = useCallback(async (allData, type) => {
    try {
      if (catData.fvrtScreen) {
        const favoriteData = await getData('fvrt');
        const catIdSet = new Set(favoriteData.map(item => item.diseaseID));
        return allData?.filter(disease => catIdSet.has(disease?.id));
      } else if (catData.rcntScreen) {
        const recentData = await getData('recent');
        const catIdSet = new Set(recentData.map(item => item.diseaseID));
        return allData.filter(disease => catIdSet.has(disease.id));
      } else {
        if(type === 'disease') {
          return allData.filter(disease => disease[`disease-category`].includes(catData.diseaseId));
        } else {
          return allData.filter(disease => disease.drug_category.includes(catData.diseaseId));
        }
      }
    } catch (error) {
      console.error('Error filtering data:', error);
      return [];
    }
  }, [catData]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      let allData;
      
      if (catData.type === 'drugs' || catData.type === 'drug') {
        allData = await getDrugs();
        const filteredData = await filterData(allData, 'drug' );
        setData(filteredData);
      } else {
        allData = await getdiseases();
        const filteredData = await filterData(allData, 'disease');
        setData(filteredData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [catData, filterData]);

  useEffect(() => {
    console.log('catData', catData);
    loadData();
  }, [loadData]);

  const renderItem = useCallback(({item}) => (
    <NameCard 
      name={item.title.rendered} 
      acf={item.acf} 
      catData={catData} 
      id={item.id} 
    />
  ), [catData]);

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  return (
    <View style={styles.container}>
      <Header />
      <DiseaseHeader
        img={catData.image}
        mainText={catData.heading}
        secText={catData.count}
        id={catData.diseaseId}
        disable={true}
        type={catData.type}
      />
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={data}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
        />
      )}
    </View>
  );
};

export default ListOfDiseases;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
  },
  headerContainer: {
    height: '8%',
  },
});
