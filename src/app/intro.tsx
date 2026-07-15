import { Image } from 'expo-image';
import { type Href, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { CustomButton } from '@/components/custom-button';
import { setIntroSeen } from '@/services/local-storage';

export default function IntroScreen() {
  const router = useRouter();

  const markIntroSeenAndNavigate = async (path: Href) => {
    await setIntroSeen();
    router.replace(path);
  };

  const onPressLogin = () => {
    markIntroSeenAndNavigate('/auth/login' as Href);
  };

  const onPressCreateAccount = () => {
    markIntroSeenAndNavigate('/auth/create-account' as Href);
  };

  return (
    <View style={styles.container}>
      <View style={styles.upperContainer}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>

      <View style={styles.middleContainer}>
        <Image
          source={require('@/assets/images/introImage.png')}
          style={styles.mainImage}
          contentFit="contain"
        />
        <Text style={styles.mainText}>
          Explore Standard Treatment Protocols Pakistan App
        </Text>
      </View>

      <View style={styles.lowerContainer}>
        <CustomButton text="Login" type="primary" onPress={onPressLogin} />
        <CustomButton text="Create Account" type="secondary" onPress={onPressCreateAccount} />
      </View>
    </View>
  );
}

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
  },
  logo: {
    width: '70%',
    height: '100%',
  },
  middleContainer: {
    width: '90%',
    height: '50%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  mainImage: {
    width: '90%',
    height: '70%',
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
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});
