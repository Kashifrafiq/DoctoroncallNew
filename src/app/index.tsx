import { Image } from 'expo-image';
import { type Href, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

import { waitForAuthUser } from '@/config/firebase';
import { COLORS } from '@/constants/colors';
import { isDisclaimerAccepted, isIntroSeen } from '@/services/local-storage';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
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
  }, [fadeAnim, scaleAnim]);

  const checkDisclaimerAndAuth = async () => {
    try {
      const disclaimerAccepted = await isDisclaimerAccepted();
      const user = await waitForAuthUser();

      if (!disclaimerAccepted) {
        router.replace('/disclaimer' as Href);
      } else if (user) {
        router.replace('/(tabs)' as Href);
      } else if (!(await isIntroSeen())) {
        router.replace('/intro' as Href);
      } else {
        router.replace('/auth/login' as Href);
      }
    } catch (error) {
      console.error('Error checking disclaimer status:', error);
      router.replace('/auth/login' as Href);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </Animated.View>
    </View>
  );
}

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
