import { Image } from 'expo-image';
import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { CustomButton } from '@/components/custom-button';
import { CustomInput } from '@/components/inputs/custom-input';
import { KeyboardAwareScrollView } from '@/components/keyboard-aware-scroll-view';
import { COLORS } from '@/constants/colors';
import { auth, isAuthError } from '@/services/firebase-functions';

export default function CreateAccountScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onPressContinue = async () => {
    try {
      if (email.trim() === '' || password.trim() === '' || confirmPassword.trim() === '') {
        Alert.alert('Incomplete Data', 'Please fill in all fields');
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }

      setIsLoading(true);

      await auth().createUserWithEmailAndPassword(email, password);
      await auth().currentUser?.sendEmailVerification?.();
      await auth().signOut();

      router.push({
        pathname: '/auth/code-confirmation',
        params: { email, password },
      } as unknown as Href);
    } catch (error) {
      if (isAuthError(error)) {
        let errorMessage = 'An error occurred. Please try again.';

        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'This email address is already in use.';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Please enter a valid email address.';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'Password should be at least 6 characters.';
        }

        Alert.alert('Registration Failed', errorMessage);
      } else {
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.upperContainer}>
        <Image
          source={require('@/assets/images/mainImage.png')}
          style={styles.mainImage}
          contentFit="contain"
        />
      </View>

      <View style={styles.middleContainer}>
        <Text style={styles.mainText}>Create Account</Text>
        <Text style={styles.subText}>Sign up to get started</Text>

        <View style={styles.inputContainer}>
          <CustomInput
            icon="mail"
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <CustomInput
            icon="lock"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            password
          />
        </View>

        <View style={styles.inputContainer}>
          <CustomInput
            icon="lock"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            password
          />
        </View>
      </View>

      <View style={styles.lowerContainer}>
        <CustomButton
          text="Continue"
          type="primary"
          onPress={onPressContinue}
          loading={isLoading}
        />

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <Pressable onPress={() => router.replace('/auth/login' as Href)}>
            <Text style={styles.loginButtonText}> Sign In</Text>
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
  contentContainer: {
    padding: 20,
  },
  upperContainer: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  middleContainer: {
    width: '100%',
  },
  mainText: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    color: COLORS.textGrey,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  lowerContainer: {
    width: '100%',
    marginTop: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    color: COLORS.textGrey,
    fontSize: 14,
  },
  loginButtonText: {
    fontSize: 14,
    color: COLORS.lightOrange,
    fontWeight: '600',
  },
});
