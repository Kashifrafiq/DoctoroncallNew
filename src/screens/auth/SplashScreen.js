import React, {useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Image,
  Dimensions,
  Easing,
} from 'react-native';
import {COLORS} from '../../assets/color/COLOR';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';

const {width} = Dimensions.get('window');

const SplashScreen = ({navigation}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 2,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      checkDisclaimerAndAuth();
    }, 2000); 

    return () => clearTimeout(timer);
  }, []);

  const checkDisclaimerAndAuth = async () => {
    try {
      const disclaimerAccepted = await AsyncStorage.getItem('disclaimerAccepted');
      const user = auth().currentUser;

      if (!disclaimerAccepted) {
        navigation.replace('DisclaimerScreen');
      } else if (user) {
        navigation.replace('tabNavigation');
      } else {
        navigation.replace('loginScreen');
      }
    } catch (error) {
      console.error('Error checking disclaimer status:', error);
      navigation.replace('loginScreen');
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{scale: scaleAnim}],
          },
        ]}>
        <Image
          source={require('../../assets/img/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  logoContainer: {
    width: width * 0.6,
    height: width * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});

export default SplashScreen; 