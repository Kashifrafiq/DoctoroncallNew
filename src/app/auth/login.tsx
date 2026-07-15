import { Image } from 'expo-image';
import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { CustomButton } from '@/components/custom-button';
import { CustomInput } from '@/components/inputs/custom-input';
import { KeyboardAwareScrollView } from '@/components/keyboard-aware-scroll-view';
import { COLORS } from '@/constants/colors';
import {
  auth,
  isAuthError,
  isProfileComplete,
} from '@/services/firebase-functions';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigateToHome = () => {
    const delay = Platform.OS === 'android' ? 300 : 100;

    setTimeout(() => {
      router.replace('/(tabs)' as Href);
    }, delay);
  };

  const onPressLogin = async () => {
    try {
      if (email.trim() === '' || password.trim() === '') {
        Alert.alert('Incomplete Data', 'Please fill in all fields');
        return;
      }

      setIsLoading(true);

      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      const isCompleted = await isProfileComplete(user.uid);

      if (!isCompleted) {
        router.push('/auth/profile-completion' as Href);
        return;
      }

      navigateToHome();
    } catch (error) {
      console.error('Login error:', isAuthError(error) ? error.code : error);

      let errorMessage = 'An error occurred. Please try again.';
      if (isAuthError(error)) {
        if (error.code === 'auth/invalid-credential') {
          errorMessage = 'Invalid email address or password';
        } else if (error.code === 'auth/wrong-password') {
          errorMessage = 'Incorrect password.';
        } else if (error.code === 'auth/user-not-found') {
          errorMessage = 'No account found with this email.';
        }
      }

      Alert.alert('Login Failed', errorMessage);
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
        <Text style={styles.mainText}>Welcome Back! 👋</Text>
        <Text style={styles.subText}>Sign in to continue</Text>

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

        <Pressable
          style={styles.forgotPasswordButton}
          onPress={() => router.push('/auth/forget-password' as Href)}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </Pressable>
      </View>

      <View style={styles.lowerContainer}>
        <CustomButton text="Sign In" type="primary" onPress={onPressLogin} loading={isLoading} />

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don&apos;t have an account?</Text>
          <Pressable onPress={() => router.push('/auth/create-account' as Href)}>
            <Text style={styles.registerButtonText}> Sign Up</Text>
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
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.lightOrange,
    fontWeight: '500',
  },
  lowerContainer: {
    width: '100%',
    marginTop: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  registerText: {
    color: COLORS.textGrey,
    fontSize: 14,
  },
  registerButtonText: {
    fontSize: 14,
    color: COLORS.lightOrange,
    fontWeight: '600',
  },
});
