import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { CustomButton } from '@/components/custom-button';
import { CustomInput } from '@/components/inputs/custom-input';
import { KeyboardAwareScrollView } from '@/components/keyboard-aware-scroll-view';
import { COLORS } from '@/constants/colors';
import { auth, storeUserData } from '@/services/firebase-functions';

export default function ProfileCompletionScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [city, setCity] = useState('');
  const [cnic, setCnic] = useState('');

  const onPressContinue = async () => {
    try {
      const user = auth().currentUser;

      if (!user) {
        Alert.alert('Error', 'Please sign in to complete your profile.');
        return;
      }

      const stored = await storeUserData(
        user,
        false,
        phone,
        college,
        city,
        name,
        cnic,
        null,
      );

      if (stored) {
        router.replace('/(tabs)' as Href);
      } else {
        Alert.alert('Error', 'User Details Not Stored');
      }
    } catch (error) {
      console.error('Error storing data:', error);
      Alert.alert('Error', 'User Details Not Stored');
    }
  };

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}>
      <View style={styles.contentContainer}>
        <Text style={styles.mainText}>Let&apos;s go!</Text>

        <View style={styles.innerContent}>
          <Text style={styles.label}>Full Name</Text>
          <CustomInput placeholder="Your Name" icon="user" value={name} onChangeText={setName} />
        </View>

        <View style={styles.innerContent}>
          <Text style={styles.label}>Phone Number</Text>
          <CustomInput
            placeholder="Country code & mobile number"
            icon="phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.innerContent}>
          <Text style={styles.label}>PMDC/CNIC</Text>
          <CustomInput placeholder="PMDC/CNIC" icon="v-card" value={cnic} onChangeText={setCnic} />
        </View>

        <View style={styles.innerContent}>
          <Text style={styles.label}>College/Degree</Text>
          <CustomInput
            placeholder="College & degree"
            icon="graduation-cap"
            value={college}
            onChangeText={setCollege}
          />
        </View>

        <View style={styles.innerContent}>
          <Text style={styles.label}>City & Country</Text>
          <CustomInput
            placeholder="City, Country"
            icon="location"
            value={city}
            onChangeText={setCity}
          />
        </View>

        <CustomButton text="Continue" type="primary" onPress={onPressContinue} />
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  contentContainer: {
    width: '100%',
    alignItems: 'flex-start',
    gap: 4,
  },
  innerContent: {
    width: '100%',
    marginTop: 20,
    gap: 8,
  },
  label: {
    color: COLORS.textColorPrimary,
    fontSize: 16,
  },
  mainText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: COLORS.black,
    alignSelf: 'flex-start',
  },
});
