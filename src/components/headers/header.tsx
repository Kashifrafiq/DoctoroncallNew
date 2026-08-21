import AntDesign from '@expo/vector-icons/AntDesign';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '@/constants/colors';

type HeaderProps = {
  showBack?: boolean;
};

export function Header({ showBack = false }: HeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.5)', 'rgba(197, 224, 249, 1)']}
      style={styles.headerContainer}>
      <View style={[  { paddingTop: insets.top },  styles.HeaderContent ]}>
        <View style={styles.leftGroup}>
          {showBack ? (
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Go back">
              <AntDesign name="arrow-left" size={22} color={COLORS.textGrey} />
            </Pressable>
          ) : null}
          <View style={[styles.logoPrimary, showBack && styles.logoPrimaryWithBack]}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.image}
              contentFit="contain"
            />
          </View>
        </View>
        <View style={styles.logoSecondary}>
          <Image
            source={require('@/assets/images/logoSec.png')}
            style={styles.logoSecImage}
            contentFit="contain"
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    height: '12%',
    minHeight: 44,
    
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  HeaderContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
   
    paddingVertical: 20,
    alignItems: 'center',
    // backgroundColor: 'red',
  },

  leftGroup: {
    flex: 1,
    height: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
    width: '60%',
  },
  backButton: {
    width: 32,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPrimary: {
    height: '100%',
    flex: 1,
    maxWidth: '70%',
  },
  logoPrimaryWithBack: {
    maxWidth: '65%',
  },
  logoSecondary: {
    height: '90%',
    width: '30%',
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
