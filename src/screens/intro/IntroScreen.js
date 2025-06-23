import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import LOGO from '../../assets/img/logo.png';
import IntroImage from '../../assets/img/introImage.png';
import CustomeButton from '../../components/Buttons/CustomeButton';
import { useNavigation } from '@react-navigation/native';

const IntroScreen = () => {
  const navigation = useNavigation()


  const onPresslogin = () =>{
    navigation.navigate('loginScreen')
  }

  const onPressCreateAccount = () =>{
    navigation.navigate('createAccount')
  }
  return (
    <View style={styles.container}>
      <View style={styles.upperContainer}>
        <Image source={LOGO} resizeMode="contain" style={styles.logo} />
      </View>
      <View style={styles.middleContainer}>
        <Image
          source={IntroImage}
          resizeMode="contain"
          style={styles.mainImage}
        />
        <Text style={styles.mainText}>Explore Standard Treatment Protocols Pakistan App</Text>
      </View>
      <View style={styles.lowerContainer}>
        <CustomeButton text={'Login'} type={'primary'} onPressFunction={onPresslogin}/>
        <CustomeButton text={'Create Account'} type={'secondary'} onPressFunction={onPressCreateAccount}/>
      </View>
    </View>
  );
};

export default IntroScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B9FFDD',
    padding: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  upperContainer: {
    width: '90%',
    height: '20%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    // backgroundColor: 'green'
  },
  logo: {
    width: '70%',
  },
  middleContainer: {
    width: '90%',
    height: '50%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    // backgroundColor: 'yellow'
  },
  mainImage: {
    width: '90%',
    height: '70%'
  },
  mainText: {
    fontSize: 20,
    color: '#191031',
    width: '70%',
    textAlign: 'center',
  },
  lowerContainer: {
    width: '90%',
    height: '20%',
    // backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
});
