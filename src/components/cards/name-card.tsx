import AntDesign from '@expo/vector-icons/AntDesign';
import { type Href, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { COLORS } from '@/constants/colors';
import { getData, storeData } from '@/services/local-storage';
import type { CategoryData, RecentDiseaseItem } from '@/types/cards';

type NameCardProps = {
  name: string;
  acf: unknown;
  catData: CategoryData;
  id: string | number;
  sections: unknown;
  shortDescription: string;
  htmlContent: string;
};

export function NameCard({
  name,
  acf,
  catData,
  id,
  sections,
  shortDescription,
  htmlContent,
}: NameCardProps) {
  const router = useRouter();

  const onPressCard = async () => {
    try {
      const existingData = await getData<RecentDiseaseItem[]>('recent');

      const isEmpty =
        !Array.isArray(existingData) || existingData.length === 0 || existingData === null;

      if (isEmpty) {
        await storeData('recent', [{ catId: catData.diseaseId, diseaseID: id }]);
      } else {
        const isAlreadyRecent = existingData.some((item) => item.diseaseID === id);

        if (isAlreadyRecent) {
          await storeData('recent', [{ catId: catData.diseaseId, diseaseID: id }]);
        } else {
          const newData = [...existingData, { catId: catData.diseaseId, diseaseID: id }];
          await storeData('recent', newData);
        }
      }
    } catch (error) {
      console.error('Error adding/removing ID to local storage:', error);
    }

    router.push({
      pathname: '/disease-info',
      params: {
        id: String(id),
        name,
        shortDescription,
        htmlContent,
        acf: JSON.stringify(acf ?? null),
        catData: JSON.stringify(catData ?? null),
        sections: JSON.stringify(sections ?? null),
      },
    } as unknown as Href);
  };

  return (
    <Pressable style={styles.container} onPress={onPressCard}>
      <Text style={styles.mainText}>{name}</Text>
      <AntDesign name="arrow-right" size={25} color={COLORS.textGrey} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: COLORS.nameCardBg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.nameCardBorder,
    borderRadius: 18,
    marginTop: 10,
  },
  mainText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textGrey,
    width: '90%',
  },
});
