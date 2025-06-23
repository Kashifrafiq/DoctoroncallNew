import {
  Alert,
  Image,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import React, {useState} from 'react';
import {COLORS} from '../../../assets/color/COLOR';
import MainImage from '../../../assets/img/mainImage.png';
import CustomInput from '../../../components/input/CustomInput';
import CustomeButton from '../../../components/Buttons/CustomeButton';
import {useNavigation} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

const CreateAccount = () => {
  const navigation = useNavigation();
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
      await auth()
        .createUserWithEmailAndPassword(email, password)
        .then(async () => {
          await auth().currentUser.sendEmailVerification();
          await auth().signOut();
          navigation.navigate('codeConfirmationScreen', {email, password});
        })
        .catch(error => {
          let errorMessage = 'An error occurred. Please try again.';
          if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'This email address is already in use.';
          } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Please enter a valid email address.';
          } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password should be at least 6 characters.';
          }
          Alert.alert('Registration Failed', errorMessage);
        });
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.contentContainer}>
        <View style={styles.upperContainer}>
          <Image
            source={MainImage}
            resizeMode="contain"
            style={styles.mainImage}
          />
        </View>

        <View style={styles.middleContainer}>
          <Text style={styles.mainText}>Create Account</Text>
          <Text style={styles.subText}>Sign up to get started</Text>

          <View style={styles.inputContainer}>
            <CustomInput
              icon={'email'}
              placeholder={'Email address'}
              value={email}
              textchangeFunction={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <CustomInput
              icon={'lock'}
              placeholder={'Password'}
              value={password}
              textchangeFunction={setPassword}
              password={true}
            />
          </View>

          <View style={styles.inputContainer}>
            <CustomInput
              icon={'lock'}
              placeholder={'Confirm Password'}
              value={confirmPassword}
              textchangeFunction={setConfirmPassword}
              password={true}
            />
          </View>
        </View>

        <View style={styles.lowerContainer}>
          <CustomeButton
            text={'Continue'}
            type={'primary'}
            onPressFunction={onPressContinue}
            loading={isLoading}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('loginScreen')}>
              <Text style={styles.loginButtonText}> Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CreateAccount;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    padding: 20,
  },
  upperContainer: {
    width: '100%',
    height: '30%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  middleContainer: {
    width: '100%',
    marginTop: 20,
  },
  mainText: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    color: COLORS.textgrey,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  lowerContainer: {
    width: '100%',
    marginTop: 20,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    color: COLORS.textgrey,
    fontSize: 14,
  },
  loginButtonText: {
    fontSize: 14,
    color: COLORS.lightOrange,
    fontWeight: '600',
  },
});
