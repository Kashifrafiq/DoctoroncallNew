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
        Alert.alert(
          'Success',
          'Your account has been verified successfully. Enjoy 3 months of free premium access!',
        );
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
            <Text style={styles.loadingText}>Please wait...</Text>
          </View>
        </View>
      ) : null}

      <View style={isLoading ? styles.contentBlurred : undefined}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Unlock Full Access</Text>
          <Pressable onPress={closeSheet} disabled={isLoading} hitSlop={12}>
            <MaterialCommunityIcons
              name="close"
              color={isLoading ? COLORS.textGrey : COLORS.black}
              size={24}
            />
          </Pressable>
        </View>

        <Text style={styles.paraText}>
          Get unlimited access to all diseases and drugs. Choose a plan, or use a book scratch code
          below.
        </Text>

        <View style={styles.subscribeCard}>
          <View style={styles.subscribeBadge}>
            <MaterialCommunityIcons name="crown" size={16} color={COLORS.white} />
            <Text style={styles.subscribeBadgeText}>Recommended</Text>
          </View>
          <Text style={styles.subscribeTitle}>Subscription plans</Text>
          <Text style={styles.subscribeSubtitle}>
            See monthly and quarterly options, then unlock instantly.
          </Text>
          <Pressable
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
            onPress={onPressSubscribe}
            disabled={isLoading}>
            <Text style={styles.primaryButtonText}>View Subscription Plans</Text>
            <MaterialCommunityIcons name="arrow-right" size={22} color={COLORS.white} />
          </Pressable>
          <Pressable
            style={[styles.restoreButton, isLoading && styles.buttonDisabled]}
            onPress={onPressRestore}
            disabled={isLoading}>
            <Text style={styles.restoreButtonText}>Already subscribed? Restore purchase</Text>
          </Pressable>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.codeSection}>
          <View style={styles.codeHeaderRow}>
            <Text style={styles.haveCodeText}>Have a book scratch code?</Text>
            <View style={styles.freeAccessBadge}>
              <MaterialCommunityIcons name="gift-outline" size={14} color={COLORS.buttonSecondary} />
              <Text style={styles.freeAccessBadgeText}>3 months free</Text>
            </View>
          </View>
          <View style={styles.codeBenefitCard}>
            <MaterialCommunityIcons name="book-open-page-variant" size={20} color={COLORS.primary} />
            <Text style={styles.codeBenefitText}>
              Scratch codes from the Doctor On Call book unlock{' '}
              <Text style={styles.codeBenefitHighlight}>3 months of free premium access</Text>. Find
              the code on the inside front cover.
            </Text>
          </View>
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
                <Text style={styles.verifyButtonText}>Verify code</Text>
              )}
            </Pressable>
          </View>
          {isCodeCorrect ? (
            <Text style={styles.wrongCodeText}>Invalid code. Please try again.</Text>
          ) : null}
        </View>

        <Pressable
          onPress={onPressContactUs}
          style={styles.contactUsFallback}
          disabled={isLoading}>
          <MaterialCommunityIcons name="whatsapp" size={18} color={COLORS.textGrey} />
          <Text style={styles.contactUsFallbackText}>Need help? Contact us on WhatsApp</Text>
        </Pressable>
      </View>
    </BottomSheetView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.black,
  },
  paraText: {
    fontSize: 15,
    color: COLORS.textGrey,
    lineHeight: 22,
    marginBottom: 18,
  },
  subscribeCard: {
    width: '100%',
    backgroundColor: '#FFF8F0',
    borderWidth: 1.5,
    borderColor: COLORS.banner,
    padding: 18,
    borderRadius: 14,
    marginBottom: 8,
  },
  subscribeBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.banner,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  subscribeBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  subscribeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 4,
  },
  subscribeSubtitle: {
    fontSize: 14,
    color: COLORS.textGrey,
    lineHeight: 20,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: COLORS.banner,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 54,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
  restoreButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  restoreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#D8DADC',
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.greyLight,
    textTransform: 'uppercase',
  },
  contactUsFallback: {
    marginTop: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactUsFallbackText: {
    color: COLORS.textGrey,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  codeSection: {
    width: '100%',
  },
  codeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },
  haveCodeText: {
    flex: 1,
    color: COLORS.black,
    fontSize: 16,
    fontWeight: '600',
  },
  freeAccessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EAF7E3',
    borderWidth: 1,
    borderColor: '#B7E0A8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  freeAccessBadgeText: {
    color: COLORS.buttonSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  codeBenefitCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#F3FAFF',
    borderWidth: 1,
    borderColor: '#C9E7F8',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  codeBenefitText: {
    flex: 1,
    color: COLORS.textGrey,
    fontSize: 13,
    lineHeight: 19,
  },
  codeBenefitHighlight: {
    color: COLORS.black,
    fontWeight: '700',
  },
  textinputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#D8DADC',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
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
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  verifyButtonDisabled: {
    opacity: 0.7,
  },
  verifyButtonText: {
    color: COLORS.white,
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
