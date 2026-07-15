import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CustomButton } from '@/components/custom-button';
import { CustomInput } from '@/components/inputs/custom-input';
import { KeyboardAwareScrollView } from '@/components/keyboard-aware-scroll-view';
import { COLORS } from '@/constants/colors';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const onPressConfirm = () => {
    router.replace('/auth/login' as Href);
  };

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}>
      <View style={styles.contentContainer}>
        <Text style={styles.mainText}>Reset Password</Text>
        <Text style={styles.subText}>Create new password now</Text>

        <CustomInput
          placeholder="Password"
          icon="shield"
          value={password}
          onChangeText={setPassword}
          password
        />

        <CustomInput
          placeholder="Re-enter password"
          icon="shield"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          password
        />

        <CustomButton text="Confirm & Create" type="primary" onPress={onPressConfirm} />
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
