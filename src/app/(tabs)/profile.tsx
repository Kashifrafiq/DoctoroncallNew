import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { type Href, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { CustomButton } from '@/components/custom-button';
import { CustomInput } from '@/components/inputs/custom-input';
import { KeyboardAwareScrollView } from '@/components/keyboard-aware-scroll-view';
import { COLORS } from '@/constants/colors';
import {
  auth,
  EmailAuthProvider,
  getUserData,
  isAuthError,
  logoutAndClearDevice,
  updateUserData,
  type UserData,
} from '@/services/firebase-functions';

export default function ProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cnic, setCnic] = useState('');
  const [college, setCollege] = useState('');
  const [city, setCity] = useState('');
  const [verified, setVerified] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePasswordInput, setShowDeletePasswordInput] = useState(false);

  const loadUserData = async () => {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      return;
    }

    const data = await getUserData(currentUser.uid);
    if (!data) {
      return;
    }

    setCity(data.city ?? '');
    setName(data.name ?? '');
    setPhone(data.phone ?? '');
    setCollege(data.college ?? '');
    setVerified(Boolean(data.virified));
    setCnic(data.cnic ?? '');
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const onPressSave = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'Please sign in again.');
        return;
      }

      const userData = await getUserData(currentUser.uid);
      if (!userData) {
        Alert.alert('Error', 'Could not load your profile.');
        return;
      }

      const updatedFields: Partial<UserData> = {};

      if (userData.name !== name) {
        updatedFields.name = name;
      }
      if (userData.phone !== phone) {
        updatedFields.phone = phone;
      }
      if (userData.college !== college) {
        updatedFields.college = college;
      }
      if (userData.city !== city) {
        updatedFields.city = city;
      }
      if (userData.cnic !== cnic) {
        updatedFields.cnic = cnic;
      }
      if (userData.virified !== verified) {
        updatedFields.virified = verified;
      }

      if (Object.keys(updatedFields).length === 0) {
        Alert.alert('Info', 'No changes detected');
        return;
      }

      const results = await Promise.all(
        Object.entries(updatedFields).map(([fieldName, fieldValue]) =>
          updateUserData(currentUser.uid, fieldName, fieldValue),
        ),
      );

      if (results.every(Boolean)) {
        Alert.alert('Success', 'User Data updated successfully');
      } else {
        Alert.alert('Error', 'User Details Not Updated');
      }
    } catch (error) {
      console.error('Error updating data:', error);
      Alert.alert('Error', 'User Details Not Updated');
    }
  };

  const performAccountDeletion = async (password: string) => {
    const user = auth().currentUser;
    if (!user?.email) {
      Alert.alert('Error', 'No user found. Please sign in again.');
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await user.reauthenticateWithCredential?.(credential);
      await user.delete?.();
      setShowDeletePasswordInput(false);
      setDeletePassword('');
      router.replace('/auth/login' as Href);
    } catch (error) {
      console.error('Error during account deletion:', error);
      if (isAuthError(error) && error.code === 'auth/wrong-password') {
        Alert.alert('Error', 'Incorrect password. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to delete account. Please try again later.');
      }
    }
  };

  const promptDeletePassword = () => {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        'Confirm Password',
        'Please enter your password to confirm account deletion',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            onPress: (password?: string) => {
              if (!password) {
                Alert.alert('Error', 'Password is required');
                return;
              }
              performAccountDeletion(password);
            },
          },
        ],
        'secure-text',
      );
      return;
    }

    setShowDeletePasswordInput(true);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: promptDeletePassword,
        },
      ],
    );
  };

  const handleSignOut = async () => {
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        await logoutAndClearDevice(currentUser.uid);
      }

      await auth().signOut();
      router.replace('/auth/login' as Href);
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  return (
    <KeyboardAwareScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.mainText}>My Profile</Text>
            <Pressable
              style={styles.aboutButton}
              onPress={() => router.push('/about-us' as Href)}>
              <Text style={styles.aboutButtonText}>About Us</Text>
            </Pressable>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <CustomInput
                placeholder="Your Name"
                icon="user"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <CustomInput
                placeholder="Email address"
                icon="mail"
                value={auth().currentUser?.email ?? ''}
                onChangeText={() => {}}
                editable={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <CustomInput
                placeholder="Country code & mobile number"
                icon="phone"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>PMDC/Medical Licensing Number</Text>
              <CustomInput
                placeholder="PMDC/Medical Licensing Number"
                icon="v-card"
                value={cnic}
                onChangeText={setCnic}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>College/Degree</Text>
              <CustomInput
                placeholder="College & degree"
                icon="graduation-cap"
                value={college}
                onChangeText={setCollege}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>City & Country</Text>
              <CustomInput
                placeholder="City, Country"
                icon="location"
                value={city}
                onChangeText={setCity}
              />
            </View>

            {showDeletePasswordInput ? (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm password to delete account</Text>
                <CustomInput
                  placeholder="Password"
                  icon="lock"
                  value={deletePassword}
                  onChangeText={setDeletePassword}
                  password
                />
                <View style={styles.deleteActions}>
                  <Pressable
                    style={styles.cancelDeleteButton}
                    onPress={() => {
                      setShowDeletePasswordInput(false);
                      setDeletePassword('');
                    }}>
                    <Text style={styles.cancelDeleteText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={styles.confirmDeleteButton}
                    onPress={() => performAccountDeletion(deletePassword)}>
                    <Text style={styles.confirmDeleteText}>Confirm Delete</Text>
                  </Pressable>
                </View>
              </View>
            ) : null}

            <Pressable style={styles.signOutButton} onPress={handleSignOut}>
              <MaterialCommunityIcons name="power" size={20} color={COLORS.white} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </Pressable>

            <Pressable style={styles.deleteAccountButton} onPress={handleDeleteAccount}>
              <MaterialCommunityIcons name="delete" size={20} color={COLORS.white} />
              <Text style={styles.deleteAccountText}>Delete Account</Text>
            </Pressable>

            <CustomButton
              text={verified ? 'Update Profile' : 'Save Profile'}
              type="primary"
              onPress={onPressSave}
            />
          </View>
        </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'android' ? 120 : 24,
  },
  contentContainer: {
    width: '90%',
    alignSelf: 'center',
    paddingTop: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  mainText: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.black,
  },
  aboutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.inputTextBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.darkGrey,
  },
  aboutButtonText: {
    color: COLORS.textGrey,
    fontSize: 14,
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    color: COLORS.textGrey,
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  signOutButton: {
    width: '100%',
    marginTop: 20,
    marginBottom: 24,
    backgroundColor: COLORS.lightOrange,
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutText: {
    color: COLORS.white,
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteAccountButton: {
    width: '100%',
    marginBottom: 24,
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteAccountText: {
    color: COLORS.white,
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  cancelDeleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelDeleteText: {
    color: COLORS.textGrey,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmDeleteButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  confirmDeleteText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
