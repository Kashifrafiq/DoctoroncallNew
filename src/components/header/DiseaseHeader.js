import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {COLORS} from '../../assets/color/COLOR';
import Icon from 'react-native-vector-icons/Entypo';
import {storeData, getData} from '../../services/localStorage';

const DiseaseHeader = ({img, mainText, secText, id, disable, diseaseID}) => {
  const [isliked, setisLiked] = useState(false);

  console.log('Disease ID', diseaseID);

  const checkData = async () => {
    try {
      const existingData = await getData('fvrt');
      console.log('This is existing Data', existingData);

      const isAlreadyLiked = existingData?.some(
        item => item.diseaseID === diseaseID,
      );
      if (isAlreadyLiked) {
        setisLiked(true);
      } else {
        setisLiked(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    checkData();
  }, []);

  const onPressHeart = async () => {
    try {
      console.log(id);
      const existingData = await getData('fvrt');
      // console.log('Recent Data', existingData);

      const isEmpty =
        !Array.isArray(existingData) ||
        existingData?.length === 0 ||
        existingData === null;

      if (isEmpty) {
        await storeData('fvrt', [{catId: id, diseaseID: diseaseID}]);
        setisLiked(true);
      } else {
        // const isAlreadyLiked = existingData?.includes(d);
        const isAlreadyLiked = existingData?.some(
          item => item.diseaseID === diseaseID,
        );
        if (isAlreadyLiked) {
          const newData = existingData.filter(
            disease => disease.diseaseID !== diseaseID,
          );
          console.log('New Data', newData);
          await storeData('fvrt', newData);
          setisLiked(false);
        } else {
          const newData = [...existingData, {catId: id, diseaseID: diseaseID}];
          await storeData('fvrt', newData);
          setisLiked(true);
        }
      }
    } catch (e) {
      console.error('Error adding/removing ID to local storage:', e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        <Image
          source={{uri: img}}
          alt="Image"
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      <View style={styles.middleContainer}>
        <Text style={styles.mainText}>{mainText}</Text>
        <Text style={styles.secText}>{secText} diseases discussed</Text>
      </View>

      <TouchableOpacity
        style={styles.rightContainer}
        onPress={onPressHeart}
        disabled={disable}>
        {disable ? null : (
          <Icon
            name={'heart'}
            size={50}
            color={isliked ? COLORS.lightOrange : COLORS.white}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default DiseaseHeader;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardColor,
    width: '100%',
    height: '10%',
    padding: 10,
    borderRadius: 20,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  leftContainer: {
    width: '20%',
    height: '90%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  middleContainer: {
    width: '50%',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  mainText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
  },
  secText: {
    fontSize: 11,
    color: COLORS.black,
  },
  rightContainer: {
    width: '20%',
    height: '90%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
