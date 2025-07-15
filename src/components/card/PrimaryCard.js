import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {COLORS} from '../../assets/color/COLOR';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import Icons from 'react-native-vector-icons/Octicons';
import {useNavigation} from '@react-navigation/native';
import {storeData, getData} from '../../services/localStorage';
import RecentScreem from '../../screens/main/RecentScreem';

const PrimaryCard = ({
  mainText,
  img,
  secondaryText,
  paid,
  bgColor,
  id,
  type,
  rbSheetRef,
  fvrtScreen,
  rcntScreen,
  
}) => {
  const navigation = useNavigation();

  const onPressCard = async () => {
    if (!paid) {
      try {
        console.log(id);
        const existingData = await getData('recent');
        // console.log('Recent Data', existingData);

        const isEmpty =
          !Array.isArray(existingData) ||
          existingData?.length === 0 ||
          existingData === null;

        if (isEmpty) {
          await storeData('recent', [id]);
        } else {
          const isAlreadyLiked = existingData?.includes(id);

          if (isAlreadyLiked) {
            const newData = existingData.filter(diseaseId => diseaseId !== id);
            await storeData('recent', newData);
          } else {
            const newData = [...existingData, id];
            await storeData('recent', newData);
          }
        }
      } catch (e) {
        console.error('Error adding/removing ID to local storage:', e);
      }

      navigation.navigate('listOfDiseases', {
        diseaseId: id,
        image: img,
        heading: mainText,
        count: secondaryText,
        type: type,
        fvrtScreen : fvrtScreen, 
        rcntScreen : rcntScreen
      });
    }
    if (paid) {
      rbSheetRef.current?.present();;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPressCard}
      style={[styles.mainContainer, {backgroundColor: `#${bgColor}`}]}>
      {paid ? (
        <View style={styles.lockContainer}>
          <Icons name={'lock'} size={15} color={COLORS.greylight} />
        </View>
      ) : null}

      <Image
        source={{uri: img}}
        alt="Image"
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.mainText}>{mainText}</Text>
      <Text style={styles.secondaryText}>
        {secondaryText} {type} discussed
      </Text>
    </TouchableOpacity>
  );
};

export default PrimaryCard;

const styles = StyleSheet.create({
  mainContainer: {
    width: '46%',
    height: 180,
    margin: '2%',
    justifyContent: 'space-between',
    borderRadius: 16,
    alignItems: 'center',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  lockContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1,
  },
  mainText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textgrey,
    textAlign: 'center',
    marginTop: 8,
  },
  secondaryText: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textgrey,
    textAlign: 'center',
    opacity: 0.8,
  },
  image: {
    width: '80%',
    height: '50%',
    resizeMode: 'contain',
  },
});
