import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { CustomButton } from '@/components/custom-button';
import { CustomInput } from '@/components/inputs/custom-input';
import { KeyboardAwareScrollView } from '@/components/keyboard-aware-scroll-view';
import { COLORS } from '@/constants/colors';
import { auth } from '@/services/firebase-functions';

export default function ForgetPasswordScreen() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const onPressReqPassReset = async () => {
    try {
      if (email.trim() === '') {
        Alert.alert('Incomplete Details', 'Please Enter your Email to continue');
        return;
      }

      await auth().sendPasswordResetEmail(email);
      Alert.alert(
        'Email Sent',
        'Password Reset Email have sent it to your mails please follow the instructions to reset the password',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          { text: 'OK', onPress: () => router.replace('/auth/login' as Href) },
        ],
      );
    } catch {
      Alert.alert('Error', 'Please Enter Correct Email');
    }
  };

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}>
      <View style={styles.contentContainer}>
        <Text style={styles.mainText}>Forgot Password?</Text>
        <Text style={styles.subText}>Please enter the email you use to sign in</Text>

        <CustomInput
          placeholder="Email ID"
          icon="mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <CustomButton text="Request password reset" type="primary" onPress={onPressReqPassReset} />

        <View style={styles.registerTextContainer}>
          <Text style={styles.normalText}>Back to </Text>
          <Pressable onPress={() => router.replace('/auth/login' as Href)}>
            <Text style={styles.registerButtonText}>Login</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  contentContainer: {
    width: '100%',
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
  subText: {
    color: COLORS.textColorPrimary,
    fontSize: 16,
  },
});
