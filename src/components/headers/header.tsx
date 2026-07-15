import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

export function Header() {
  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.5)', 'rgba(197, 224, 249, 1)']}
      style={styles.headerContainer}>
      <View style={styles.logoPrimary}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.image}
          contentFit="contain"
        />
      </View>
      <View style={styles.logoSecondary}>
        <Image
          source={require('@/assets/images/logoSec.png')}
          style={styles.logoSecImage}
          contentFit="contain"
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    height: '5%',
    alignItems: 'center',
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  logoPrimary: {
    height: '90%',
    width: '50%',
  },
  logoSecondary: {
    height: '90%',
    width: '40%',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  logoSecImage: {
    height: '100%',
    width: '100%',
  },
});
