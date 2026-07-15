import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as Linking from 'expo-linking';
import { type Href, useRouter } from 'expo-router';
import type { RefObject } from 'react';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { COLORS } from '@/constants/colors';
import {
  auth,
  checkCodeStatus,
  isProfileComplete,
  markCodeAsUsed,
  updateUserVerification,
} from '@/services/firebase-functions';
import { RevenueCatService } from '@/services/revenue-cat';

const WHATSAPP_URL =
  'https://api.whatsapp.com/send?phone=+9203175193394&text=Hello.%20I%20have%20installed%20Doctor%20Oncall%20App.%20How%20I%20can%20get%20premium%20access%20to%20all%20drugs%20and%20diseases%20?%20';

type PaymentSheetProps = {
  sheetRef: RefObject<BottomSheetModal | null>;
  onRefresh: () => void;
};

export function PaymentSheet({ sheetRef, onRefresh }: PaymentSheetProps) {
  const [isCodeCorrect, setIsCodeCorrect] = useState(false);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const closeSheet = () => {
    sheetRef.current?.dismiss();
  };

  const checkUserProfile = async () => {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) {
        Alert.alert('Sign in required', 'Please sign in before making a payment.');
        return false;
      }

      const complete = await isProfileComplete(userId);
      if (!complete) {
        Alert.alert(
          'Complete Profile Required',
          'Please complete your profile details before making a payment.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: closeSheet,
            },
            {
              text: 'Complete Profile',
              onPress: () => {
                closeSheet();
                router.push('/profile' as Href);
              },
            },
          ],
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking user profile:', error);
      return false;
    }
  };

  const onPressContactUs = async () => {
    const profileComplete = await checkUserProfile();
    if (!profileComplete) {
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(WHATSAPP_URL);
      if (canOpen) {
        await Linking.openURL(WHATSAPP_URL);
      } else {
        Alert.alert('Error', 'Make sure WhatsApp is installed on your device');
      }
    } catch {
      Alert.alert('Error', 'Make sure WhatsApp is installed on your device');
    }
  };

  const onPressSubscribe = async () => {
    const profileComplete = await checkUserProfile();
    if (!profileComplete) {
      return;
    }

    closeSheet();
    router.push('/paywall');
  };

  const onPressRestore = async () => {
    const profileComplete = await checkUserProfile();
    if (!profileComplete) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await RevenueCatService.restorePurchases();
      if (result.success && result.hasEntitlement && result.customerInfo) {
        await RevenueCatService.syncVerificationFromCustomerInfo(result.customerInfo);
        onRefresh();
        closeSheet();
        Alert.alert('Restored', 'Your subscription has been restored.');
      } else {
        Alert.alert('No Active Purchase', 'No active subscription found.');
      }
    } catch {
      Alert.alert('Restore Error', 'Could not restore purchases.');
    } finally {
      setIsLoading(false);
    }
  };

  const onPressVerify = async () => {
    const profileComplete = await checkUserProfile();
    if (!profileComplete) {
      return;
    }

    if (!code.trim()) {
      Alert.alert('Error', 'Please enter a verification code');
      return;
    }

    const userId = auth().currentUser?.uid;
    if (!userId) {
      Alert.alert('Sign in required', 'Please sign in to verify your code.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await checkCodeStatus(code);
      if (!response.success) {
        Alert.alert('Error', response.message);
        setIsCodeCorrect(true);
      } else {
        await markCodeAsUsed(code);

        const today = new Date();
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 3);

        await updateUserVerification(userId, true, today, expiryDate);
        onRefresh();
        closeSheet();
        Alert.alert('Success', 'Your account has been verified successfully for 3 months!');
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      Alert.alert('Error', 'Failed to verify your account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BottomSheetView style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Verifying your code...</Text>
          </View>
        </View>
      ) : null}

      <View style={isLoading ? styles.contentBlurred : undefined}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Unlock Full Access!</Text>
          <Pressable onPress={closeSheet} disabled={isLoading}>
            <MaterialCommunityIcons
              name="close"
              color={isLoading ? COLORS.textGrey : COLORS.black}
              size={24}
            />
          </Pressable>
        </View>

        <Text style={styles.paraText}>
          Unlock all categories and diseases with premium access. If you have a Valid scratch code
          present on inner side of front cover of Doctor OnCall Book 4 Month Otherwise, you can
          subscribe using in-app purchase. App linked to your email.
        </Text>

        <View style={styles.contactContainer}>
          <View style={styles.contactRight}>
            <Text style={styles.contactMainText}>Upgrade to Premium</Text>
            <Text style={styles.contactNormText}>
              Buy in-app subscription or restore your purchase.
            </Text>
          </View>
          <View style={styles.contactLeft}>
            <Pressable
              style={[styles.contactButton, isLoading && styles.buttonDisabled]}
              onPress={onPressSubscribe}
              disabled={isLoading}>
              <Text style={styles.contactButtonText}>Subscribe</Text>
            </Pressable>
            <Pressable
              style={[styles.restoreButton, isLoading && styles.buttonDisabled]}
              onPress={onPressRestore}
              disabled={isLoading}>
              <Text style={styles.restoreButtonText}>Restore</Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={onPressContactUs}
          style={styles.contactUsFallback}
          disabled={isLoading}>
          <Text style={styles.contactUsFallbackText}>Need help? Contact us on WhatsApp</Text>
        </Pressable>

        <View style={styles.codeSection}>
          <Text style={styles.haveCodeText}>Have a code?</Text>
          <View style={styles.textinputContainer}>
            <MaterialCommunityIcons name="form-textbox-password" color={COLORS.primary} size={20} />
            <BottomSheetTextInput
              placeholder="Enter code here"
              style={styles.textinput}
              placeholderTextColor={COLORS.textGrey}
              value={code}
              onChangeText={setCode}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            <Pressable
              style={[styles.verifyButton, isLoading && styles.verifyButtonDisabled]}
              onPress={onPressVerify}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.verifyButtonText}>Verify</Text>
              )}
            </Pressable>
          </View>
          {isCodeCorrect ? (
            <Text style={styles.wrongCodeText}>Invalid code. Please try again.</Text>
          ) : null}
        </View>
      </View>
    </BottomSheetView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black,
  },
  paraText: {
    fontSize: 16,
    color: COLORS.textGrey,
    lineHeight: 24,
    marginBottom: 20,
  },
  contactContainer: {
    width: '100%',
    backgroundColor: '#EBFFE8',
    borderWidth: 1,
    borderColor: '#A7D3FE',
    padding: 16,
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 24,
  },
  contactRight: {
    flex: 1,
    marginRight: 16,
  },
  contactLeft: {
    justifyContent: 'center',
  },
  contactMainText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF9327',
    marginBottom: 4,
  },
  contactNormText: {
    fontSize: 14,
    color: COLORS.textGrey,
    lineHeight: 20,
  },
  contactButton: {
    backgroundColor: '#27EF9B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 100,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
  },
  restoreButton: {
    marginTop: 8,
    borderColor: COLORS.primary,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 100,
    backgroundColor: COLORS.white,
  },
  restoreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
  },
  contactUsFallback: {
    marginTop: -12,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  contactUsFallbackText: {
    color: COLORS.textGrey,
    textDecorationLine: 'underline',
  },
  codeSection: {
    width: '100%',
  },
  haveCodeText: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textinputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#D8DADC',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  textinput: {
    flex: 1,
    color: COLORS.black,
    fontSize: 16,
    marginHorizontal: 8,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
  },
  verifyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  verifyButtonDisabled: {
    opacity: 0.7,
  },
  verifyButtonText: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: '600',
  },
  wrongCodeText: {
    color: '#EA452F',
    fontSize: 14,
    marginTop: 8,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textGrey,
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contentBlurred: {
    opacity: 0.6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
