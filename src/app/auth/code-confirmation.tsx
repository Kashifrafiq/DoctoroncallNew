import { Image } from 'expo-image';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { CustomButton } from '@/components/custom-button';
import { COLORS } from '@/constants/colors';
import { auth } from '@/services/firebase-functions';

export default function CodeConfirmationScreen() {
  const router = useRouter();
  const { email = '', password = '' } = useLocalSearchParams<{
    email?: string;
    password?: string;
  }>();

  const onPressLogin = async () => {
    await auth().signOut();
    router.replace('/auth/login' as Href);
  };

  const onPressVerify = async () => {
    try {
      const res = await auth().signInWithEmailAndPassword(email, password);

      if (res.user.emailVerified) {
        router.push('/auth/profile-completion' as Href);
      } else {
        Alert.alert('Not Verified', 'Please check your mail and click on url to confirm', [
          { text: 'OK' },
        ]);
      }
    } catch (error) {
      console.error('Verification sign-in error:', error);
      Alert.alert('Error', 'Could not verify your account. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/ellipse.png')}
          style={styles.ellipseImg}
          contentFit="contain"
        />
        <Image
          source={require('@/assets/images/sms.png')}
          style={styles.smsImage}
          contentFit="contain"
        />
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.mainText}>We just emailed you.</Text>
        <Text style={styles.subText}>Please verify its you by clicking on the link in the mail</Text>
        <Text style={styles.emailText}>{email}</Text>

        <CustomButton text="Verify" type="primary" onPress={onPressVerify} />

        <View style={styles.registerTextContainer}>
          <Text style={styles.normalText}>Back to </Text>
          <Pressable onPress={onPressLogin}>
            <Text style={styles.registerButtonText}>Login</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  imageContainer: {
    width: '90%',
    height: '30%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smsImage: {
    width: '70%',
    height: '90%',
  },
  ellipseImg: {
    position: 'absolute',
    width: '20%',
    height: '20%',
    right: 70,
    top: 40,
    alignSelf: 'flex-end',
    zIndex: 1,
  },
  contentContainer: {
    width: '90%',
    height: '40%',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
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
  subText: {
    color: COLORS.textColorPrimary,
    fontSize: 16,
  },
  emailText: {
    color: COLORS.black,
    fontSize: 16,
  },
});
