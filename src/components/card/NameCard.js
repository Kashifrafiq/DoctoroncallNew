import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {COLORS} from '../../assets/color/COLOR';
import Icon from 'react-native-vector-icons/AntDesign';
import {useNavigation} from '@react-navigation/native';
import {storeData, getData} from '../../services/localStorage';

const NameCard = ({name, acf, catData, id}) => {
  const navigate = useNavigation();

  const onPressCard = async () => {
    try {
      const existingData = await getData('recent');
      console.log('Recent Data', existingData);

      const isEmpty =
        !Array.isArray(existingData) ||
        existingData?.length === 0 ||
        existingData === null;

      if (isEmpty) {
        await storeData('recent', [{catId: catData?.diseaseId, diseaseID: id}]);
        setisLiked(true);
      } else {
        // const isAlreadyLiked = existingData?.includes(d);
        const isAlreadyLiked = existingData?.some(
          item => item?.diseaseID === id,
        );
        if (isAlreadyLiked) {
          const newData = existingData?.filter(
            disease => disease?.diseaseID !== id,
          );
          console.log('New Data', newData);
          await storeData('recent', [
            {catId: catData.diseaseId, diseaseID: id},
          ]);
        } else {
          const newData = [...existingData, {catId: catData?.diseaseId, diseaseID: id}];
          await storeData('recent', newData);
        }
      }
    } catch (e) {
      console.error('Error adding/removing ID to local storage:', e);
    }
    navigate.navigate('diseaseInfoScreen', {
      acf: acf,
      catData: catData,
      name: name,
      id: id,
    });
  };
  return (
    <TouchableOpacity style={styles.container} onPress={onPressCard}>
      <Text style={styles.mainText}>{name}</Text>
      <Icon name={'arrowright'} size={25} color={COLORS.textgrey} />
    </TouchableOpacity>
  );
};

export default NameCard;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: COLORS.nameCardBG,
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
    color: COLORS.textgrey,
    width: '90%',
  },

});
