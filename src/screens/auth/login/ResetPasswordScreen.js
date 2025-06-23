import {StyleSheet, Text, View, Pressable} from 'react-native';
import React from 'react';
import CustomInput from '../../../components/input/CustomInput';
import CustomeButton from '../../../components/Buttons/CustomeButton';
import {COLORS} from '../../../assets/color/COLOR';
import { useNavigation } from '@react-navigation/native';

const ResetPasswordScreen = () => {
  const navigation = useNavigation()
  const onPressConfirm = () => {
    navigation.navigate('loginScreen')
  }
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.mainText}>Reset Password</Text>
        <Text>Create new password now</Text>
        <CustomInput placeholder={'Password'} icon={'shield'} />
        <CustomInput placeholder={'Re-enter password'} icon={'shield'} />
        <CustomeButton text={'Confirm & Create'} type={'primary'} onPressFunction={onPressConfirm} />
        
      </View>
    </View>
  );
};

export default ResetPasswordScreen; 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: '90%',
    height: '40%',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  registerButtonText: {
    fontSize: 18,
    color: COLORS.buttonPrimary,
  },
  normalText: {
    color: COLORS.textColorPrimary,
    fontSize: 17,
  },
  registerTextContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: COLORS.black,
    alignSelf: 'flex-start',
  },
});
