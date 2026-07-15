import Entypo from '@expo/vector-icons/Entypo';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/constants/colors';
import { getData, storeData } from '@/services/local-storage';
import { normalizeFirebaseStorageUrl } from '@/utils/route-params';
import type { FavoriteDiseaseItem } from '@/types/cards';

type DiseaseHeaderProps = {
  img?: string | null;
  mainText: string;
  secText: string;
  id: string | number;
  disable?: boolean;
  diseaseID?: string | number;
  type?: string;
};

function hasValidImageUri(img?: string | null): img is string {
  return (
    typeof img === 'string' &&
    img.trim() !== '' &&
    img !== 'null' &&
    img !== 'undefined'
  );
}

export function DiseaseHeader({
  img,
  mainText,
  secText,
  id,
  disable = false,
  diseaseID = 0,
  type = '',
}: DiseaseHeaderProps) {
  const [isLiked, setIsLiked] = useState(false);

  const checkData = async () => {
    try {
      const existingData = await getData<FavoriteDiseaseItem[]>('fvrt');
      const isAlreadyLiked = existingData?.some((item) => item.diseaseID === diseaseID);
      setIsLiked(Boolean(isAlreadyLiked));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    checkData();
  }, [diseaseID]);

  const onPressHeart = async () => {
    try {
      const existingData = await getData<FavoriteDiseaseItem[]>('fvrt');

      const isEmpty =
        !Array.isArray(existingData) || existingData.length === 0 || existingData === null;

      if (isEmpty) {
        await storeData('fvrt', [{ catId: id, diseaseID }]);
        setIsLiked(true);
        return;
      }

      const isAlreadyLiked = existingData.some((item) => item.diseaseID === diseaseID);

      if (isAlreadyLiked) {
        const newData = existingData.filter((disease) => disease.diseaseID !== diseaseID);
        await storeData('fvrt', newData);
        setIsLiked(false);
      } else {
        const newData = [...existingData, { catId: id, diseaseID }];
        await storeData('fvrt', newData);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error adding/removing ID to local storage:', error);
    }
  };

  const imageUri = normalizeFirebaseStorageUrl(img);

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        {hasValidImageUri(imageUri) ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} contentFit="contain" />
          </View>
        ) : (
          <View style={[styles.image, styles.placeholderContainer]}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.image}
              contentFit="contain"
            />
          </View>
        )}
      </View>

      <View style={styles.middleContainer}>
        <Text style={styles.mainText}>{mainText}</Text>
        <Text style={styles.secText}>
          {secText} {type} discussed
        </Text>
      </View>

      <Pressable
        style={styles.rightContainer}
        onPress={onPressHeart}
        disabled={disable}>
        {!disable ? (
          <Entypo
            name="heart"
            size={50}
            color={isLiked ? COLORS.lightOrange : COLORS.white}
          />
        ) : null}
      </Pressable>
    </View>
  );
}

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
  imageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
  
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
