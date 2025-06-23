import {StyleSheet, Text, View, Pressable, Image, TextInput, Alert} from 'react-native';
import React, { useEffect } from 'react';
import CustomInput from '../../../components/input/CustomInput';
import CustomeButton from '../../../components/Buttons/CustomeButton';
import {COLORS} from '../../../assets/color/COLOR';
import ellipse from '../../../assets/img/ellipse.png';
import sms from '../../../assets/img/sms.png';
import {CodeField} from 'react-native-confirmation-code-field'
import { useNavigation, useRoute } from '@react-navigation/native';
import auth from '@react-native-firebase/auth'

const CodeConfirmationScreen = () => {
  const route = useRoute()
  const navigation = useNavigation();
  const loginCredentials = route.params


  const onPressLogin = () => {
    auth().signOut();
    navigation.navigate('loginScreen')
  }

  const onPressVerify = () => {
    // navigation.navigate('profileCompletion')
    auth().signInWithEmailAndPassword(loginCredentials.email, loginCredentials.password).then( (res)=> {
      if( res.user.emailVerified){
        navigation.navigate('profileCompletion')
      } else {
        Alert.alert('Not Virified', 'Please check your mail and click on url to confirm', [
          {text: 'OK'},
        ]);
      }

    })
  }


  useEffect( () => {
    console.log('login Credentials: ',loginCredentials )
  }, [])
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image style={styles.ellipseImg} source={ellipse} />
        <Image style={styles.smsImage} source={sms} resizeMode="contain" />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.mainText}>We just emailed you.</Text>
        <Text>Please verify its you by clicking on the link in the mail</Text>
        <Text style={{color: COLORS.black}}>{loginCredentials.email}</Text>
       
        <CustomeButton text={'Verify'} type={'primary'} onPressFunction={onPressVerify} />
        <View style={styles.registerTextContainer}>
          <Text style={styles.normalText}>Back to </Text>
          <Pressable onPress={onPressLogin}>
            <Text style={styles.registerButtonText}>Login</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default CodeConfirmationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '90%',
    height: '30%',
    // backgroundColor: 'yellow',
    justifyContent: 'center',
    alignItems: 'center'
  },
  smsImage: {
    width: '70%',
    height: '90%',
  },
  ellipseImg: {
    position: 'absolute',
    width: '20%',
    height: '20%',
    resizeMode: 'contain',
    right: 70,
    top: 40,
    alignSelf: 'flex-end',
    zIndex: 1
  },
 
  contentContainer: {
    width: '90%',
    height: '40%',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    // backgroundColor: 'green',
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
    fontSize: 28,
    fontWeight: '500',
    color: COLORS.black,
    alignSelf: 'flex-start',
  },
  root: {flex: 1, padding: 20},
  title: {textAlign: 'center', fontSize: 30},
  codeFieldRoot: {marginTop: 20},
  cell: {
    width: 40,
    height: 40,
    lineHeight: 38,
    fontSize: 24,
    borderWidth: 2,
    borderColor: '#00000030',
    textAlign: 'center',
  },
  focusCell: {
    borderColor: '#000',
  },
});
