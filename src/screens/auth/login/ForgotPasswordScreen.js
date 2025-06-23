import { StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import React, { useState } from 'react';
import CustomInput from '../../../components/input/CustomInput';
import CustomeButton from '../../../components/Buttons/CustomeButton';
import { COLORS } from '../../../assets/color/COLOR';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth'

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const navigation = useNavigation()

  const onPressReqPassReset = () => {
    try {
      if (email.trim() === '') {
        Alert.alert('Incomplete Details', 'Please Enter your Email to continue')
      } else {
        auth().sendPasswordResetEmail(email).then(() => {
          Alert.alert('Email Sent', 'Password Reset Email have sent it to your mails please follow the instructions to reset the password', [
            {
              text: 'Cancel',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
            { text: 'OK', onPress: () => navigation.navigate('loginScreen') },
          ])
        }).catch(()=> {
          Alert.alert('Error', 'Please Enter Correct Email')
        })
      }
    } catch (e) {
      Alert.alert('Incomplete Details', 'Please Enter your Email to continue')
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.mainText}>Forgot Password?</Text>
        <Text>Please enter the email you use to sign in</Text>
        <CustomInput placeholder={'Email ID'} icon={'email'} value={email} textchangeFunction={setEmail} password={false} />
        <CustomeButton text={'Request password reset'} type={'primary'} onPressFunction={onPressReqPassReset} />
        <View style={styles.registerTextContainer}>
          <Text style={styles.normalText}>Back to </Text>
          <Pressable onPress={() => navigation.navigate('loginScreen')}>
            <Text style={styles.registerButtonText}>Login</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: '90%',
    // height: '30%',
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
    marginTop: 10,
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
