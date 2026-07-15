import Octicons from '@expo/vector-icons/Octicons';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { type Href, useRouter } from 'expo-router';
import type { RefObject } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/constants/colors';
import { getData, storeData } from '@/services/local-storage';
import { encodeRouteParam, normalizeFirebaseStorageUrl } from '@/utils/route-params';

type PrimaryCardProps = {
  mainText: string;
  img?: string | null;
  secondaryText: string;
  paid: boolean;
  bgColor: string;
  id: string | number;
  type: string;
  sheetRef?: RefObject<BottomSheetModal | null>;
  fvrtScreen?: boolean;
  rcntScreen?: boolean;
};

function hasValidImageUri(img?: string | null): img is string {
  return (
    typeof img === 'string' &&
    img.trim() !== '' &&
    img !== 'null' &&
    img !== 'undefined'
  );
}

export function PrimaryCard({
  mainText,
  img,
  secondaryText,
  paid,
  bgColor,
  id,
  type,
  sheetRef,
  fvrtScreen,
  rcntScreen,
}: PrimaryCardProps) {
  const router = useRouter();

  const onPressCard = async () => {
    if (!paid) {
      try {
        const existingData = await getData<(string | number)[]>('recent');

        const isEmpty =
          !Array.isArray(existingData) || existingData.length === 0 || existingData === null;

        if (isEmpty) {
          await storeData('recent', [id]);
        } else {
          const isAlreadyRecent = existingData.includes(id);

          if (isAlreadyRecent) {
            const newData = existingData.filter((diseaseId) => diseaseId !== id);
            await storeData('recent', newData);
          } else {
            const newData = [...existingData, id];
            await storeData('recent', newData);
          }
        }
      } catch (error) {
        console.error('Error adding/removing ID to local storage:', error);
      }

      router.push({
        pathname: '/list-of-diseases',
        params: {
          catData: encodeRouteParam(
            JSON.stringify({
              diseaseId: String(id),
              image: img ?? '',
              heading: mainText,
              count: secondaryText,
              type,
              fvrtScreen: fvrtScreen ? '1' : '0',
              rcntScreen: rcntScreen ? '1' : '0',
            }),
          ),
        },
      } as unknown as Href);
      return;
    }

    sheetRef?.current?.present();
  };

  

  return (
    <Pressable onPress={onPressCard} style={[styles.mainContainer, { backgroundColor: bgColor }]}>
      {paid ? (
        <View style={styles.lockContainer}>
          <Octicons name="lock" size={15} color={COLORS.greyLight} />
        </View>
      ) : null}

      {hasValidImageUri(img) ? (
        <Image
          source={{ uri: normalizeFirebaseStorageUrl(img) ?? img }}
          style={styles.image}
          contentFit="contain"
        />
      ) : (
        <View style={[styles.image, styles.placeholderContainer]}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.image}
            contentFit="contain"
          />
        </View>
      )}

      <Text style={styles.mainText}>{mainText}</Text>
      <Text style={styles.secondaryText}>
        {secondaryText} {type} discussed
      </Text>
    </Pressable>
  );
}

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
    color: COLORS.textGrey,
    textAlign: 'center',
    marginTop: 8,
  },
  secondaryText: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textGrey,
    textAlign: 'center',
    opacity: 0.8,
  },
  image: {
    width: '80%',
    height: '60%',
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
